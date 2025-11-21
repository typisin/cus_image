## 目标
- 上传后隐藏上传区域，直接展示控件区与预览区域
- 点击 Convert 生成右侧图片（Canvas），不再生成文本 ASCII
- 移除文本输出 `pre#unicodeOutput`

## 页面结构调整
- `unicode.html`
- 从 `result-section` 中移除 `div.result-content` 与其中的 `pre#unicodeOutput`
- 在 `result-actions` 中保留 `Download` 按钮，移除 `Copy`（可选，若只针对文本）

## 脚本逻辑调整
- `unicode.js`
- 文件选择：在 `processFile(file)` 成功后隐藏 `.upload-section`，显示 `#resultSection`，启用 `#convertBtn`
- 转换：在 `convertImage()` 中仅计算画布尺寸并将 `this.currentImage` 绘制到 `#previewCanvas`；移除 ASCII 生成与 `unicodeOutput`/`unicodePreview` 的赋值
- 下载：修改 `downloadResult()`，导出 `#previewCanvas` 为 PNG 并触发下载
- 移除或停用 `copyResult()`（若不再需要文本复制）

## 样式与布局
- 无需大幅改动样式；确保预览区在上传隐藏后正常显示
- 保持按钮主题与控件区纵向布局的既有优化

## 验收
- 上传图片后上传区消失，控件区与预览区出现
- 点击 Convert 在右侧 Canvas 显示图片
- 点击 Download 下载 Canvas PNG
- 页面无 `pre#unicodeOutput` 文本输出