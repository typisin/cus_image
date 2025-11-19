## 目标
- 在用户上传图片后，将文件安全上传到 Coze，获取 `file_id`。
- 使用同一个 Service Access Token 触发抠图工作流并获取结果。
- 前端不暴露 Token，所有对 Coze 的调用都通过后端（Vercel Serverless）。
- 在现有 Cutout 页面展示原图与抠图结果，并提供下载。

## 后端接口设计（Vercel Serverless）
- `POST /api/coze/upload`
  - 入参：`multipart/form-data`，字段 `file`。
  - 动作：携带服务端环境变量 `COZE_SAT` 调用 Coze 文件上传接口，返回 `{ file_id }`。
- `POST /api/coze/cutout/run`
  - 入参：`{ file_id: string }`。
  - 动作：携带 `COZE_SAT` 触发 Coze 工作流运行，返回 `{ run_id }`。
- `GET /api/coze/cutout/status?run_id=...`
  - 动作：查询工作流运行状态；完成后返回 `{ status, result }`（包括抠图后的图片 URL 或 base64 数据）。
- 安全：所有路由仅由前端调用；Token 存储于 `process.env.COZE_SAT`，绝不写入前端代码或响应。

## Coze 集成要点
- 文件上传
  - Header：`Authorization: Bearer ${COZE_SAT}`，其他按文档要求。
  - Body：`multipart/form-data`，文件字段 `file`。
  - 响应：解析并返回 `file_id` 给前端。
- 工作流触发
  - 使用文档指定的 Workflow Run 接口，传入 `file_id`。
  - 响应：`run_id`；前端或后端轮询状态接口直到完成。
- 结果获取
  - 轮询返回完成后，提取抠图结果（URL 或数据流），通过后端转发给前端。

## 前端改造（Cutout 页面）
- 上传逻辑
  - 将当前本地模拟处理替换为：
    - `POST /api/coze/upload` 上传文件，得到 `file_id`。
    - `POST /api/coze/cutout/run` 触发工作流，得到 `run_id`。
    - 轮询 `GET /api/coze/cutout/status?run_id=...` 直到完成，展示结果。
- 展示与交互
  - 保持现有 UI：原图/结果并排、处理中动画、失败提示、下载按钮。
  - 下载时直接保存结果 PNG（透明背景）。

## 安全与合规
- 不在任何前端代码或可见配置中出现 Token。
- Vercel 环境变量：`COZE_SAT`。
- 后端 `fetch` 时设置合理的超时与重试；限制前端上传大小（<=10MB）。
- 对上传的 `Content-Type` 与文件扩展名进行校验；拒绝非图片。

## 部署与配置（Vercel）
- `vercel.json` 中配置 `functions` 路由到 `api/coze/*`。
- 在 Vercel 项目设置中新增环境变量：`COZE_SAT`（生产与预览环境）。
- 部署后用 Vercel 提供的域名进行联调；确保 CORS 合法（同域无需额外设置）。

## 测试与验证
- 本地：使用 `vercel dev` 或本地 serverless 模拟，上传小图测试端到端流程。
- 云端：部署到 Vercel 后，用真实图片测试，观察日志与延迟。
- 失败场景：网络错误、超时、非图片、超过大小、工作流失败时用户提示与重试。

## 交付物
- 后端：`api/coze/upload`、`api/coze/cutout/run`、`api/coze/cutout/status` 实现。
- 前端：Cutout 页面调用上述接口并展示结果。
- 配置：`vercel.json` 路由与环境变量说明。

## 后续可选优化
- 将轮询改为 SSE 或 WebSocket（若 Coze/后端支持）。
- 队列与并发控制，避免频繁触发工作流。
- 缓存最近结果以降低重复请求成本。

请确认以上方案，我将开始实现后端接口与前端改造，并部署到 Vercel。