## 问题判断
- 事件流程：`Generate` 点击仅在已有文件时调用 API；若无文件则触发文件选择并立即 `return`，选择后不会自动继续生成，需再次点击。
- 同源问题：若在 `http://localhost:8000` 预览，`/api/describe` 不存在，导致请求失败并回退到本地分析。

## 修复方案
- 交互修正：
  - 引入 `pendingGenerate` 标记。点击 `Generate`：
    - 若无文件：`pendingGenerate = true` → `file.click()` → 等待 `change` 后自动开始生成；
    - 若已有文件：直接开始生成。
  - 在 `file.change`：完成预览后，如果 `pendingGenerate` 为真，自动调用生成逻辑。
- 生成函数抽象：提取为 `startGenerate(file)`：
  - `desc.textContent = 'Generating description…'`
  - 压缩到 ≤1024px → `describeViaAPI` → 成功填充；失败回退到 `analyze(img)`；最后清空 `pendingGenerate`。
- 同源统一：
  - 本地调试改为使用 `vercel dev` 的 `http://localhost:3000` 访问页面，确保 `/api/describe` 路由可用。

## 代码改动点
- `describer.html`：
  - 新增 `var pendingGenerate = false;`
  - 修改 `generateBtn.addEventListener('click', ...)`：分支处理是否已有文件，未选文件则设标记并触发选择；已有文件则调用 `startGenerate(f)`。
  - 修改 `file.addEventListener('change', ...)`：完成预览后，若 `pendingGenerate` 为真则调用 `startGenerate(f)`。
  - 新增 `startGenerate(f)` 函数，封装压缩与服务端调用逻辑。

## 验证步骤
- 用 `vercel dev` 访问 `http://localhost:3000/describer.html`。
- 两种路径验证：
  - 先点击 `Generate` → 弹出文件选择 → 选图后自动生成并填充服务端描述。
  - 先点击预览区域选图 → 再点击 `Generate` → 生成并填充服务端描述。
- 网络面板确认 `POST /api/describe` 发出并返回；失败时仍有回退描述。请确认后我将实施修改并验证。