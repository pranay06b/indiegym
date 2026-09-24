#!/usr/bin/env python3
"""
add_videos.py - fill in missing "video" links in the Indiegym exercise data.js

WHAT IT DOES
  * Finds every exercise entry that has no "video" key.
  * Searches YouTube for a short demo of that exercise and keeps ONLY results
    whose real duration is strictly under 30 seconds (and at least 5 seconds).
  * Only accepts a result if its title contains the exercise's key words
    (and doesn't name a conflicting piece of equipment, e.g. "dumbbell" for a
    "barbell" exercise). Anything unsure is left blank and listed in the report.
  * Inserts a single line   "video": "https://youtu.be/<id>",   into each
    matched entry, in the same spot existing videos live (right after the
    "sources" array). NOTHING else in the file is edited, reformatted or removed.
  * Never overwrites your original: it writes a NEW file (default:
    data.with_videos.js) and then verifies that the only differences are the
    added "video" lines.

TWO SEARCH BACKENDS
  --backend ytdlp   (default) Uses the yt-dlp command-line tool. No API key and
                    no quota.   Install:  pip install yt-dlp
  --backend api     Uses the official YouTube Data API v3 (needs a key, via
                    --api-key or env var YOUTUBE_API_KEY). Each search costs
                    100 quota units and the free quota is 10,000/day, i.e.
                    roughly 50-100 exercises per day. Use --limit and re-run
                    daily; progress is saved.

RESUMABLE
  Results are saved to a cache file (video_cache.json) after every exercise, so
  you can stop (Ctrl-C) and re-run at any time. The output file and the CSV
  report are rebuilt from the cache on every run.

TYPICAL USE
  python add_videos.py data.js --limit 25      # small trial run first
  python add_videos.py data.js --workers 8     # faster (parallel searches)
  # open video_report.csv and spot-check the titles/links
  python add_videos.py data.js                 # finish the rest

  Then review video_report.csv (name, url, title, channel, duration, status).
  Rows with status "no_match" were left blank - add those by hand or re-run
  with --retry-no-match after tweaking.
"""
import argparse
import csv
import datetime
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.error
import urllib.parse
import urllib.request

MAX_SECONDS = 30      # video must be STRICTLY shorter than this
MIN_SECONDS = 5       # ignore ultra-short junk clips

STOP = {"the", "a", "an", "of", "with", "and", "on", "to", "for", "in"}
# Equipment / setup words: helpful if present in a title but not required.
SOFT = {"dumbbell", "barbell", "cable", "machine", "bodyweight", "body", "weight",
        "stability", "ball", "exercise", "medicine", "band", "resistance",
        "kettlebell", "smith", "ez", "bar", "lever"}
# If the exercise names one of these and the video title names a *different*
# one (and none of ours), the video is rejected.
EQUIP = {"dumbbell", "barbell", "cable", "kettlebell", "smith", "machine"}
# Words that turn an exercise into a *different* exercise. If the video title has
# one that the exercise name does not, the video is rejected (e.g. "Side plank"
# for "Plank").
VARIATION = {"side", "single", "one", "alternating", "incline", "decline", "reverse",
             "wide", "close", "narrow", "seated", "standing", "kneeling", "lying",
             "prone", "hanging", "jump", "sumo", "overhead", "behind", "lateral"}
BONUS_WORDS = ("how to", "form", "tutorial", "technique", "demo", "exercise")


class QuotaExceeded(Exception):
    pass


class SearchError(Exception):
    pass


# --------------------------------------------------------------------------
# Matching helpers
# --------------------------------------------------------------------------
def _stem(t):
    if re.search(r"(ches|shes|sses|xes)$", t):
        return t[:-2]
    if len(t) > 2 and t.endswith("s") and not t.endswith("ss"):
        return t[:-1]
    return t


def tokens(text):
    text = text.lower().replace("\u2019", "'")
    return [_stem(t) for t in re.findall(r"[a-z0-9]+", text) if t not in STOP]


def strip_parens(name):
    # also handles unclosed "(" that exists in some names
    return re.sub(r"\(.*?(\)|$)", " ", name).strip()


