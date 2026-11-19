import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = process.env.LIANGSHEN_PRESET || "C:\\Users\\kewu0\\AppData\\Roaming\\dsh-launcher\\dsh-packs\\pack-test\\profiles\\pack-test\\node_modules\\@linxin666\\dsh-liangshen\\presets\\liangshen"
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '..', 'presets', 'liangshen-quiet')
const PAIRS = [
  {
    "file": "agent.cordis.yml",
    "find": "\n\n# The mode's preset-local plugins:",
    "replace": "\n      - Design-Phase Default: unless the user's message explicitly asks for a change, stay in the design phase: inspect read-only, then deliver the proposal—the goal in one line, 2-4 candidate approaches with their trade-offs, your recommendation with its reasoning, and the numbered decisions the user owes you. Never write, run anything with side effects, or dispatch an implementer on an unstated authorization.\n      - Quiet Turns: this session's user reads a finished turn and answers later. Never call ask_user_question (it is not mounted here); end a turn with the result plus numbered options the user can answer in one next message.\n\n# The mode's preset-local plugins:"
  },
  {
    "file": "agent.cordis.yml",
    "find": "# ── remaining model-facing rows ─────────────────────────────────────────────\n\n- id: tool-ask-user\n  name: '@deepseek-ai/dsh-tool-ask-user'\n\n- id: tool-todo",
    "replace": "# ── remaining model-facing rows ─────────────────────────────────────────────\n\n# No user-question row here on purpose: this preset never interrupts a turn\n# with a multiple-choice prompt. The model reports and offers options in text.\n\n- id: tool-todo"
  },
  {
    "file": "agent.cordis.yml",
    "find": "Use ask_user_question only for user-owned choices or material ambiguity that inspection cannot answer.",
    "replace": "Surface user-owned choices and material ambiguity that inspection cannot answer as a numbered option list in the reply, with your recommendation marked; this preset has no user-question tool."
  },
  {
    "file": "agent.cordis.yml",
    "find": "Do not paste the final plan as a plain reply or ask \"should I proceed?\" through prose or ask_user_question.",
    "replace": "Do not paste the final plan as a plain reply or ask \"should I proceed?\" through prose."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "  2. Call ask_user_question once to hand the choice of exit path to the user (see R-W): (1)",
    "replace": "  2. State the three exit paths as a numbered list in your reply, with your recommendation first, and end the turn there (see R-W): (1)"
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "- G3 Execution via Tool: Submit all questions for the current round in a single ask_user_question call; give each question a stable id, a concise header, and your recommended answer (when providing options, place the recommended option first and mark it \"(Recommended)\"). Structure items as \"Q1 — Title / Question body / Recommended answer\" so the user can reply by number. The same rule covers every decision stop outside the interview; see R-W.",
    "replace": "- G3 Execution in Text: This preset mounts no user-question tool, so the round's whole frontier goes out as ONE numbered list at the end of your reply, and the turn ends there. Give each item a stable id, a concise header, and your recommended answer (place the recommended option first and mark it \"(Recommended)\"), plus one line on what the user's answer changes. Structure items as \"Q1 — Title / Question body / Recommended answer\" so the user can reply by number in their next message. The same rule covers every decision stop outside the interview; see R-W."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "or it goes to the user through ask_user_question as a scoping decision (R-W)",
    "replace": "or it goes to the user as a numbered scoping option in the reply's question list (R-W)"
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "[Questions] Whenever you need a user decision, hand the question out with a single ask_user_question call—never end a turn with a paragraph of prose and stop to wait for a typed reply.",
    "replace": "[Questions] The user is not sitting in front of this session: they read a finished turn and answer later. Whenever you need a user decision, end the turn with a self-contained answer—the result, then the options as a numbered list with the recommended one first, then what each answer changes. Never call ask_user_question (this preset does not mount it), and never stop mid-work to wait for a typed reply."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "- Asking is your tool, not the user's chore: provide clear options, put your recommended choice first, and leave a custom-input slot so the user can answer with one click instead of translating your paragraph into a prompt.",
    "replace": "- The option list is the deliverable, not a courtesy: name each option's cost, its risk and the case it wins, mark the recommended one, and keep the list answerable by number in one next message. An option the user cannot judge without asking a follow-up is not yet an option."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "- Scope extends beyond the interview (G3): choosing the next step after subagent results arrive, scoping rework after a failed acceptance check, revising the plan when a premise breaks—whenever \"I am stopping here because a decision is missing\", use ask_user_question.",
    "replace": "- Scope extends beyond the interview (G3): choosing the next step after subagent results arrive, scoping rework after a failed acceptance check, revising the plan when a premise breaks—whenever \"I am stopping here because a decision is missing\", write the decision list into the reply and stop."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "- Only two exceptions: plan-mode approval still goes through exit_plan_mode (which has its own channel); and when the task is finished and only the delivery summary remains, do not ask a question.",
    "replace": "- Two exceptions remain: plan-mode approval still goes through exit_plan_mode (which has its own channel), and when the task is finished and only the delivery summary remains, pose no question at all—report, then stop."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "12. Explaining an incompatibility in plain text and leaving the user to figure out the exit path—R0.5 requires a single ask_user_question call with explicit options.",
    "replace": "12. Explaining an incompatibility without also listing the exit paths as numbered options—R0.5 requires the options in the reply itself."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "15. Ending with a paragraph of prose to wait for user sign-off instead of calling ask_user_question (R-W).",
    "replace": "15. Ending a turn on a question that carries no options, no recommendation, or no statement of what the answer changes (R-W); or calling ask_user_question, which this preset does not mount."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "- G12 Presentation and degradation: under the PTC presentation the questions still go out in a single tools.ask_user_question call inside run_code; when the tool is unavailable or the call fails, fall back to a numbered question list in your reply rather than skipping the interview.",
    "replace": "- G12 Presentation: the question list is always plain text in the reply—there is no user-question tool to call here. Degrade to a shorter list, never to silence: an unasked decision is a decision the user never gets to make."
  },
  {
    "file": "dispatcher-rules.mjs",
    "find": "## R0 · Complexity Triage (Triage First, Then Choose the Workflow)",
    "replace": "## R-D · Design Phase Default (Nothing Advances Without an Explicit Go)\n\nDecide which mode the user's message put you in before anything else.\n\n- Execution is opt-in. A message authorizes a change only by asking for one: run it, write it, fix it, install it, build it, commit it, dispatch it. A question, a symptom report, \"what do you think\", \"how would you do X\", \"can it be done\" is the design phase, and the deliverable there is a proposal, never a change.\n- The design phase may inspect read-only (read, grep, glob, listing, read-only commands) and reason as deeply as it likes; it may NOT create, edit or delete files, run anything with side effects (install, build, in-place format, git commit/push, uninstall, kill), dispatch an implementation subagent, or create and run a task-board card. Read-only work needs no permission; anything that leaves a trace waits for the go-ahead.\n- A proposal answers in this order: the goal in one line; 2-4 candidate approaches with cost, risk and when each one wins; your recommendation with the reasoning behind it; then the numbered decisions the user owes you, each carrying its default. Never a bare \"shall I proceed?\".\n- Assent is not authorization. \"嗯/好/可以/继续\" authorizes the recommended option only when that recommendation is already in front of the user in the same thread; if the recommendation is stale or the decision was never put to them, restate it in one line and stop.\n- Once execution is authorized, triage from R0 onward applies as written, and the gate re-arms with the next message that merely asks.\n\n## R0 · Complexity Triage (Triage First, Then Choose the Workflow)"
  },
  {
    "file": "agent.cordis.yml",
    "find": "- id: skill-filesystem\n  name: '@deepseek-ai/dsh-skill-filesystem'\n\n- id: tool-skill\n  name: '@deepseek-ai/dsh-tool-skill'",
    "replace": "- id: skill-filesystem\n  name: '@deepseek-ai/dsh-skill-filesystem'\n  config:\n    customSkillDirs:\n      - !!js process.getBuiltinModule('node:path').join(process.getBuiltinModule('node:path').dirname(process.getBuiltinModule('node:module').createRequire(baseUrl).resolve('@deepseek-ai/dsh-agent-preset/package.json')), 'skills')\n\n# `customSkillDirs` adds the preset-authoring skills shipped with\n# `@deepseek-ai/dsh-agent-preset`—agent-experience,\n# cordis-composition-reference, cordis-plugin-development (with its\n# decoration and MCP templates) and editing-cordis-compositions—on top of\n# the local roots this row already discovers. The directory is computed at\n# compose time from `baseUrl`, so a version bump or a store-hash change in\n# the install path needs no edit here.\n\n- id: tool-skill\n  name: '@deepseek-ai/dsh-tool-skill'\n\n# Read-only introspection of the running composition: the Loader entry tree\n# with each entry's config state and packageDir, one entry's config JSON\n# schema, the Host/Client service and event catalogs, and the current tool\n# schemas. The provider that answers it (`@deepseek-ai/dsh-tool-cordis/host`)\n# sits in the deployment's host composition; this row is the model-facing half.\n- id: tool-cordis\n  name: '@deepseek-ai/dsh-tool-cordis'"
  },
  {
    "file": "agent.cordis.yml",
    "find": "- id: tool-cordis\n  name: '@deepseek-ai/dsh-tool-cordis'",
    "replace": "- id: tool-cordis\n  name: '@deepseek-ai/dsh-tool-cordis'\n\n# Plugin management from the model side: the same operations as the Web UI's\n# Plugins page—list bundles, toggle \`disabled\`, install (including\n# \`link:<abs dir>\` for a local checkout), inspect for an update, uninstall.\n# A toggle writes only \`disabled\` in this profile's \`cordis.patch.yml\`, never\n# an agent-preset row; this row itself is inert outside the profile run, which\n# is where that patch and package.json live.\n- id: tool-plugin-manager\n  name: '@deepseek-ai/dsh-plugin-manager/tools'\n  disabled: !!js \"!ctx.get('profileContext')\""
  }
]

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.cpSync(SRC, OUT, { recursive: true })

