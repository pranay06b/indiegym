/*
  Muscle Taxonomy — derived from data_jefit_enriched_v2.js
  ------------------------------------------------------------------
  The source dataset tags every exercise with a broad muscle group
  (the "muscles" field — e.g. "Chest", "Back", "Shoulders" — 11
  groups total, covering 1222 exercises) and, for a smaller verified
  subset, a specific "primeMover" muscle (e.g. "Pectoralis Major",
  "Anterior Deltoids", "Biceps Brachii").

  This file expands each of those 11 broad groups into its standard
  anatomical sub-parts/heads (the level of detail the raw data
  doesn't itself carry, e.g. Chest -> Upper/Middle/Lower). Where the
  dataset's primeMover values already identify a specific head
  (Anterior/Lateral/Posterior Deltoids, Biceps/Triceps Brachii,
  Gluteus Maximus/Medius, etc.) that name is reused directly so this
  taxonomy stays consistent with the dataset's own vocabulary.

  exerciseCount = number of exercises in the dataset tagged with
  that broad "muscles" group (context only, not a per-part count —
  the raw data isn't granular enough to split counts by head).
*/
window.MUSCLE_TAXONOMY = {
  "Chest": {
    exerciseCount: 171,
    primeMovers: ["Pectoralis Major"],
    parts: [
      { name: "Upper Chest (Clavicular Head)", muscle: "Pectoralis Major – Clavicular Head", notes: "Targeted by incline pressing/fly movements" },
      { name: "Middle Chest (Sternal Head)", muscle: "Pectoralis Major – Sternal Head", notes: "Targeted by flat pressing/fly movements" },
      { name: "Lower Chest (Abdominal/Costal Head)", muscle: "Pectoralis Major – Abdominal (Costal) Head", notes: "Targeted by decline pressing/dips" }
    ]
  },

  "Back": {
    exerciseCount: 314,
    primeMovers: ["Latissimus Dorsi", "Upper Trapezius", "Erector Spinae"],
    parts: [
      { name: "Lats (Latissimus Dorsi)", muscle: "Latissimus Dorsi", notes: "Width — pulldowns, pull-ups, rows" },
      { name: "Upper Traps", muscle: "Upper Trapezius", notes: "Shrugs, upright rows" },
      { name: "Mid Traps & Rhomboids", muscle: "Trapezius (middle) / Rhomboids", notes: "Horizontal rows, face pulls" },
      { name: "Lower Traps", muscle: "Trapezius (lower)", notes: "Y-raises, pull-ups" },
      { name: "Teres Major / Minor", muscle: "Teres Major & Minor", notes: "Assists lat-driven pulling movements" },
      { name: "Lower Back (Spinal Erectors)", muscle: "Erector Spinae", notes: "Deadlifts, back extensions, good mornings" }
    ]
  },

  "Shoulders": {
    exerciseCount: 401,
    primeMovers: ["Anterior Deltoids", "Lateral Deltoids", "Posterior Deltoids"],
    parts: [
      { name: "Front Delt (Anterior Head)", muscle: "Anterior Deltoids", notes: "Front raises, overhead/incline pressing" },
      { name: "Side Delt (Lateral Head)", muscle: "Lateral Deltoids", notes: "Lateral raises — main width driver" },
      { name: "Rear Delt (Posterior Head)", muscle: "Posterior Deltoids", notes: "Rear-delt flyes, face pulls, reverse pec-deck" },
      { name: "Rotator Cuff", muscle: "Supraspinatus / Infraspinatus / Teres Minor / Subscapularis", notes: "Internal/external rotation work" }
    ]
  },

  "Biceps": {
    exerciseCount: 167,
    primeMovers: ["Biceps Brachii", "Brachioradialis"],
    parts: [
      { name: "Long Head (Outer Bicep)", muscle: "Biceps Brachii – Long Head", notes: "Peak — incline curls, drag curls" },
      { name: "Short Head (Inner Bicep)", muscle: "Biceps Brachii – Short Head", notes: "Thickness — preacher/spider curls" },
      { name: "Brachialis", muscle: "Brachialis", notes: "Underlies biceps — hammer curls, reverse curls" }
    ]
  },

  "Triceps": {
    exerciseCount: 226,
    primeMovers: ["Triceps Brachii"],
    parts: [
      { name: "Long Head", muscle: "Triceps Brachii – Long Head", notes: "Overhead extensions (stretched position)" },
      { name: "Lateral Head", muscle: "Triceps Brachii – Lateral Head", notes: "Pushdowns, close-grip pressing — horseshoe shape" },
      { name: "Medial Head", muscle: "Triceps Brachii – Medial Head", notes: "Active across most triceps movements" }
    ]
  },

  "Forearms": {
    exerciseCount: 129,
    primeMovers: ["Brachioradialis"],
    parts: [
      { name: "Wrist Flexors (Inner Forearm)", muscle: "Flexor Carpi Radialis / Ulnaris", notes: "Wrist curls" },
      { name: "Wrist Extensors (Outer Forearm)", muscle: "Extensor Carpi Radialis / Ulnaris", notes: "Reverse wrist curls" },
      { name: "Brachioradialis", muscle: "Brachioradialis", notes: "Hammer curls, reverse curls" },
      { name: "Grip Muscles", muscle: "Flexor Digitorum Profundus/Superficialis", notes: "Farmer's carries, grip/plate work" }
    ]
  },

  "Abs": {
    exerciseCount: 339,
    primeMovers: ["Rectus Abdominis", "Obliques"],
    parts: [
      { name: "Upper Abs", muscle: "Rectus Abdominis (upper fibers)", notes: "Crunches, cable crunches" },
      { name: "Lower Abs", muscle: "Rectus Abdominis (lower fibers)", notes: "Leg/knee raises, reverse crunches" },
      { name: "Obliques (Side Abs)", muscle: "External & Internal Obliques", notes: "Rotational/anti-rotation work, side bends" },
      { name: "Deep Core", muscle: "Transverse Abdominis", notes: "Planks, anti-extension bracing" }
    ]
  },

  "Glutes": {
    exerciseCount: 253,
    primeMovers: ["Gluteus Maximus", "Gluteus Medius"],
    parts: [
      { name: "Gluteus Maximus", muscle: "Gluteus Maximus", notes: "Main mass/power — hip thrusts, squats, lunges" },
      { name: "Gluteus Medius", muscle: "Gluteus Medius", notes: "Hip abduction, lateral stability — side steps, clamshells" },
      { name: "Gluteus Minimus", muscle: "Gluteus Minimus", notes: "Assists medius in abduction/stabilization" }
    ]
  },

  "Upper Legs": {
    exerciseCount: 309,
    primeMovers: ["Quadriceps Femoris", "Biceps Femoris"],
    parts: [
      { name: "Quadriceps – Rectus Femoris", muscle: "Rectus Femoris", notes: "Crosses hip and knee — leg extensions, squats" },
      { name: "Quadriceps – Vastus Lateralis", muscle: "Vastus Lateralis", notes: "Outer sweep of the quad" },
      { name: "Quadriceps – Vastus Medialis", muscle: "Vastus Medialis (VMO)", notes: "Inner quad, knee stability — deep squat ROM" },
      { name: "Quadriceps – Vastus Intermedius", muscle: "Vastus Intermedius", notes: "Deep quad layer, general knee extension" },
      { name: "Hamstrings – Biceps Femoris", muscle: "Biceps Femoris", notes: "Outer hamstring — leg curls, RDLs" },
      { name: "Hamstrings – Semitendinosus/Semimembranosus", muscle: "Semitendinosus & Semimembranosus", notes: "Inner hamstring — RDLs, glute-ham raises" },
      { name: "Adductors (Inner Thigh)", muscle: "Adductor Magnus/Longus/Brevis", notes: "Sumo squats, adduction machine" },
      { name: "Abductors (Outer Thigh)", muscle: "Tensor Fasciae Latae / Gluteus Medius", notes: "Abduction machine, lateral band walks" }
    ]
  },

  "Lower Legs": {
    exerciseCount: 161,
    primeMovers: ["Gastrocnemius", "Soleus"],
    parts: [
      { name: "Gastrocnemius – Medial Head", muscle: "Gastrocnemius (medial)", notes: "Standing calf raises — visible calf mass" },
      { name: "Gastrocnemius – Lateral Head", muscle: "Gastrocnemius (lateral)", notes: "Standing calf raises" },
      { name: "Soleus", muscle: "Soleus", notes: "Seated calf raises (knee bent isolates this)" },
      { name: "Tibialis Anterior (Shin)", muscle: "Tibialis Anterior", notes: "Toe raises/dorsiflexion work" }
    ]
  },

  "Cardio": {
    exerciseCount: 21,
    primeMovers: [],
    parts: [
      { name: "Cardiovascular System", muscle: "Heart & Vascular System (not a discrete muscle group)", notes: "Full-body conditioning — this dataset category groups cardio/conditioning exercises rather than a specific muscle" }
    ]
  }
};

// Convenience lookup: broad muscle group name -> array of part names only
window.MUSCLE_PARTS_BY_GROUP = Object.fromEntries(
  Object.entries(window.MUSCLE_TAXONOMY).map(([group, info]) => [
    group,
    info.parts.map(p => p.name)
  ])
);