def relevance(name, title):
    """Return a score in (0,1.05] if the title plausibly shows this exercise, else None."""
    core = tokens(strip_parens(name)) or tokens(name)
    if not core:
        return None
    title_tokens = set(tokens(title))
    compact = re.sub(r"[^a-z0-9]", "", title.lower())   # catches "pullup", "situp"

    def has(t):
        return t in title_tokens or (len(t) >= 4 and t in compact)

    hard = [t for t in core if t not in SOFT] or core
    soft = [t for t in core if t in SOFT and t not in hard]
    hard_frac = sum(has(t) for t in hard) / len(hard)
    if len("".join(hard)) >= 5 and "".join(hard) in compact:   # "Pull-Up" -> "pullups"
        hard_frac = 1.0
    need = 1.0 if len(hard) < 5 else 0.8
    if hard_frac < need:
        return None

    all_name = set(tokens(name))                       # includes (parenthetical) words
    if (title_tokens & VARIATION) - all_name:
        return None                                    # different variation of the movement

    name_eq, title_eq = set(core) & EQUIP, title_tokens & EQUIP
    if name_eq and title_eq and not (name_eq & title_eq):
        return None                                    # wrong equipment

    soft_frac = (sum(has(t) for t in soft) / len(soft)) if soft else 1.0
    score = 0.8 * hard_frac + 0.2 * soft_frac
    if any(w in title.lower() for w in BONUS_WORDS):
        score += 0.05
    return score


def iso_to_seconds(iso):
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return None
    d, h, mi, s = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + s


# --------------------------------------------------------------------------
# Search backends: each returns [{"id","title","channel","duration"}, ...]
# --------------------------------------------------------------------------
def preflight_ytdlp(js_runtime=None):
    """Check yt-dlp's version and JS runtime; return extra CLI args for yt-dlp.

    Since yt-dlp 2025.11.12, YouTube support wants an external JavaScript runtime
    (Deno is used automatically; node/quickjs must be enabled with --js-runtimes)
    plus the yt-dlp-ejs package, and old yt-dlp versions tend to break.
    """
    exe = shutil.which("yt-dlp")
    if not exe:
        sys.exit("yt-dlp not found. Install it with:  pip install -U yt-dlp yt-dlp-ejs")
    extra, version = [], None
    try:
        out = subprocess.run([exe, "--version"], capture_output=True, text=True, timeout=30).stdout
        m = re.search(r"(\d{4})\.(\d{1,2})\.(\d{1,2})", out)
        if m:
            version = tuple(int(x) for x in m.groups())
    except (OSError, subprocess.SubprocessError):
        pass
    if version:
        age = (datetime.date.today() - datetime.date(*version)).days
        print(f"yt-dlp version {out.strip()} ({age} days old)")
        if age > 90:
            print("  !! This yt-dlp is old and may fail on YouTube. Update:  pip install -U yt-dlp yt-dlp-ejs")
    else:
        print("  (could not read the yt-dlp version)")
    new_enough = version is None or version >= (2025, 11, 12)

    if js_runtime:
        extra += ["--js-runtimes", js_runtime]
    elif shutil.which("deno"):
        print("JS runtime: deno found (enabled by default in yt-dlp).")
    elif shutil.which("node"):
        extra += ["--js-runtimes", "node"]
        print("JS runtime: no deno, using node (needs Node 22+).")
    elif shutil.which("qjs") or shutil.which("quickjs"):
        extra += ["--js-runtimes", "quickjs"]
        print("JS runtime: no deno, using quickjs.")
    else:
        print("  !! No JavaScript runtime (deno/node/quickjs) found. YouTube results may be slow, "
              "incomplete or fail.\n     Install Deno (macOS: brew install deno) and "
              "pip install -U yt-dlp yt-dlp-ejs")
    if extra and not new_enough:
        print("  !! Your yt-dlp is too old for --js-runtimes; update it. Skipping that option.")
        extra = []
    return extra


_PROCS, _PROCS_LOCK = set(), threading.Lock()


def kill_children():
    with _PROCS_LOCK:
        for p in list(_PROCS):
            try:
                p.kill()
            except OSError:
                pass


