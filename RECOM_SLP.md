# SLP Assessment Assistance Tool

## Overview

The speech assessment assistance tool is STRICTLY limited as an assistance tool only and will always be validated by clinicians for clinical use. Any results from the tool is treated as "data to be validated" by professionals. It does not aim to replace assessment but only to assist and provide insights, suggestions, and improvements. It does not aim to provide diagnosis, that is solely for professionals.

The speech assistance tool will deliver different modules that aims to provide assessment from specific to general use-cases.

## Phased Scope

| Phase                | Domain                             | Core outputs                                      |
| -------------------- | ---------------------------------- | ------------------------------------------------- |
| 1                    | Fluency (stuttering)               | Disfluency events, %SS, speech rate               |
| 1                    | Shared timing metrics              | Pauses, speech and articulation rate              |
| 2                    | Articulation (pediatric)           | Phoneme-level accuracy, error patterns            |
| 2                    | Aphasia                            | Connected-speech measures, with transcript review |
| 3                    | Voice                              | Loudness, pitch, perturbation measures            |
| 3                    | Motor speech                       | Rate, rhythm, intelligibility measures            |
| Out of scope for now | AAC, language-development coaching | Separate product categories                       |

## Module specs (one block per domain)

- Pretrained encoder (wav2vec2, HuBERT, or Whisper encoder) with a small event-detection head.
- Don't depend on standard ASR transcripts, which tend to smooth over repetitions and fillers.
- Report precision and recall per event type, with blocks as the priority.
- Fix the severity metric (%SS or SSI) at the start.

## Drafted Pipeline

1. Consent and session setup (patient, clinician, task, language)
2. Capture with live quality checks (noise, clipping, mic distance)
3. Preprocessing (resample, normalize, voice-activity detection)
4. Module analysis (acoustic features, event detection, optional transcript)
5. Confidence scoring and flagging of uncertain segments
6. **Clinician review and correction step** (the key part of an assist tool)
7. Report generation (LLM drafting only on reviewed data)
8. Encrypted storage with an audit log and retention policy
9. Longitudinal comparison view

## Limitations

- Outputs are decision support and require review by a qualified SLP.
- Performance has not been clinically validated for any population yet.
- Accuracy depends on recording conditions.
- Language and dialect coverage is limited, and children, older adults, and severe impairment may perform worse.

## Other Clinical Analysis Software

### Articulation Apps

- Articulation Station Hive

### Speech-Language Apps

- CoughDrop - An accessible, easy-to-trial AAC program with strong data tracking and customizable vocabulary sets. iOS and Android
- Word Vault - Stimuli for articulation, phonology, language, and social communication, with unlockable interactive features. iOS only (Word Vault Essential).

## Clarifications

- This will be primarily used by home users through the web application with SLP oversight through the application.

## Exercises

### Design Principles

- Every exercise belongs to a module, has a fixed prompt, and has a minimum audio-quality gate.
- The patient sees only encouragement and completion status. Results go to the SLP as “data to be validated.”
- The SLP chooses which exercises to assign, how often, and can edit the prompts.
- Stimuli should be original or properly licensed. Many standardized pictures and word lists (for example, the Cookie Theft picture and the Boston Naming Test items) are copyrighted, so don’t reuse them without permission.
- Every stimulus set needs English and Filipino/Tagalog versions, written and reviewed by SLPs who work in those languages. Don’t just translate the English items, because phoneme inventories and word frequencies differ.

### Fluency Exercise

| Exercise        | Task                                                | Collected                      | Feeds                     |
| --------------- | --------------------------------------------------- | ------------------------------ | ------------------------- |
| Passage reading | Read a short passage aloud at a comfortable pace    | Disfluency events, speech rate | %SS, event counts         |
| Rate variation  | Read the same passage slowly, normally, and quickly | Rate effects on fluency        | Rate-fluency relationship |

_Note:_ fluency measures need a minimum sample size to be stable. Ask your SLP advisors for the threshold (it is typically a few hundred syllables) and make the app warn when a recording is too short. Currently we can't consult an SLP, so set a configurable threshold.

### Shared Timing Metrics

| Exercise                 | Task                                    | Feeds                     |
| ------------------------ | --------------------------------------- | ------------------------- |
| Sentence repetition      | Repeat sentences of increasing length   | Pause and rate under load |
| Pause-controlled reading | Read a passage with marked pause points | Pause timing consistency  |

### Articulation

| Exercise          | Task                                                                           | Collected               | Feeds                        |
| ----------------- | ------------------------------------------------------------------------------ | ----------------------- | ---------------------------- |
| Picture naming    | Name pictures that target each phoneme in initial, medial, and final positions | Single-word productions | Phoneme accuracy by position |
| Sentence carriers | Say a sentence containing the target sound                                     | Sounds in short context | Accuracy in context          |

_Notes:_ use age-banded stimuli, picture-based prompts for young children, and a caregiver-assist mode. Which sounds to target depends on language and age norms, so have your SLP advisors define the inventory for each language.

### Aphasia

| Exercise            | Task                                                      | Collected                | Feeds                                           |
| ------------------- | --------------------------------------------------------- | ------------------------ | ----------------------------------------------- |
| Picture description | Describe a complex scene                                  | Connected speech         | Word counts, pauses, content-word ratio         |
| Story retell        | Listen to or view a short story, then retell it           | Narrative with structure | Syntactic complexity, correct information units |
| Verbal fluency      | Name as many animals (or foods) as possible in 60 seconds | Rapid retrieval          | Word count, clustering                          |
| Repetition          | Repeat words, then sentences of increasing length         | Repetition accuracy      | Repetition vs spontaneous speech                |
| Sentence completion | Fill in a missing word                                    | Constrained retrieval    | Word-finding                                    |

_Notes:_ ASR transcripts are unreliable for aphasic speech, so every transcript-based metric from these tasks needs SLP review and correction before it is shown or reported. Timing metrics (pauses, rate) don't need a transcript and can appear first.

**Mapping your original ideas:** "improve grammar and syntax" and "expand vocabulary" become assessment of syntax and lexical retrieval in the story retell, picture description, and naming tasks. Drills that teach grammar or vocabulary are therapy and sit outside v1 scope.

### Motor Speech

| Exercise                  | Task                                                                              | Feeds                               |
| ------------------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| Alternating motion rate   | Repeat "puh-puh-puh", "tuh-tuh-tuh", "kuh-kuh-kuh" as fast and evenly as possible | Rate, regularity                    |
| Sequential motion rate    | Repeat "puh-tuh-kuh" repeatedly                                                   | Sequencing ability                  |
| Multisyllabic words       | Repeat words of increasing length                                                 | Articulatory consistency            |
| Passage at three rates    | Read at a normal, slow, and fast rate                                             | Rate control                        |
| Rhythm and stress         | Read sentences with marked stress patterns                                        | Prosodic variation                  |
| Intelligibility sentences | Say sentences of increasing length                                                | Input to SLP intelligibility rating |

**Mapping your original ideas:** "rhythm and intonation" fits here, since your phase table lists rate and rhythm under motor speech. If you want intonation as its own output, add it to the phase table. Normal rates vary by age, language, and task, so don't hardcode norms without SLP-supported references.

### Exercise record

Store each exercise as a configurable record:

- `id`, `module`, `phase`
- `language`, `age_band`
- `prompt_text`, `prompt_image`
- `target_duration`, `min_audio_quality`
- `slp_editable_fields`, `scoring_outputs`
