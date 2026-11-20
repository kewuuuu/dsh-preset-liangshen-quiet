# 静默提案 · 梁神模式变体（liangshen-quiet）

梁神模式（@linxin666/dsh-liangshen）的复制变体，在上游之上只改四件事：

1. **不问选择题**：不再挂载 `tool-ask-user` 工具，系统提示里所有"必须调用 ask_user_question"的规则改为"以文字收尾，给结论+方案对比+编号选项+推荐"。
2. **设计阶段默认**：用户消息没有明确要求执行（改文件/装/构建/提交/派发实现）时，只允许只读勘察，产出提议；不动文件、不跑有副作用的命令、不派实现子 agent。
3. **预设作者技能**：`skill-filesystem` 加 `customSkillDirs`，组合时动态算出 `@deepseek-ai/dsh-agent-preset/skills`（`!!js` + `createRequire(baseUrl)`，与创造模式同一表达式），多出 agent-experience、cordis-composition-reference、cordis-plugin-development（含 decoration / MCP 模板）、editing-cordis-compositions 四个技能。
4. **组合自省工具**：挂 `tool-cordis`（`cordis_inspect_list` / `cordis_inspect_query`，只读），用于查 Loader entry 树、单个 entry 的 config JSON Schema、Host/Client 的 service 与 event 目录、当前工具 schema；宿主侧 provider（`@deepseek-ai/dsh-tool-cordis/host`）由部署的 host 组合提供。

除上述四项外，其余（persona 纪律、dispatcher 规则骨架 R0/R-G/R1-R8、工具清单、compaction、delegation、subagent 路由、todo、goal…）与梁神模式逐字一致。

## 目录

- `build/apply-quiet.mjs` — 从上游预设目录复制并施加改动，产出 `presets/liangshen-quiet/`（幂等，改动锚点不匹配会直接报错）
- `build/install.mjs` — 把 `presets/liangshen-quiet/` 装进 profile 的 `presets-local/`，并把声明行写进 profile 的 `cordis.patch.yml`（区域标记 `# region:begin liangshen-quiet` … `# region:end liangshen-quiet`，可重复执行）
- `presets/liangshen-quiet/` — 生成的预设（上游更新后可重新生成，再 `git diff` 审阅）

## 获取与安装

需要已安装并配置好的 DSH、Node.js 和 Git；本仓库提供预设，不包含 DSH 运行时及其插件依赖。

```sh
git clone https://github.com/kewuuuu/dsh-preset-liangshen-quiet.git
cd dsh-preset-liangshen-quiet
```

安装前请把 `DSH_PROFILE` 设置为你自己的 DSH profile 绝对路径，该目录应已有 `cordis.patch.yml`。安装脚本的默认路径是作者本机路径，不适用于其他电脑。以 PowerShell 为例：

```powershell
$env:DSH_PROFILE = "你的 DSH profile 绝对路径"
node build/install.mjs
```

直接使用仓库中的预设即可，无需先重新生成。安装后按下文「启用」操作；上游更新时才需要重新生成。

## 重新生成 / 安装

```
node build/apply-quiet.mjs          # 上游 → presets/liangshen-quiet
node build/install.mjs              # → <profile>/presets-local + cordis.patch.yml
```

`DSH_PROFILE` 可覆盖目标 profile 目录；`LIANGSHEN_PRESET` 可覆盖上游预设目录。

## 关键实现约束

- 通用 `@deepseek-ai/dsh-agent-preset` **不会**重写子行的相对 `name`；梁神是在自己的 `lib/index.js:340` 用 `pathToFileURL` 处理的。因此 `install.mjs` 把 `name: ./x.mjs` 改写成绝对 `file:///…` 地址。
- `customSkillDirs` 的 `!!js` 在**组合时**求值，`baseUrl` 是预设声明行所在目录（装好后即 profile 目录）。已实测 profile 目录与预设文件 URL 两种锚点都能解析到 `@deepseek-ai/dsh-agent-preset`，换版本或 store hash 不用改本仓库。
- 在 profile 的 `cordis.patch.yml` 里新增行必须写成 `- insert:` 块；裸 `- id: x` 是"覆盖已存在行"，会报 `entry "x" not found`。

## 启用

装好后重启 DSH，在预设列表里选「静默提案」（`order: 5`）。要让新会话默认用它，把 profile `cordis.patch.yml` 里 `agent-preset-registry` 的 `selectedDefault` 改成 `liangshen-quiet`。

回滚：删掉 `cordis.patch.yml` 里 `# region:begin liangshen-quiet` … `# region:end liangshen-quiet` 之间的内容，并删除 `presets-local/liangshen-quiet/`。
