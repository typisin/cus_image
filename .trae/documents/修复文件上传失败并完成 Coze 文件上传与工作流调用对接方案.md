## 根因分析
- 本地使用 `python3 -m http.server` 仅提供静态页面，`/api/coze/upload` 并不存在，导致前端在 `cutout.js:141` 发起上传时 `fetch('/api/coze/upload')` 返回 404，从而在 `cutout.js:89` 抛出 `Error: upload failed`。
- 即使部署到 Vercel，若未配置环境变量或 Coze 接口 URL 不正确，后端会返回 500（`api/coze/upload.js:6` 检查 `COZE_SAT` 与 `COZE_UPLOAD_URL`）。
- Coze 官方上传接口为 `https://api.coze.cn/v1/files/upload`（需要 Bearer Token），上传成功返回 `file_id`；工作流调用需要 `workflow_id`，并非仅传 `file_id` 即可。
- 有些 Coze 示例在 Header 中使用 `Authorization: Bearer <token>`；也有页面示例使用 `token: <string>` 头部。为避免兼容性问题，应允许两种头部方式（优先 `Authorization`）。

## 修复方案
- 使用 Vercel Serverless 作为后端代理，前端始终调用同域 `/api/*` 路由，避免 CORS 与 Token 暴露。
- 在 Vercel 项目配置以下环境变量：
  - `COZE_SAT`: 服务访问令牌（用户提供）
  - `COZE_UPLOAD_URL`: `https://api.coze.cn/v1/files/upload`
  - `COZE_WORKFLOW_RUN_URL`: Coze 工作流运行接口（例如 `https://api.coze.cn/v1/workflows/run`）
  - `COZE_WORKFLOW_STATUS_URL`: 工作流状态查询接口（例如 `https://api.coze.cn/v1/workflows/runs/retrieve`）
  - `COZE_WORKFLOW_ID`: 目标抠图工作流 ID
- 后端上传与工作流：
  - 上传：`api/coze/upload.js` 使用 `Authorization: Bearer ${COZE_SAT}` 发送 `multipart/form-data` 的 `file` 字段，解析返回 `file_id`。
  - 运行：`api/coze/cutout/run.js` 除 `file_id` 外添加 `workflow_id: process.env.COZE_WORKFLOW_ID`，以满足 Coze 要求。
  - 查询：`api/coze/cutout/status.js` 以 `run_id` 查询运行状态，返回完成时的图片结果（URL 或 base64）。
- 开发与测试：
  - 本地使用 `vercel dev` 运行以启用 `/api/*` 路由；或直接部署到 Vercel 测试。
  - 保留前端大小与类型校验（≤10MB，JPG/PNG/WebP）。
  - 下载按钮直接保存透明 PNG。

## 具体改动计划
- 更新后端：
  - 在 `api/coze/cutout/run.js:9` 增加对 `COZE_WORKFLOW_ID` 的读取，并在 `payload` 中加入 `workflow_id`。
  - 在 `api/coze/cutout/status.js:8` 适配实际 Coze 状态查询接口的查询参数（若为 `/runs/retrieve` 则使用 `?run_id=`）。
  - 在三个接口中增加对错误时返回体的详细转发，便于调试。
  - 可选：支持使用 `token` 头（当环境变量 `COZE_USE_TOKEN_HEADER=true` 时改为 `headers: { token: sat }`），提高兼容性。
- 前端：
  - 维持现有流程（`cutout.js:141` 上传、`cutout.js:106` 运行、`cutout.js:126` 轮询），无需变更，只需在上线环境访问到 `/api/*` 即可。
- Vercel 配置：
  - `vercel.json:1` 已保留 `/api/(.*)` 直通；无需再改。

## 验证步骤
- 设置 Vercel 环境变量并部署。
- 在线上访问 `cutout.html`：
  - 上传小图片（<1MB）应显示“Processing...”并在 5–15 秒内输出抠图结果。
  - 开发者工具 Network：`/api/coze/upload` 返回 200 且体内有 `file_id`；随后 `/api/coze/cutout/run` 返回 `run_id`；轮询 `/api/coze/cutout/status` 直到状态为 `completed/succeeded`。
  - 下载按钮保存 PNG 文件。
- 异常验证：超时、工作流失败、非图片与超限，均提示友好错误。

## 需要你提供/确认
- 目标抠图工作流的 `workflow_id`（从工作流页面地址可获得）。
- 若与文档不同，请提供你当前使用的工作流运行与状态查询的正式 API 地址。

确认后，我将按以上方案补齐后端 `workflow_id` 支持、状态查询参数细化与可选 `token` 头，同时在 Vercel 配置环境变量并进行端到端联调，解决上传失败问题。