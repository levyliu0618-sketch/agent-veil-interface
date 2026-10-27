# Agent Veil — interface proposal

A buildless, English-language interactive prototype for discussing process visibility in coding agents. Familiar workspace layout: task brief, interactive artifact, process inspector. Six independently adjustable information types and six optional preset views.

## Run

Serve this directory with a static server, e.g. `python3 -m http.server 8765`, and open its local address. No dependencies, API keys, build step or backend are required. GitHub Pages can publish the repository root.

## Try it

1. Set the artifact to four seats: v3 totals $162.
2. Inspect **Check the booking rules** in the process panel.
3. Open **Visibility** and enable reasoning notes or full tool output. Every setting affects the view independently.
4. Switch to v2: four seats incorrectly cost $180. Open **Compare versions**.
5. Replay the authored run, pause it, change visibility, or skip to the end.
6. Open **Design & research** for each layer's basis, links, limitations, and proposed evaluation.

## Honest boundaries

- All agent messages, logs, checks, reasoning notes and subagent handoffs are authored fixtures, not live model output or execution traces.
- The actual preview's calculations, validation and local demo confirmation work. The reservation is not sent anywhere.
- The v2 pricing error and v3 fix are intentional examples. Visibility changes do not regenerate or improve the final artifact.
- No analytics, participant data collection, external scripts/fonts, payment, credentials or private group documents are included. Review choices exist only in tab memory.
- This is an individual proposal, not the group's approved experimental protocol. It has no study-assignment, consent or participant-management backend.
- A test marked “not run” in the fixture remains not run in the example story, regardless of testing performed on the prototype itself.

## Structure

- `index.html`: workspace, settings, walkthrough.
- `styles.css`: responsive neutral workspace styling.
- `app.js`: deterministic fixture and client interactions.
- `research.html`: six source-linked rationales; evidence distinguished from inference.

## Visibility model

Verbosity (off/status/concise/detailed), Thinking (off/show), Summarized tool calls (off/show), Full tool output (off/show), Subagents (off/summary/full), Artifact versions (off/latest/all).

The public Agent Veil playground supplies the category vocabulary. This interface's layout, default combination, and preset mapping of versions/subagents are design proposals. Full tool output is expandable even when enabled. Artifact versions off keeps the latest available output visible while hiding history controls and version metadata.

## Integration next

Replace `steps` with an adapter for actual timestamped agent events after the team agrees on the backend and protocol. Preserve source provenance (recorded vs authored), explicit missing checks, task requirements, and a stable final artifact across visibility conditions. Do not infer a test passed from a model's narration.
