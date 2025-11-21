## 目标
- 将结果态中的两个区域（上：图片预览 `#imagePane`；下：Unicode 文本 `#unicodePane` 内的 `pre#unicodeOutput`）改为高度随当前文本动态适配：
  - 以 `pre` 的实际内容高度为准，两个区域的高度保持一致
  - 文本宽度保持不变，通过字体大小计算保证横向不溢出；纵向全部可见

## 技术方案
1. CSS（unicode.css）
- 为两个区域统一用 CSS 变量控制高度：
  - `#imagePane, #unicodePane { height: var(--pane-h); }`
- `pre` 高度设为内容自适应：
  - `.unicode-output { width: 100%; height: auto; white-space: pre; font-family: monospace; }`
- 预览图填充区域且不裁切：
  - `.image-preview { width: 100%; height: 100%; object-fit: contain; }`

2. JS（unicode.js）
- 新增 `updatePaneHeightByText()`：
  - 先按当前容器宽度与最长行计算字体大小（保证横向不溢出）
    - `fs_h = paneWidth / (maxLineLen * charWidthFactor)`
    - 行距系数 `lineHeightFactor = 1.1`
  - 设置 `pre.style.fontSize` 与 `lineHeight`
  - 读取 `pre.scrollHeight` 得到文本完整高度 `textH`
  - 设置 `#uploadArea` 的 `--pane-h = clamp(textH, minH, maxH)`（例如 `minH=180`，`maxH=1200`）
  - `#imagePane` 与 `#unicodePane` 因使用变量而自动同步高度
- 在 `convertImage()` 完成生成后调用 `updatePaneHeightByText()`；在 `resize` 事件中也调用，保证窗口变化时同步适配
- 初始与空状态：设置一个默认 `--pane-h`（比如 300），上传图片后仍使用该默认高度，生成文本后改为动态高度

## 验证
- 上传不同尺寸图片 → 图片区域随 `--pane-h` 高度变化，完整显示
- 生成不同长度的 Unicode 文本 → `pre` 宽度不变、字体大小自动计算、所有文本纵向完全可见；两个区域高度一致
- 浏览器窗口缩放 → 高度与字体重新计算，保持预期

## 影响范围
- 仅改动 `turn-images-into-unicode.html`（如需设置默认变量）、`unicode.css`、`unicode.js`；不影响其他页面与路由；文案保持英文

请确认方案，我将立即实施并在本地（Vercel dev）验证效果。