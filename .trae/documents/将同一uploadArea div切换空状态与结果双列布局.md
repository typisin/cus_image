## 目标
- 仅在同一个 `div#uploadArea` 中展示两种状态：
  1) 未选照片：显示当前上传提示内容（空状态）
  2) 已选照片：在同一个 `div` 内切换为双列布局，左列图片预览，右列 Unicode 文本
- 保持整体页面仍为“左侧控制栏 + 右侧内容区”的双列结构不变

## 结构改造
- 修改 `turn-images-into-unicode.html`：
  - 将现有上传提示包裹为 `<div class="empty-state">...</div>`，保留在 `#uploadArea` 内
  - 在同一个 `#uploadArea` 内新增 `<div class="result-state">`，包含 `content-grid` 两列：
    - 左列：`<img id="imagePreview" class="image-preview">`
    - 右列：`<pre id="unicodeOutput" class="unicode-output"></pre>` 与一个“Download Text”按钮
  - 初始仅显示 `empty-state`；`result-state` 默认隐藏

## 样式与切换
- 更新 `unicode.css`：
  - 为 `#uploadArea` 增加状态切换样式：
    - `#uploadArea .empty-state { display: block; }`
    - `#uploadArea.has-image .empty-state { display: none; }`
    - `#uploadArea .result-state { display: none; }`
    - `#uploadArea.has-image .result-state { display: block; }`
  - 定义 `.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }`
  - 为 `unicode-output` 设置等宽字体、滚动与最大高度

## 行为逻辑
- 更新 `unicode.js`：
  - 在 `processFile()` 成功读图后：
    - 给 `#uploadArea` 添加类名 `has-image`
    - 设置 `#imagePreview.src = img.src`
    - 启用 `#convertBtn`
  - 在 `convertImage()` 中：
    - 按当前宽度/字符集/密度生成 ASCII/Unicode 文本
    - 将结果写入 `#unicodeOutput`，不改变滚动位置，不隐藏任何区域
  - `downloadResult()` 改为下载 `#unicodeOutput` 的文本为 `unicode.txt`

## 验证
- 访问 `http://localhost:3000/turn-images-into-unicode`
  - 未上传时，`#uploadArea` 显示空状态
  - 上传后，`#uploadArea` 切换为同一容器内的双列（左图右文本）
  - 点击 Convert 后右列出现 Unicode 文本；点击 Download Text 可下载

## 影响范围
- 仅改动 `turn-images-into-unicode.html`、`unicode.css`、`unicode.js`
- 不改动其他页面与路由；页面文案保持英文