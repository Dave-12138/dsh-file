# dsh-file（@dave_12138/dsh-file）

fork 项目规则：**不管项目自身版本号**。修完 bug / 加完功能 / 改完 doc 时 commit；如果修正的是前一次提交的失误则 amend。

对本 AGENTS.md 的更改只能单独提交，不能与feat、fix混在一起提交。

## Project

- DeepSeek Harness Web 的 VS Code 风格文件管理器 + 文本编辑器插件，fork 自 chengzhi43/dsh-file。单包、非 monorepo，`"type": "module"`。
- 两个远端（勿混淆）：`origin` = chengzhi43/dsh-file（原上游）；`Dave-12138` = 本 fork。本地 `master` / `fix/0.1.2` 分别跟踪 `Dave-12138/master` / `Dave-12138/fix/0.1.2`；容器无 push 凭据。
- `exports`：`.` → host（`dist/index.js`）、`./client` → 浏览器 bundle（`dist/client.js`）、`./typert` → 严格描述子清单；`files` 只含 `dist/` + `cordis.patch.yml`。dsh 元数据：`dsh.bundle.patch`、`dsh.client.platform: web`。
- 插件装载行在 `cordis.patch.yml`（`- insert`，id/name `@dave_12138/dsh-file`）。config：`root` 只是会话 pin 前的回退根（浏览器每次打开会用当前会话 cwd 重 pin）；`openLinksInEditor` 默认 false。
- 安装/分发入口是 **publish 分支**（`dsh plugin add github:Dave-12138/dsh-file#publish`）：`.github/workflows/publish-to-branch.yml` 在每次 push master 时 `npm ci && node build.mjs && npm test`，把 `package.json + cordis.patch.yml + README.md + dist/` 整体覆写到 `publish` 分支（master 不含 dist/）。

## Commands

- 安装依赖（容器内）：`npm ci --cache /root/workspace/.npm-cache` —— 宿主装好的 node_modules 只含 Windows 平台 esbuild，直接 `node build.mjs` 会挂在 esbuild 的 generateBinPath；重装后容器内可完整构建。
- 构建：`node build.mjs`（host 半 tsc + client 半 esbuild，顺序见下）。watch 模式：`node build.mjs --watch`，**只 watch client**；host 改动必须重跑整个脚本。
- 测试：`npm test`（`node --test "test/*.test.ts"`，7 个文件 / 32 用例）。单跑一个文件：`node --test test/<file>.test.ts`。
- host 半类型检查：`npx tsc -p tsconfig.host.json`。全量 `tsconfig.json`（含 client、noEmit）存在历史遗留类型错误，**不能**当通过标准。
- CI 与发布前校验等价命令：`npm ci && node build.mjs && npm test`（`prepublishOnly` 同）。

## Architecture

- **host 半**（`src/index.ts` → `dist/index.js`，tsc）：`FileManagerGateway`（TypertRemoteService）在宿主进程内用 `node:fs` 直接读写文件，方法为**扁平参数**（Typert 用 `Function.prototype.toString` 取参数名当 wire 字段名，不能包对象）；所有路径相对当前 pin 的 workspace root 解析、越界即拒。
- **`src/typert.host.ts`**（→ `dist/typert.host.js`）：`fileManager` 服务的严格 host 描述子（plain data，`ctx.typert.register`）。存在原因（issue #2）：dsh 从源码 checkout 经 tsx 跑时，协议装饰器标记存在模块私有 WeakMap，跨实例会丢 RPC 端点；严格表先于 SRC 模式被查询，保证任何实例组合下端点可解析。codec 故意宽松。
- **client 半**（`src/client/index.tsx` → `dist/client.js`，esbuild，ModuleLoader handoff 格式 `window.__ModuleLoader__.load({ id, factory })`）：挂 `ctx.remote.fileManager.*` 远程贡献；侧边栏注册「文件」按钮；面板打开时向 `sidebar.workspaces` slot 注入 priority -1 的 shadow 条目（挤掉工作区浏览器默认 0 优先级的格子）；文件编辑器注册为 `conversation.view` 的「文件」页签（编辑发生在对话居中栏滚动体内，不是弹窗）。样式经 esbuild `loader: { '.css': 'text' }` 内联为文本再由 client 注入 `<style>`（见 index.tsx 顶部 CSS_TAG）。
- **build.mjs 关键约束**：host 必须 tsc（不能 esbuild）——`@Remote()` 是 stage-3 装饰器，esbuild 会降级成 `__decorateClass` legacy 形式、运行时不认；tsc 的 `__esDecorate` 才被接受。client 无装饰器，用 esbuild。`CLIENT_EXTERNALS`（react、@deepseek-ai/cordis、dsh-client-ui-slots 等平台种子词）保持 external，由浏览器模块表解析。
- 源码分布（host）：`src/index.ts`（网关 RPC + settings schema + root 校验）、`src/typert.host.ts`、`src/mime.ts`。
- 源码分布（client）：`FileManagerPanel.tsx` / `FileTree.tsx`（侧栏面板）、`FileEditorView.tsx`（编辑器视图，conversation.view）、`store.ts`（共享状态、打开文件、root pin、编辑器激活订阅）、`remote.ts`（Remote 描述子 + unwrap）、`openLinks.ts`（会话文件链接接缝补丁）、`mdModeStore.ts` / `markdown.ts` / `monaco.ts` / `themeStore.ts` / `settingsCard.tsx` / `styles.css`。
- 测试与源码一一对应（store / markdown / mdModeStore / mime / openLinks / editorViewHandles / typert.host 的 .test.ts），纯 node:test、无 DOM、无外部服务，直接 `import '../src/*.ts'`（type stripping）。

