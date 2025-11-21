## 目标
- 在同一 `#uploadArea` 中：结果态为上下布局，上为图片，下为 Unicode 文本。
- 两个子区块的高度始终为“当前 `#uploadArea` 高度的 1/2”，上传不同尺寸图片时按容器缩放，不改变容器高度。
- `pre#unicodeOutput` 宽度固定，不随内容变化；高度自适应为容器的 1/2，并通过动态字体缩放让所有文本在该高度内完全可见（不产生溢出）。

## CSS 改动
- `unicode.css`：
  - 为 `#imagePane`、`#unicodePane` 增加占位样式：`height: var(--pane-h);`、`min-height: var(--pane-h);`、`overflow: hidden;`。
  - 预览图样式：`.image-preview { width: 100%; height: 100%; object-fit: contain; }`，确保不同尺寸图片都完整展示且不超出。
  - `pre` 基础样式保持等宽字体与内部滚动备用，但默认通过 JS 动态缩放字体避免滚动。

## JS 改动
- `unicode.js`：
  - 初始化与窗口尺寸变化：在 `DOMContentLoaded` 与 `resize` 事件中，测量 `#uploadArea.clientHeight`，计算 `paneHeight = Math.floor(clientHeight/2)`，设置根节点 `--pane-h` CSS 变量，应用到 `#imagePane` 与 `#unicodePane`。
  - 上传成功：不改变容器高度，仅切换到结果态，图片以 `object-fit: contain` 呈现于上半区。
  - 转换后文本渲染：
    - 得到 `asciiArt` 后，计算行数与最长行长度。
    - 动态计算 `fontSize` 使文本在固定宽高内完全可见：
      - 垂直适配：`fs_v = paneHeight / linesCount / lineHeightFactor`
      - 水平适配：用 canvas 量测 `"M"` 的宽度或按等宽字估算，`fs_h = paneWidth / maxLineLen / charWidthFactor`
      - 最终字体大小：`fs = clamp(min(fs_v, fs_h), fs_min, fs_max)`，并设置 `pre.style.fontSize` 与相应 `lineHeight`。
    - 设置 `pre.textContent = asciiArt`，`pre.style.width = '100%'` 保持宽度不变。

## 验证
- 上传不同尺寸图片：上区始终为容器 1/2 高度，完整可见；下区 `pre` 高度固定为 1/2，文本通过动态字体缩放在该区域内完全展示，无溢出与换行裁切。
- 改变窗口大小：两区高度随 `#uploadArea` 实测高度变化，按比例保持 1/2，文本与图片重新适配。

## 影响范围
- 仅改动 `turn-images-into-unicode.html`（若需设置 CSS 变量挂载位置）、`unicode.css`、`unicode.js`。
- 不修改路由与其他页面，文案维持英文。