const cache = new Map()
const read = (f) => { if (!cache.has(f)) cache.set(f, fs.readFileSync(path.join(OUT, f), 'utf8')); return cache.get(f) }
const write = (f, s) => { cache.set(f, s); fs.writeFileSync(path.join(OUT, f), s) }

PAIRS.forEach((p, i) => {
  const before = read(p.file)
  const n = before.split(p.find).length - 1
  if (n !== 1) throw new Error('pair #' + i + ' in ' + p.file + ' matched ' + n + ' times, expected 1: ' + p.find.slice(0, 80))
  write(p.file, before.replace(p.find, p.replace))
})

fs.writeFileSync(path.join(OUT, 'preset.yml'), `name: 静默提案
description: "梁神模式的静默变体——不弹选择题，每轮以结论、方案对比、编号选项和推荐收尾；未明确要求执行时只做设计阶段提议，不动文件、不跑变更命令、不派实现子 agent。"
order: 5
`)

const rules = read('dispatcher-rules.mjs')
const yml = read('agent.cordis.yml')
const leftRules = rules.split('ask_user_question').length - 1
const leftYml = yml.split('ask_user_question').length - 1
console.log('edits applied:', PAIRS.length)
console.log('ask_user_question remaining -> dispatcher-rules.mjs:', leftRules, ' agent.cordis.yml:', leftYml)
console.log('tool-ask-user remaining:', yml.split('tool-ask-user').length - 1)
console.log('out dir:', OUT)
