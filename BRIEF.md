---
workflow: general-video
flow: automation
storyboard: no
message: Design a BCD-to-seven-segment decoder from gates, a Karnaugh map, and a shared PLA.
aspect: 16:9
language: en-US
audience: digital-logic beginners
length: approximately 7 minutes, adjusted to measured narration
---

The user approved the 15-screen script and layout in chat, with an expanded introduction. Proceed with production. Use the same HyperFrames HTML/Canvas, section-based edge-tts narration and synchronized-caption technique as C:/Temp/FFTDoppler/Doppler. Output 1920x1080, 30 fps, playable preview and rendered MP4.

Introduction: In this video, we'll design a digital circuit that converts a four-bit BCD input into the seven signals needed to display a decimal digit.

Explain AND, OR, NOT, then the BCD interface, the truth table for segment a, Gray-code map arrangement, grouping and don't-cares, four implicants, gates, full shared PLA, validity blanking, trace 5, exhaustive simulation, recap. Preserve lowercase segment names a-g and inputs I3-I0 (8,4,2,1). Active-high logical outputs. This teaches Boolean design, not electrical LED driver sizing.

Reuse verified logical equations from C:/Temp/BCD/generate-circuit.js. Do not reuse its wiring layout. Use 15 product rows, eight literal columns, seven output columns, and explicit connection dots. Final outputs gated by VALID = NOT I3 OR (NOT I2 AND NOT I1).

Design: dark navy, mint active signals, gray inactive signals, amber instructional focus. Large static labels, quiet holds during explanations, timed deterministic signal highlighting. Captions have their own reserved lower band. No music or stock assets; narration is the focus. Local fonts and local GSAP asset. Each scene is a separate HyperFrames sub-composition using the common tested drawing and logic library.

The revised introduction and remaining proposed screens were approved on 2026-09-28. No further concept or script approval is needed.
