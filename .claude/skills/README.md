# Skills

This directory holds project-level skills for Claude Code. Most of them are a
curated subset of [obra/superpowers-skills](https://github.com/obra/superpowers-skills)
(MIT licensed), brought in directly as files rather than through the actual
"superpowers" plugin — so there's no `${SUPERPOWERS_SKILLS_ROOT}` env var or
`find-skills` CLI here; Claude Code's own skill listing handles discovery.

Included: debugging (`systematic-debugging`, `root-cause-tracing`,
`verification-before-completion`, `defense-in-depth`), testing
(`test-driven-development`, `testing-anti-patterns`, `condition-based-waiting`),
collaboration (`brainstorming`, `writing-plans`, `executing-plans`,
`requesting-code-review`, `receiving-code-review`), problem-solving
(`when-stuck`, `simplification-cascades`, `collision-zone-thinking`,
`inversion-exercise`, `meta-pattern-recognition`, `scale-game`), plus
`preserving-productive-tensions` (architecture) and `tracing-knowledge-lineages`
(research).

Left out on purpose: the meta skills about maintaining the Superpowers
ecosystem itself (`gardening-skills-wiki`, `pulling-updates-from-skills-repository`,
`sharing-skills`, `testing-skills-with-subagents`, `writing-skills`), the
git-worktree-specific workflow (`using-git-worktrees`,
`finishing-a-development-branch` — this project works on a single branch),
and the heavier infra-dependent ones (`dispatching-parallel-agents`,
`subagent-driven-development`, `remembering-conversations`).

A few of the imported skills cross-reference the excluded ones by their old
`skills/category/name` path (e.g. `skills/collaboration/using-git-worktrees`)
— those particular pointers won't resolve to anything here; everything else
is self-contained.
