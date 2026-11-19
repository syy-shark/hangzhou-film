---
name: Regression
about: Something that used to render correctly no longer does
labels: regression
---

## What drifted

<!-- The scene, the timestamp, and what you see instead of what you expect. -->

## Where the gate stands

```
<!-- paste `node scripts/gate.mjs` output -->
```

## Is the baseline still valid?

- [ ] **No** — this is a real regression; fix the scene, keep the baseline
- [ ] **Yes** — a human approved this visual change; the baseline needs re-seeding

> Re-seeding `scripts/baseline/` to turn a red gate green is only allowed with approval in
> review. See `BOT.md`. Doing it silently retires the whole safety net.
