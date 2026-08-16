# dsh-file

DeepSeek Harness 的 VS Code 风格文件管理器插件：在 Web 侧边栏浏览、打开、编辑、保存、新建、重命名、删除当前对话工作区的文件。

![sidebar](/docs/sidebar.png)

## 功能

- **侧边栏底部"文件"按钮**：点击后侧边栏主体切换为文件管理器，再点切回工作区/会话列表
- **文件树**：懒加载目录展开，文件/目录图标区分，悬浮显示重命名/删除操作
- **编辑器**：Monaco Editor（VS Code 同款内核，从 CDN 加载），按扩展名自动语法高亮；CDN 不可达时降级为纯文本 textarea
- **编辑与保存**：Ctrl+S 或工具栏"保存"按钮，dirty 标记（●）
- **文件操作**：新建文件、新建目录、重命名、删除（删除需确认，非空目录拒绝）
- **工作区边界**：所有路径解析相对插件配置的 `root`，越界路径被 host 拒绝（含 symlink 逃逸防护）

## 架构

插件由两半组成，共用包名 `dsh-file`：

| | Host 半（Node 进程） | Client 半（浏览器 React） |
|---|---|---|
| 源码 | `src/index.ts` | `src/client/` |
| 构建产物 | `dist/index.js`（tsc，保留标准装饰器） | `dist/client.js`（esbuild，ModuleLoader bundle） |
| 职责 | 文件系统 RPC | 侧边栏 UI + remote 调用 |
| 关键 API | `class FileManagerGateway extends TypertRemoteService` + `@Remote()` | `ctx.slots.register()`、`ctx.remote.$mount()` |

### Host ↔ Client 通信（Typert Remote）

浏览器不能直接访问文件系统，所以 host 半把文件操作暴露为 RPC 端点（namespace `fileManager`：`listDir` / `readText` / `writeText` / `createFile` / `createDirectory` / `rename` / `delete` / `stat` / `resolve` / `getRoot`）。客户端通过 `ctx.remote.$mount(TYPERT_REMOTE)` 挂载调用面，再用 `ctx.get('remote.fileManager')` 解析服务后调用。

**关键约束（SRC descriptor 契约）**：Typert gateway 用 `Function.prototype.toString` 从方法签名提取 wire 参数名——所以 host 方法必须用**扁平参数**（`listDir(path: string)`，不是 `listDir(input: {...})`），参数名即客户端发送的字段名。两半的命名必须一致。

### 面板切换机制

侧边栏主区域是 `sidebar.workspaces` 单席位 slot（被工作区浏览器以 priority 0 占用）。插件点击按钮时以 `priority: -1` 注册自己的 shadow 条目——单席位 slot 渲染 priority 最低的条目，所以文件管理器成为 winner；关闭时注销条目，工作区浏览器自动恢复。

### 依赖解析（重要）

`@deepseek-ai/*` 包**不能**在插件自己的 `node_modules` 里安装副本：`@Remote` 装饰器标记存在模块级 WeakMap 中，若插件与 api-gateway 各持一份 `dsh-typert-protocol` 实例，标记互不可见（RPC 会 404）。必须让 Node 解析到 dsh 安装目录的同一实例：

```sh
# 本地开发（本机 dsh 通过 npx 安装时）：
ln -s ~/.dsh/profiles/node_modules/@deepseek-ai node_modules/@deepseek-ai
```

`dsh` 启动时会维护 `$DSH_HOME/profiles/node_modules` 的扁平 symlink 回退（`healProfilesModuleFallback`），指向 dsh 安装目录的每个包。生产发布时插件将 `@deepseek-ai/*` 声明为 `peerDependencies`，由 profile 提供。

## 开发

```sh
npm install                       # esbuild + typescript + 类型
node build.mjs                    # 构建 host (tsc) + client bundle (esbuild)
node build.mjs --watch            # 只 watch client（host 改动需重跑）
```

构建产物：
- `dist/index.js` — host 半（Node ESM，tsc 编译以保留标准 stage-3 装饰器；esbuild 会把 `@Remote` 降级为 legacy 形式导致运行时崩溃）
- `dist/client.js` — client 半（`window.__ModuleLoader__.load({id, factory})` 格式，react 等 seed 词 external）

## 安装

### 本地安装（开发）

```sh
# 在 dsh-file 的父目录执行，避免 ./dsh-file 被解析成子目录
cd /path/to/dsh-plugin
dsh plugin --profile web add ./dsh-file
```

`dsh plugin add` 会把包 pnpm-link 进 profile 并追加到 `dsh.profile.bundles`。**重启 `dsh web` 生效**（client 插件元数据按名缓存，重启后重新扫描）。

### 发布安装

```sh
npm publish                      # 发布到 registry（files 已含 dist/ + cordis.patch.yml）
dsh plugin --profile web add dsh-file
# 或本地 tarball
pnpm pack && dsh plugin --profile web add ./dsh-file-0.1.0.tgz
```

### 配置

`cordis.patch.yml` 中的 `root` 控制文件管理器的根目录（默认 `process.cwd()`，即启动 `dsh web` 的目录）：

```yaml
- insert:
    - id: dsh-file
      name: 'dsh-file'
      config:
        root: !!js process.cwd()   # 改成其他工作区路径
```

## 调试

```sh
dsh --profile web --dump-config | grep -A4 dsh-file   # 确认插件层已组合
# 测试 RPC（需 dsh web 运行中）
curl -X POST http://127.0.0.1:3080/api/fileManager/getRoot \
  -H 'Content-Type: application/json' \
  -d '{"type":"client-request","rpcId":"t","method":"fileManager/getRoot","payload":{"args":{}}}'
```

## 常见问题

- **RPC 返回 not found**：几乎总是 `@deepseek-ai/dsh-typert-protocol` 双实例问题——检查插件 `node_modules/@deepseek-ai` 是否是 symlink（`ls -la node_modules/@deepseek-ai`），不是则按上文建立链接后重启。
- **编辑器空白**：Monaco 从 jsdelivr CDN 加载，内网环境需配置本地镜像或等待 textarea 降级。
- **插件改了不生效**：host 半改动需重启 `dsh web`；client 半 bundle 改动后刷新页面即可（rev 变化触发重新加载）。

## License

MIT
