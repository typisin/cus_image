## 目标与假设
- 目标：让 `image-describer` 的交互路径与抠图页一致，步骤为：
  1）初始仅展示上传区域；2）选择图片后展示结果页（左：原图预览，右：描述结果占位）；3）点击“Generate”触发生成；4）生成完成后展示结果（支持复制、重新上传）。
- 假设：“身穿个很难过结束展示结果”指“生成后结束并展示结果”；若需额外状态提示，可在结果区加入轻量 toast。
- 页面文字与文案保持英文（遵循项目规则）。

## 页面结构调整（`/image-describer.html`）
- 新增与抠图页一致的两段式布局：
  - `upload-section`：仅包含上传区（拖拽 + 选择文件按钮 + 支持格式说明）。
  - `results-section`（初始 `display: none`）：
    - 左栏：`Original Image`（`#originalImagePreview`）。
    - 右栏：`AI Description`（`#descriptionText` 占位文案 + 加载覆盖层）。
    - 顶部操作：`Reupload`、`Copy`、`Generate`。
- 复用 `cutout.css` 的栅格和按钮样式，或最小增量适配现有 `styles.css`，确保视觉一致性。

## 交互流程与逻辑
- 初始仅显示 `upload-section`；`results-section` 隐藏。
- 选择文件后：
  - 立即显示原图预览至 `#originalImagePreview`。
  - 从 DOM 中暂时移除 `upload-section`（与抠图页一致的“detach”策略），显示 `results-section`。
  - 在描述区显示占位文案：`Ready for AI description`。
- 点击 `Generate`：
  - 显示加载覆盖层（`Processing description...`）。
  - 将图片按照现有逻辑压缩为 dataURL（参考 `image-describer.html:246-267`）。
  - 调用后端 `POST /api/describe`（参考 `image-describer.html:269-283`），优先采用服务端返回描述，失败则回退本地分析（参考 `image-describer.html:171-240`）。
  - 写入结果到 `#descriptionText`，隐藏加载层，显示 `Copy`。
- 点击 `Copy`：复制描述文本。
- 点击 `Reupload`：恢复初始态，将 `upload-section` 插回原位置并显示，清理预览与结果。

## 文案与可访问性（英文 UI 文案）
- 上传区：
  - 标题：`Upload Image for AI Description`
  - 说明：`Drag & drop or choose a file`
  - 支持格式：`Supports JPG, PNG, WebP`
- 结果区：
  - 左：`Original Image`
  - 右：`AI Description`
  - 加载文案：`Processing description...`
  - 占位文案：`Ready for AI description`
  - 按钮：`Reupload`、`Copy`、`Generate`
- 无障碍：为按钮与区块添加 `aria-label`，为图片加 `alt`；结果区采用语义化标题。

## 前后端接口保持不变
- 继续使用 `process.env.VOLC_API_KEY` 与 `process.env.VOLC_ENDPOINT_ID|VOLC_MODEL`（`api/describe.js:7-15`）。
- 前端调用逻辑复用 `describeViaAPI`（`image-describer.html:269-283`）与本地分析回退（`image-describer.html:171-240`）。

## 验证方案
- 本地 `vercel dev` 下：
  - 初始仅见上传区；选择图片后出现带原图与描述区的结果页。
  - 点击 `Generate`，描述文本更新；`Copy` 正常复制；`Reupload` 恢复初始态。
- 接口错误与超时：显示占位与错误提示，不影响重新上传与再次生成。

## 变更范围
- 修改 `image-describer.html`：
  - 重构 DOM 结构为两段式（新增 `results-section`、规范预览与按钮 ID）。
  - 调整内联脚本：引入 `detach/restore` 行为、加载覆盖层控制、生成流程钩子与重置逻辑。
- 视需要轻度调整样式（优先复用现有样式，不新增文件）。

## 交付与回滚
- 交付：一次性更新 `image-describer.html`，确保符合 Cutout 交互范式。
- 回滚：保留原有生成与分析函数，若需回退仅恢复旧 DOM 结构与事件绑定。

请确认以上方案，我将据此开始实施修改并在本地预览验证。