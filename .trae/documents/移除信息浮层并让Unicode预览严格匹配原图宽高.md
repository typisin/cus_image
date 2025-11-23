## 目标
- 移除图片信息浮层 `div.image-info`，避免遮挡。
- 让 `pre#unicodeOutput` 的显示区域与原图在页面中的“实际显示宽高”严格一致，并压缩字符展示空间，不再撑到超大。

## 代码改动
### 1) 移除信息展示元素
- 删除 HTML 中的图片信息浮层：`turn-images-into-unicode.html` 第 72–76 行的 `<div id="imageInfo">…</div>`。
- 删除输出统计信息面板：`turn-images-into-unicode.html` 第 83 行的 `<div id="outputInfo"></div>`。
- 删除对应样式：`unicode.css` 中的 `.image-info` 与 `.output-info` 规则。
- 删除 JS 相关逻辑：在 `unicode.js:102–115` 的 `updatePreview()` 中移除对 `imageInfo/aspectRatioDisplay` 的更新。

### 2) 让预览尺寸与原图一致
- 在 `convertImage()` 完成 ASCII 生成后，获取页面中原图的实际展示尺寸：`const w = imagePreview.clientWidth; const h = imagePreview.clientHeight;`。
- 将 `unicodePane` 与 `unicodeOutput` 的尺寸强制设置为与原图一致：
  - `pane.style.width = w + 'px'; pane.style.height = h + 'px';`
  - `out.style.width = w + 'px'; out.style.height = h + 'px';`
- 停止使用当前的动态最小高度逻辑：移除或改造 `adjustContainerHeight()` 的调用（`unicode.js:173`）。不再给 `pre` 设置超大的 `min-height`，避免内容无限扩张。

### 3) 字体与字符比例自适配
- 保留字符宽高比例因子（约 0.6），但将字号适配限定在原图尺寸的可用空间内：
  - 调整 `fitAsciiToPane()`（`unicode.js:193–220`）：以 `pane.clientWidth`/`pane.clientHeight` 为硬边界，计算最小合适字号；若内容仍溢出，允许 `overflow: auto` 或 `hidden`，优先选择压缩展示空间。
  - 将 `unicode-output` 的 `overflow` 从 `visible` 改为 `hidden` 或 `auto`（推荐 `auto` 以便滚动查看）。

### 4) 样式微调
- `unicode.css`：
  - 为 `#unicodePane .unicode-output` 设置固定宽高（由 JS 注入 inline style），并将 `overflow` 设为 `auto`。
  - 取消任何会人为增高容器的 `min-height` 设置，确保不扩大空间。

## 验证方案（本地 Vercel 环境）
- 使用本地 Vercel 开发环境运行：`vercel dev`，确保与线上变量与路由一致。
- 验证步骤：
  - 上传不同纵横比图片（如 1:1、4:3、16:9、9:16）。
  - 观察 `pre` 是否与原图在页面中的显示宽高一致。
  - 确认字符区域不再变得超大，字号在可视范围内自适配，窄高图也不再拉长。

## 风险与兼容
- 字体渲染差异可能导致极端情况下部分字符无法完全在一步内自适配；已通过最小字号与滚动兜底。
- 若原图显示尺寸过小，ASCII 细节会下降；可以保留宽度滑杆作为抽样分辨率控制，但显示区域仍与原图一致。

请确认以上方案，我将按此实施并在本地 Vercel 环境完成验证。