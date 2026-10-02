/*
  Indiegym exercise library (enriched v2 - FFDB matched)
  ------------------------------------------------------------------
  Source
    JEFIT exercise database (GIFs, instructions)          source: "JEFIT"
    Functional Fitness Exercise Database v2.9 (matched attributes)
  Total entries: 1222

  Enrichment note
    Fields added for hypertrophy-focused workout programming:
      exerciseType, unilateral, isometric, rangeOfMotion,
      mechanicalEmphasis, sets, repRange, restSeconds, tempo,
      intensity, progressionScheme, ffdbMatch

    New attributes pulled in from the Functional Fitness Database
    where a confident name match was found: targetMuscleGroup,
    secondaryMuscle, tertiaryMuscle, movement (patterns, up to 3),
    planesOfMotion (up to 3), posture, grip, singleOrDoubleArm,
    armAction, legAction, loadPosition, footElevation,
    isCombinationExercise, primaryEquipmentCount, secondaryEquipment,
    secondaryEquipmentCount, mechanics, laterality, classification,
    force, skillLevel, bodyRegion.

    Each entry's `ffdbMatch` field records provenance:
      confidence "exact"            - name matched an FFDB entry exactly
                                       after normalization (100 entries)
      confidence "fuzzy_verified"   - matched via fuzzy name matching,
                                       cross-checked against shared
                                       movement verb, compatible
                                       equipment, and overlapping target
                                       muscle before acceptance, then
                                       manually reviewed (13 entries)
      confidence "legacy_pre_matched" - mechanics/laterality/etc. were
                                       already present in the source
                                       JEFIT scrape from an earlier FFDB
                                       pass, but the name didn't resolve
                                       to a row in this v2.9 file
                                       (62 entries)
      matched: false                - no confident FFDB match found;
                                       all derived fields (exerciseType,
                                       repRange, restSeconds, tempo,
                                       intensity, progressionScheme) are
                                       rule-based estimates from name
                                       keywords and existing fields, not
                                       verified against FFDB (1047
                                       entries)

    175 of 1222 entries (14%) now carry verified FFDB attributes.
    The remaining 1047 use the same keyword-based inference as the
    prior enrichment pass -- treat those as reasonable defaults to
    program from, not verified values.

  Common-name enrichment
    Every entry now also carries:
      muscleAreas      - array of plain-English target sub-areas, one per
                          entry in "muscles" (e.g. "Upper Chest", "Lower Abs",
                          "Rear Delts"), derived from the same broad muscle
                          group + exercise-name keyword rules the app's
                          "Build a muscle" tab already uses to pick a specific
                          taxonomy part (see PART_MATCHERS / MUSCLE_TAXONOMY
                          in index.html and muscle_taxonomy.js).
      muscleAreaLabel   - muscleAreas joined with " / ", for quick display.
*/
window.JEFIT_SCRAPED = [
  {
    "name": "Cable Lat Pulldown (Wide Grip)",
    "muscles": [
      "Back",
      "Shoulders"
    ],
    "sets": 4,
    "rest": "",
    "difficulty": "intermediate",
    "instructions": "The wide-grip lat pulldown is one of the classic bodybuilding exercises used to help build a stronger back.\nSteps :\n1.) Start by sitting under a cable pull down machine that has a wide bar attachment and grab it with a wide overhand grip.\n2.) While keeping your abs drawn in and back straight, pull down the bar to your upper chest.\n3.) Hold for a count at the bottom position, squeeze your lats and then slowly return back to the starting position.",
    "gif": "https://cdn.jefit.com/assets/img/exercises/gifs/86.gif",
    "equipment": [
      "Strength Machine"
    ],
    "sourceUrl": "https://www.jefit.com/exercises/86/cable-lat-pulldown-wide-grip",
    "jefitId": 86,
    "source": "JEFIT",
    "sources": [
      "JEFIT",
      "Functional Fitness DB"
    ],
    "video": "https://youtu.be/UWhyxvCCzhw",
    "videoDeep": "https://youtu.be/83Y3CFcgnkQ",
    "primeMover": "Latissimus Dorsi",
    "supportMuscles": [
      "Biceps Brachii"
    ],
    "movement": [
      "Vertical Pull"
    ],
    "plane": [
      "Sagittal"
    ],
    "bodyRegion": "Upper Body",
    "force": "Pull",
    "laterality": "Bilateral",
    "posture": "Seated",
    "grip": "Pronated",
    "classification": "Bodybuilding",
    "mechanics": "Compound",
    "skillLevel": "Beginner",
    "exerciseType": "compound",
    "unilateral": false,
    "isometric": false,
    "rangeOfMotion": "full",
    "mechanicalEmphasis": "multi-joint movement distributing tension across several muscle groups (Vertical Pull)",
    "repRange": "6-10",
    "restSeconds": 90,
    "tempo": "2-1-2-0",
    "intensity": {
      "type": "RPE",
      "target": "6-8",
      "note": "Leave reps in reserve on working sets."
    },
    "progressionScheme": "double progression: add reps within range across sets, then increase load and reset to bottom of range",
    "ffdbMatch": {
      "matched": true,
      "ffdbExerciseName": null,
      "confidence": "legacy_pre_matched"
    },
    "muscleAreas": [
      "Lats",
      "Front Delts"
    ],
    "muscleAreaLabel": "Lats / Front Delts"
  },
  {
    "name": "Dumbbell Lateral Raise",
    "muscles": [
      "Shoulders"
    ],
    "sets": 3,
    "rest": "",
    "difficulty": "beginner",
    "instructions": "A Dumbbell Lateral Raise is an effective exercise for targeting the lateral deltoid muscles, which are located on the sides of your shoulders. Here\u2019s how you can perform the exercise correctly:\nSetup: \nStand with feet shoulder-width apart. This provides a stable base. Keep a slight bend in your knees for balance. Hold a dumbbell in each hand: Your arms should hang down by your sides with your palms facing your body (neutral grip). The dumbbells should be close to your thighs. \nEngage your core:\nTighten your abdominal muscles to maintain a stable torso throughout the movement.\nExecution:\nBegin the movement by raising your arms out to the sides until they are at shoulder height. Keep a slight bend in your elbows to reduce stress on your joints. Your palms should face the floor as you lift the weights.\nControl the movement:\nLift the weights in a controlled manner, avoiding momentum or swinging. Focus on using your lateral deltoid muscles to lift the weights.\nPause briefly at the top:\nOnce your arms reach shoulder height, pause for a brief moment. Ensure your shoulders are level and your body remains still.\nLower the dumbbells slowly:\nLower the weights back to the starting position in a controlled manner. Maintain the slight bend in your elbows and avoid letting the dumbbells drop quickly.",
    "gif": "https://cdn.jefit.com/assets/img/exercises/gifs/32.gif",
    "equipment": [
      "Dumbbell"
    ],
    "sourceUrl": "https://www.jefit.com/exercises/32/dumbbell-lateral-raise",
    "jefitId": 32,
    "source": "JEFIT",
    "sources": [
      "JEFIT",
      "Functional Fitness DB"
    ],
    "video": "https://youtu.be/XPPfnSEATJA",
    "videoDeep": "https://youtu.be/3VcKaXpzqRo",
    "primeMover": "Lateral Deltoids",
    "supportMuscles": [
      "Anterior Deltoids",
      "Trapezius"
    ],
    "movement": [
      "Shoulder Abduction"
    ],
    "plane": [
      "Frontal"
    ],
    "bodyRegion": "Upper Body",
    "force": "Push",
    "laterality": "Bilateral",
    "posture": "Standing",
    "grip": "Neutral",
    "classification": "Bodybuilding",
    "mechanics": "Isolation",
    "skillLevel": "Beginner",
    "exerciseType": "isolation",
    "unilateral": false,
    "isometric": false,
    "rangeOfMotion": "full",
    "mechanicalEmphasis": "single-joint movement isolating tension on the target muscle (Shoulder Abduction; Frontal Plane)",
    "repRange": "10-15",
    "restSeconds": 60,
    "tempo": "2-1-2-1",
    "intensity": {
      "type": "RPE",
      "target": "6-8",
      "note": "Leave reps in reserve on working sets."
    },
    "progressionScheme": "double progression with small load increments; prioritize mind-muscle connection and full ROM before adding weight",
    "ffdbMatch": {
      "matched": true,
      "ffdbExerciseName": "Double Dumbbell Lateral Raise",
      "confidence": "exact"
    },
    "secondaryMuscle": "Anterior Deltoids",
    "tertiaryMuscle": "Trapezius",
    "targetMuscleGroup": "Shoulders",
    "planesOfMotion": [
      "Frontal Plane"
    ],
    "singleOrDoubleArm": "Double Arm",
    "armAction": "Continuous",
    "legAction": "Continuous",
    "loadPosition": "Other",
    "footElevation": "No Elevation",
    "isCombinationExercise": false,
    "primaryEquipmentCount": 2,
    "secondaryEquipment": null,
    "secondaryEquipmentCount": 0,
    "muscleAreas": [
      "Side Delts"
    ],
    "muscleAreaLabel": "Side Delts"
  },
  {
    "name": "Barbell Bench Press",
    "muscles": [
      "Chest",
      "Triceps",
      "Shoulders"
    ],
    "sets": 4,
    "rest": "",
    "difficulty": "beginner",
    "instructions": "The barbell chest press, also known as the barbell bench press, is a fundamental exercise for building upper body strength, specifically targeting the pectoral muscles, triceps, and shoulders. Here\u2019s a step-by-step guide on how to perform it correctly:\nSetup:\nLoad the barbell with an appropriate amount of weight for your fitness level. Use safety clips to secure the weights. Lie down on the flat bench with your feet flat on the ground and your head, shoulders, and buttocks firmly pressed against the bench.\nHand Placement:\nGrip the barbell with both hands slightly wider than shoulder-width apart. Your palms should face forward, and your thumbs should be wrapped around the bar.\nStarting Position:\nUnrack the barbell by straightening your arms and moving the barbell over your chest. Your arms should be perpendicular to the floor.\nLowering the Barbell:\nInhale deeply and lower the barbell slowly and under control to your mid-chest. Your elbows should bend at about a 45-degree angle to your body. Lower the bar until it lightly touches your chest or is just above it. Do not bounce the bar off your chest.\nPressing the Barbell:\nExhale and press the barbell back up to the starting position by fully extending your arms. Focus on squeezing your chest muscles as you lift the weight. Keep your wrists straight and your elbows slightly tucked in to protect your shoulder joints.",
    "gif": "https://cdn.jefit.com/assets/img/exercises/gifs/2.gif",
    "equipment": [
      "Barbell"
    ],
    "sourceUrl": "https://www.jefit.com/exercises/2/barbell-bench-press",
    "jefitId": 2,
    "source": "JEFIT",
    "sources": [
      "JEFIT",
      "Functional Fitness DB"
    ],
    "video": "https://youtu.be/SCVCLChPQFY",
    "videoDeep": "https://youtu.be/rxD321l2svE",
    "primeMover": "Pectoralis Major",
    "supportMuscles": [
      "Triceps Brachii",
      "Anterior Deltoids"
    ],
    "movement": [
      "Horizontal Push"
    ],
    "plane": [
      "Sagittal"
    ],
    "bodyRegion": "Upper Body",
    "force": "Push",
    "laterality": "Bilateral",
    "posture": "Supine",
    "grip": "Pronated",
    "classification": "Powerlifting",
    "mechanics": "Compound",
    "skillLevel": "Novice",
    "exerciseType": "compound",
    "unilateral": false,
    "isometric": false,
    "rangeOfMotion": "full",
    "mechanicalEmphasis": "multi-joint movement distributing tension across several muscle groups (Horizontal Push; Sagittal Plane)",
    "repRange": "3-6",
    "restSeconds": 150,
    "tempo": "2-1-2-0",
    "intensity": {
      "type": "RPE",
      "target": "6-8",
      "note": "Leave reps in reserve on working sets."
    },
    "progressionScheme": "linear progression on the main lift; increase load session to session while reps stay low",
    "ffdbMatch": {
      "matched": true,
      "ffdbExerciseName": "Barbell Bench Press",
      "confidence": "exact"
    },
    "secondaryMuscle": "Triceps Brachii",
    "tertiaryMuscle": "Anterior Deltoids",
    "targetMuscleGroup": "Chest",
    "planesOfMotion": [
      "Sagittal Plane"
    ],
    "singleOrDoubleArm": "Double Arm",
    "armAction": "Continuous",
    "legAction": "Continuous",
    "loadPosition": "Above Chest",
    "footElevation": "No Elevation",
    "isCombinationExercise": false,
    "primaryEquipmentCount": 1,
    "secondaryEquipment": "Bench (Flat)",
    "secondaryEquipmentCount": 1,
    "muscleAreas": [
      "Middle Chest",
      "Triceps Medial Head",
      "Front Delts"
    ],
    "muscleAreaLabel": "Middle Chest / Triceps Medial Head / Front Delts"
  },
  {
    "name": "Machine Leg Extension",
    "muscles": [
      "Upper Legs"
    ],
    "sets": 3,
    "rest": "",
    "difficulty": "beginner",
    "instructions": "The leg extension exercise is a staple in weight lifting for building strong legs and overall body strength.\nSteps : \n1.) Begin by adjusting the seat of the leg extension bench so that your knees have a full range of motion and the footpad fits over your legs above your ankles.\n2.) Take hold of the machine handles, keeping your hips and back up against the bench, and slowly extend your legs until your legs are straight.\n3.) Hold this position for a count, then return back to the start.\n4.) Repeat for as many reps and sets as desired.\nTips : \n1.) Use controlled movements for this exercise, do not swing the weight up.\n2.) Refrain from locking your knees as this can result in injury.",
    "gif": "https://cdn.jefit.com/assets/img/exercises/gifs/130.gif",
    "equipment": [
      "Strength Machine"
    ],
    "sourceUrl": "https://www.jefit.com/exercises/130/machine-leg-extension",
    "jefitId": 130,
    "source": "JEFIT",
    "sources": [
      "JEFIT"
    ],
    "video": "https://youtu.be/4ZDm5EbiFI8",
    "exerciseType": "isolation",
    "unilateral": false,
    "isometric": false,
    "rangeOfMotion": "full",
    "mechanicalEmphasis": "single-joint movement isolating tension on the target muscle",
    "repRange": "10-15",
    "restSeconds": 60,
    "tempo": "2-1-2-1",
    "intensity": {
      "type": "RPE",
      "target": "6-8",
      "note": "Leave reps in reserve on working sets."
    },
    "progressionScheme": "double progression with small load increments; prioritize mind-muscle connection and full ROM before adding weight",
    "ffdbMatch": {
      "matched": false,
      "ffdbExerciseName": null,
      "confidence": null
    },
    "muscleAreas": [
      "Quads (Rectus Femoris)"
    ],
    "muscleAreaLabel": "Quads (Rectus Femoris)"
  },
  {
    "name": "Dumbbell Incline Bench Press",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "sets": 4,
    "rest": "",
    "difficulty": "beginner",
    "instructions": "The dumbbell incline bench press is an effective exercise for targeting the upper portion of the pectoral muscles, as well as the shoulders and triceps. Here are the steps to perform the exercise correctly:\nSet Up:\nAdjust the bench to an incline position (30-45 degrees). Sit on the bench with a dumbbell in each hand resting on your thighs. Use your legs to help lift the dumbbells as you lie back on the bench, keeping the dumbbells close to your chest.\nStarting Position:\nLie back on the bench with your feet flat on the floor for stability. Position the dumbbells at the sides of your chest, with your palms facing forward. Your elbows should be at a 90-degree angle.\nExecution:\nPush the dumbbells up toward the ceiling by extending your elbows and pressing the weights together until your arms are fully extended. Ensure your wrists remain straight and in line with your forearms. At the top of the movement, the dumbbells should be directly above your shoulders, and your arms should be nearly straight but not locked.\nLowering the Weight:\nSlowly lower the dumbbells back to the starting position with controlled movement. Your elbows should descend until the dumbbells are level with your chest.\nBreathing:\nInhale as you lower the dumbbells. Exhale as you press the dumbbells up.",
    "gif": "https://cdn.jefit.com/assets/img/exercises/gifs/31.gif",
    "equipment": [
      "Dumbbell"
    ],
    "sourceUrl": "https://www.jefit.com/exercises/31/dumbbell-incline-bench-press",
    "jefitId": 31,
    "source": "JEFIT",
    "sources": [
      "JEFIT",
      "Functional Fitness DB"
    ],
    "video": "https://youtu.be/7QUcsq019Qs",
    "videoDeep": "https://youtu.be/0G2_XV7slIg",
    "primeMover": "Pectoralis Major",
    "supportMuscles": [
      "Triceps Brachii"
    ],
    "movement": [
      "Horizontal Push"
    ],
    "plane": [
      "Sagittal"
    ],
    "bodyRegion": "Upper Body",
    "force": "Push",
    "laterality": "Bilateral",
    "posture": "Seated",
    "grip": "Pronated",
    "classification": "Bodybuilding",
    "mechanics": "Compound",
    "skillLevel": "Beginner",
    "exerciseType": "compound",
    "unilateral": false,
    "isometric": false,
    "rangeOfMotion": "full",
    "mechanicalEmphasis": "multi-joint movement distributing tension across several muscle groups (Horizontal Push; Sagittal Plane)",
    "repRange": "6-10",
    "restSeconds": 90,
    "tempo": "2-1-2-0",
    "intensity": {
      "type": "RPE",
      "target": "6-8",
      "note": "Leave reps in reserve on working sets."
    },
    "progressionScheme": "double progression: add reps within range across sets, then increase load and reset to bottom of range",
    "ffdbMatch": {
      "matched": true,
      "ffdbExerciseName": "Double Dumbbell Incline Bench Press",
      "confidence": "exact"
    },
    "secondaryMuscle": "Triceps Brachii",
    "tertiaryMuscle": null,
    "targetMuscleGroup": "Chest",
    "planesOfMotion": [
      "Sagittal Plane"
    ],
    "singleOrDoubleArm": "Double Arm",
    "armAction": "Continuous",
    "legAction": "Continuous",
    "loadPosition": "Above Chest",
    "footElevation": "No Elevation",
    "isCombinationExercise": false,
    "primaryEquipmentCount": 2,
    "secondaryEquipment": "Bench (Incline)",
    "secondaryEquipmentCount": 1,
    "muscleAreas": [
      "Upper Chest",
      "Front Delts",
      "Triceps Medial Head"
    ],
    "muscleAreaLabel": "Upper Chest / Front Delts / Triceps Medial Head"
  }
];