## Conventions

- Commit message 遵循 Angular 规范、中文摘要（`fix:` / `feat:` / `docs:` / `ci:` / `chore:` 等）；修正前次提交失误时 amend 而非新提交。
- 版本号归上游管理，fork 侧不 bump；`dist/`、`node_modules/`、`.npm-cache/` 均 gitignore（publish 分支由 CI 重建）。
- client 源码改动后必须重新构建并把产物复制到插件安装目录（运行 GUI 从安装目录加载 dist，且无 watch 时需用户手动刷新页面才生效）；只改 src 不算完成。

## Pitfalls

- **dsh-settings ≥ 0.1.2-rc.1 移除了运行时 `settingsNamespace()`**：命名空间是普通小写连字符字面量，类型层用 `SettingsNamespace` 品牌标记。写法 `export const FILE_SETTINGS_NS = 'dsh-file' as unknown as SettingsNamespace;`。该类型导入**不能删**：它同时加载 dsh-settings 对 cordis 的模块增强（`ctx.settings`），删了报 TS2339。client 半不受影响（本就用字面量）。
- **DSH ≥ 0.1.2-rc.1 移除了客户端 `workspaces.openPath`**（会话文件链接接缝变化）：chat 的 `openFile` 改调 `ctx.remote.session.openWorkspacePath({ path })`（RPC 到宿主原生打开器）。拦截实现 `src/client/openLinks.ts`：`patchOpenLinks` 分发器优先重定义 `remote.session` 的 `openWorkspacePath` 访问器（`Object.defineProperty({ configurable: true, get })` 包裹、保留原 getter 回退），命中返回 `{ ok: true, value: { opened: true } }`（同宿主 RPC 契约）；检测不到时回退 0.1.1-rc.2 及更早的 `workspaces.openPath`（`patchOpenPath`）。因此 openLinksInEditor 在两版均可生效。守卫测试 `test/openLinks.test.ts`。
- **会话对话列两个 `[data-width-handle]` 宽度调节条会悬浮盖住居中栏**（`dsh-client-ui-conversation` 的 WidthHandle，绝对定位、z-index 8）。DSH 本体隐藏机制：占满整栏的 `conversation.view`（轨迹视图）在根节点打 `data-conversation-composer-overlay=""`，核心样式 `.wSkVaW_root:has([data-conversation-composer-overlay]) .wSkVaW_widthHandle{display:none}`。文件编辑器沿用同标记：`FileEditorView` 的两个渲染分支（空态 / 打开文件）根节点都带该属性，切走视图卸载后标记消失、把手自动恢复，无需自建 CSS/JS。守卫测试 `test/editorViewHandles.test.ts`。
- `tsconfig.json`（全量）的历史遗留类型错误与 dsh-settings 升级无关（client 的 Context 增强、缺 `monaco-editor` 模块、`experimentalDecorators` 下 `@Remote` TS1241 等）；实际构建/检查走 `tsconfig.host.json`（只含 `src/index.ts` + `src/typert.host.ts`），可干净通过。`@deepseek-ai/*` 类型查找映射到全局 dsh 安装（Desktop 档 bundle 剥 .d.ts），换 Node/nvm 目录时需同步改 tsconfig paths。
- 容器内不能 `git push`、不能重启 dsh；宿主装好的依赖不可直接复用（见 Commands 的重装缓存绕法）；改 `~/.dsh` 下插件安装目录属文件沙箱外，需提权复制部署，随后用户手动刷新页面验证。

## Maintenance

- 后续 agent：发现新的已验证命令 / 架构事实 / 坑时，就地更新本文件对应小节，保持简洁、基于证据，删除过时条目（例如 0.1.1-rc.2 时代说法在 0.1.2-rc.1+ 不再成立时要改写）。不改版本号。