def search_ytdlp(query, n=20, timeout=90, extra=()):
    exe = shutil.which("yt-dlp")
    if not exe:
        sys.exit("yt-dlp not found. Install it with:  pip install yt-dlp   "
                 "(or use --backend api)")
    proc = subprocess.Popen(
        [exe, *extra, "--socket-timeout", "20", "--extractor-retries", "1",
         "--flat-playlist", "--dump-json", f"ytsearch{n}:{query}"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    with _PROCS_LOCK:
        _PROCS.add(proc)
    try:
        stdout, stderr = proc.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        proc.kill()
        _, err = proc.communicate()
        tail = " | ".join((err or "").strip().splitlines()[-3:])[-300:]
        raise SearchError(f"timed out after {timeout}s. yt-dlp said: {tail or '(nothing)'}")
    finally:
        with _PROCS_LOCK:
            _PROCS.discard(proc)
    out = []
    for line in stdout.splitlines():
        try:
            d = json.loads(line)
        except ValueError:
            continue
        if not d.get("id") or d.get("duration") is None:
            continue
        out.append({"id": d["id"], "title": d.get("title") or "",
                    "channel": d.get("channel") or d.get("uploader") or "",
                    "duration": float(d["duration"])})
    if not out and proc.returncode != 0:
        raise SearchError(" | ".join((stderr or "yt-dlp failed").strip().splitlines()[-3:])[-300:])
    return out


def _api_get(endpoint, params):
    url = f"https://www.googleapis.com/youtube/v3/{endpoint}?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        if e.code == 403 and "quota" in body.lower():
            raise QuotaExceeded(body[:200])
        raise SearchError(f"HTTP {e.code}: {body[:200]}")
    except urllib.error.URLError as e:
        raise SearchError(str(e))


def make_search_api(key):
    def search_api(query, n=25):
        res = _api_get("search", {"part": "snippet", "type": "video", "maxResults": n,
                                  "videoDuration": "short", "q": query, "key": key})
        ids = [i["id"]["videoId"] for i in res.get("items", []) if i.get("id", {}).get("videoId")]
        if not ids:
            return []
        det = _api_get("videos", {"part": "contentDetails,snippet", "id": ",".join(ids), "key": key})
        out = []
        for v in det.get("items", []):
            secs = iso_to_seconds(v["contentDetails"].get("duration"))
            if secs is None:
                continue
            out.append({"id": v["id"], "title": v["snippet"].get("title", ""),
                        "channel": v["snippet"].get("channelTitle", ""), "duration": float(secs)})
        return out
    return search_api


def find_video(name, search):
    clean = re.sub(r"\s+", " ", strip_parens(name)) or name
    for query in (f"{clean} exercise how to", f"{clean} form shorts"):
        best = None
        for c in search(query):
            if not (MIN_SECONDS <= c["duration"] < MAX_SECONDS):
                continue
            score = relevance(name, c["title"])
            if score is not None and (best is None or score > best[0]):
                best = (score, c)
        if best:
            c = best[1]
            return {"status": "matched", "url": f"https://youtu.be/{c['id']}",
                    "title": c["title"], "channel": c["channel"],
                    "duration": round(c["duration"], 1)}
    return {"status": "no_match"}


# --------------------------------------------------------------------------
# File handling (text-level so no byte outside the inserted lines changes)
# --------------------------------------------------------------------------
def read_text(path):
    with open(path, encoding="utf-8", newline="") as f:
        return f.read()


def parse_array(text):
    i = text.find("window.JEFIT_SCRAPED")
    j = text.find("[", i)
    k = text.rfind("]")
    return json.loads(text[j:k + 1])


def scan_entries(lines):
    """Return [{'name','has_video','anchor'}] where anchor = line index after which to insert."""
    entries, i = [], 0
    while i < len(lines):
        if lines[i].rstrip("\r\n") == "  {":
            j = i + 1
            while not re.fullmatch(r"  \},?", lines[j].rstrip("\r\n")):
                j += 1
            name, has_video, anchor = None, False, None
            for k in range(i + 1, j):
                ln = lines[k].rstrip("\r\n")
                m = re.fullmatch(r'    "name": (.*?),?', ln)
                if m and name is None:
                    name = json.loads(m.group(1))
                if ln.startswith('    "video":'):
                    has_video = True
                if ln == '    "sources": [':
                    e = k + 1
                    while lines[e].rstrip("\r\n") not in ("    ],", "    ]"):
                        e += 1
                    if lines[e].rstrip("\r\n") == "    ],":   # not the last key -> comma is right
                        anchor = e
            entries.append({"name": name, "has_video": has_video, "anchor": anchor})
            i = j
        i += 1
    return entries


def verify(old_text, new_text, added):
    """Prove the only differences are the added "video" lines."""
    old_l, new_l = old_text.splitlines(True), new_text.splitlines(True)
    if len(new_l) != len(old_l) + len(added):
        raise AssertionError("unexpected line count")
    a = 0
    for ln in new_l:                      # old lines must appear in order, unchanged
        if a < len(old_l) and ln == old_l[a]:
            a += 1
        elif not ln.lstrip().startswith('"video": "https://youtu.be/'):
            raise AssertionError(f"unexpected difference: {ln!r}")
    if a != len(old_l):
        raise AssertionError("some original lines were changed or removed")
    old_d, new_d = parse_array(old_text), parse_array(new_text)
    assert len(old_d) == len(new_d)
    for o, n in zip(old_d, new_d):
        n2 = dict(n)
        if "video" not in o:
            n2.pop("video", None)
        assert o == n2, f"data changed for {o.get('name')}"


# --------------------------------------------------------------------------
def diagnose(js_runtime, extractor_args="", ytdlp_args="", timeout=60):
    """Run ONE verbose search and show everything yt-dlp prints, to find out why it fails."""
    extra = preflight_ytdlp(js_runtime)
    if extractor_args:
        extra += ["--extractor-args", extractor_args]
    extra += shlex.split(ytdlp_args)
    exe = shutil.which("yt-dlp")
    cmd = [exe, *extra, "-v", "--socket-timeout", "20", "--flat-playlist", "--dump-json",
           "ytsearch3:pull up exercise"]
    print("\nRunning:", " ".join(cmd), "\n")
    t0 = time.time()
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    try:
        out, _ = proc.communicate(timeout=timeout)
        status = f"finished in {time.time() - t0:.1f}s (exit code {proc.returncode})"
    except subprocess.TimeoutExpired:
        proc.kill()
        out, _ = proc.communicate()
        status = f"STILL RUNNING after {timeout}s - killed it"
    n = sum(1 for ln in out.splitlines() if ln.startswith("{") and '"id"' in ln)
    shown = "\n".join(ln[:200] for ln in out.splitlines())
    print(shown, "\n\n=====", status, f"| {n} video result(s) parsed =====")
    print("Copy everything above this line and send it to get help.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", nargs="?", default="data.js")
    ap.add_argument("-o", "--output", help="default: <input>.with_videos.js")
    ap.add_argument("--backend", choices=["ytdlp", "api"], default="ytdlp")
    ap.add_argument("--api-key", default=os.environ.get("YOUTUBE_API_KEY"))
    ap.add_argument("--cache", default="video_cache.json")
    ap.add_argument("--report", default="video_report.csv")
    ap.add_argument("--limit", type=int, help="max exercises to search this run")
    ap.add_argument("--workers", type=int, default=6,
                    help="parallel searches (default 6; lower to 2-3 if YouTube starts erroring/429s)")
    ap.add_argument("--js-runtime", help='force a yt-dlp JS runtime, e.g. "node" or "deno:/path/to/deno"')
    ap.add_argument("--extractor-args", default="youtube:player_client=ios,web_embedded",
                    help='passed to yt-dlp as --extractor-args (default: "youtube:player_client=ios,web_embedded"; use "" to disable)')
    ap.add_argument("--ytdlp-args", default="",
                    help='extra flags passed straight to yt-dlp, e.g. "-4" (force IPv4) or '
                         '"--proxy http://host:port"')
    ap.add_argument("--diagnose", action="store_true",
                    help="run one verbose yt-dlp search and print everything, to debug failures")
    ap.add_argument("--no-preflight", action="store_true", help="skip the yt-dlp version / JS runtime check")
    ap.add_argument("--timeout", type=int, default=90, help="seconds before a single search is abandoned")
    ap.add_argument("--delay", type=float, default=0.5, help="seconds each worker pauses between searches")
    ap.add_argument("--retry-no-match", action="store_true")
    ap.add_argument("--dry-run", action="store_true", help="only count what is missing")
    a = ap.parse_args()
    if a.diagnose:
        diagnose(a.js_runtime, a.extractor_args, a.ytdlp_args)
        return

    out_path = a.output or re.sub(r"\.js$", "", a.input) + ".with_videos.js"
    if os.path.abspath(out_path) == os.path.abspath(a.input):
        sys.exit("Refusing to overwrite the input file; choose a different --output.")

    text = read_text(a.input)
    lines = text.splitlines(True)
    entries = scan_entries(lines)
    targets = [e for e in entries if not e["has_video"]]
    print(f"{len(entries)} entries, {len(targets)} without a video.")
    if a.dry_run:
        return

    cache = {}
    if os.path.exists(a.cache):
        with open(a.cache, encoding="utf-8") as f:
            cache = json.load(f)

    if a.backend == "api":
        if not a.api_key:
            sys.exit("--backend api needs --api-key or YOUTUBE_API_KEY")
        search = make_search_api(a.api_key)
    else:
        extra = [] if a.no_preflight else preflight_ytdlp(a.js_runtime)
        if a.extractor_args:
            extra += ["--extractor-args", a.extractor_args]
        extra += shlex.split(a.ytdlp_args)
        search = lambda q: search_ytdlp(q, timeout=a.timeout, extra=extra)

    todo = [e for e in targets if e["name"] not in cache
            or (a.retry_no_match and cache[e["name"]]["status"] == "no_match")]
    if a.limit:
        todo = todo[:a.limit]
    print(f"Searching {len(todo)} exercises ({len(targets) - len(todo)} already cached / skipped)...")

    def work(e):
        res = find_video(e["name"], search)
        time.sleep(a.delay)
        return res

    t0, done, errors = time.time(), 0, 0
    ex = ThreadPoolExecutor(max_workers=max(1, a.workers))
    futs = {ex.submit(work, e): e for e in todo}
    try:
        for fut in as_completed(futs):
            e, done = futs[fut], done + 1
            try:
                res = fut.result()
            except QuotaExceeded:
                print("\nYouTube API quota exhausted - progress saved. Re-run tomorrow.")
                break
            except Exception as err:      # SearchError, OSError, etc: skip, retry next run
                errors += 1
                print(f"[{done}/{len(todo)}] {e['name']}: search error ({err}); will retry next run")
                if errors == 5:
                    print("  >> Several errors - YouTube may be throttling. Consider Ctrl-C and re-run "
                          "with fewer --workers (e.g. 3).")
                continue
            cache[e["name"]] = res
            with open(a.cache, "w", encoding="utf-8") as f:
                json.dump(cache, f, indent=1, ensure_ascii=False)
            eta = (time.time() - t0) / done * (len(todo) - done) / 60
            tag = (f"{res['url']}  ({res['duration']}s) {res['title'][:45]}"
                   if res["status"] == "matched" else "no match")
            print(f"[{done}/{len(todo)}] (~{eta:.0f} min left) {e['name']}: {tag}")
    except KeyboardInterrupt:
        print("\nInterrupted - stopping running searches; progress saved.")
        ex.shutdown(wait=False, cancel_futures=True)
        kill_children()
    finally:
        ex.shutdown(wait=False, cancel_futures=True)

    # ---- build output from cache -------------------------------------------------
    insert, skipped_no_anchor = {}, []
    for e in targets:
        r = cache.get(e["name"])
        if r and r["status"] == "matched":
            if e["anchor"] is None:
                skipped_no_anchor.append(e["name"])
                continue
            nl = "\r\n" if lines[e["anchor"]].endswith("\r\n") else "\n"
            insert[e["anchor"]] = f'    "video": {json.dumps(r["url"])},{nl}'
    new_lines = []
    for idx, ln in enumerate(lines):
        new_lines.append(ln)
        if idx in insert:
            new_lines.append(insert[idx])
    new_text = "".join(new_lines)
    verify(text, new_text, list(insert.values()))
    with open(out_path, "w", encoding="utf-8", newline="") as f:
        f.write(new_text)

    # ---- report -------------------------------------------------------------------
    seen = {}
    for r in cache.values():
        if r["status"] == "matched":
            seen[r["url"]] = seen.get(r["url"], 0) + 1
    with open(a.report, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["name", "status", "url", "title", "channel", "duration_s", "note"])
        for e in targets:
            r = cache.get(e["name"], {"status": "not_searched"})
            note = "same video used for several exercises" if r.get("url") and seen[r["url"]] > 1 else ""
            w.writerow([e["name"], r["status"], r.get("url", ""), r.get("title", ""),
                        r.get("channel", ""), r.get("duration", ""), note])

    matched = len(insert)
    nomatch = sum(1 for e in targets if cache.get(e["name"], {}).get("status") == "no_match")
    pending = sum(1 for e in targets if e["name"] not in cache)
    print(f"\nWrote {out_path}: added {matched} video links; verified nothing else changed.")
    print(f"No match: {nomatch}   Not yet searched: {pending}   Report: {a.report}")
    if skipped_no_anchor:
        print("Could not place (unexpected layout):", skipped_no_anchor)


if __name__ == "__main__":
    main()
