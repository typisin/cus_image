## 问题与目标
- 上传前为“左侧控制栏 + 右侧上传区”的双列布局；上传后变为纵向堆叠，体验不一致。
- 点击“Convert to Unicode”后，需要在右侧区域中实现“左侧保持图片预览、右侧展示生成的Unicode文本”，并且整体仍保持双列（左：控制栏，右：内容区）。

## 现状诊断
- HTML：`tool-container > tool-columns` 下包含 `upload-section` 与 `controls-section`，移动端通过 `flex-direction: column-reverse` 导致纵向堆叠；另外上传后当前逻辑会隐藏 `upload-section` 并显示页面下方的 `result-section`，从而破坏原有双列布局。
- JS：`processFile()` 在成功读图后执行 `uploadSection.style.display = 'none'` 和 `resultSection.style.display = 'block'`；`convertImage()` 只把图片画到 `canvas`，未输出Unicode文本。
- CSS：`.tool-columns` 使用 `flex` + `row-reverse`/`column-reverse` 控制左右顺序；无“右侧内容区内再分两列”的栅格样式。

## 调整方案
1. 右侧内容区改造
- 在 `upload-section` 内新增一个“内容栅格”容器（例如 `content-grid`），固定为两列：
  - 左列：图片预览（如 `#imagePreview` 或现有 `canvas`/`img`）
  - 右列：Unicode文本展示（如 `<pre id="unicodeOutput">`，`white-space: pre;`，`font-family: monospace;`）
- 删除/停用下方独立的 `result-section`，避免上传后跳到页面下方造成纵向流。

2. 行为逻辑调整（仅保留双列）
- `processFile()`：
  - 不再隐藏 `upload-section`；仅启用 `#convertBtn` 并把预览图渲染到右侧内容区的左列。
- `convertImage()`：
  - 使用当前图片与参数（`widthSlider`、`densitySlider`、`charsetSelect`）生成 ASCII/Unicode 文本，填充到右列的 `<pre id="unicodeOutput">`；
  - 保持滚动位置不变，不再滚动到页面下方。
- 保留“Download”功能：将 `<pre>` 文本作为 `.txt` 导出；若继续保留图片导出，也可另提供PNG导出按钮。

3. 样式与响应式
- 新增 `.content-grid`：`display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);`；两列在各种宽度下尽量保持（必要时在极窄屏下允许水平滚动，而非堆叠）。
- 为 `<pre id="unicodeOutput">` 设置滚动与等宽字体：`white-space: pre; overflow: auto; font: 12px/1.1 monospace;`；并给一个浅色背景，提升可读性。

## 代码改动点
- 编辑 `turn-images-into-unicode.html`：
  - 在 `upload-section` 内加入 `content-grid` 两列结构（左：`<div id="imagePane">` 包含 `<img id="imagePreview">` 或 `<canvas>`；右：`<pre id="unicodeOutput"></pre>`）。
  - 移除/注释 `result-section`，或保留为“下载按钮栏”，但不改变主布局。
- 编辑 `unicode.css`：
  - 添加 `.content-grid` 与 `#unicodeOutput` 的样式；确保 `.tool-columns` 始终为左右两列。
- 编辑 `unicode.js`：
  - `processFile()`：取消隐藏 `upload-section`，改为更新左列预览，启用按钮。
  - `convertImage()`：生成文本并写入 `#unicodeOutput`；实现“按密度采样”的字符映射（把 density 作为像素步长或字符单元宽度的系数）。
  - 新增“下载文本”逻辑（把 `#unicodeOutput` 的内容打包为 `unicode.txt`）。

## 验证用例
- 上传图片后，页面仍保持“左（控制）+ 右（内容）”的双列；右侧内容内为“左（预览）+ 右（Unicode）”。
- 调整 `widthSlider`/`densitySlider`/`charsetSelect` 后点击“Convert to Unicode”，右侧的 `<pre>` 出现文本，左侧保持图片。
- 断网或异常时提示错误但不改变布局。

## 交付与影响范围
- 涉及文件：`turn-images-into-unicode.html`、`unicode.css`、`unicode.js`；不改动其他页面与路由。
- 保持当前所有页面英文文案；继续用 Vercel 本地环境验证。

请确认以上方案，我将据此实施并在本地（Vercel dev）验证后交付修改。