## 目标
- 将 400x400 Black Image 页面纳入全站导航（所有子页面与首页 Menu 下拉列表增加该入口）。
- 在首页功能列表新增该工具卡片。
- 同时按 UI 规范优化 `400x400-black-image.html` 的样式（移除内联、统一按钮与卡片风格、响应式与可访问性）。

## 涉及文件
- 导航：`index.html`、`image-describer.html`、`ai-cutout.html`、`turn-images-into-unicode.html`、`images-for-fb-cover.html`、`layout-demo.html`、`test-navigation.html`、`400x400-black-image.html`
- 样式：`styles.css`（新增通用类）、复用 `cutout.css` 现有 `.tool-title`/`.tool-description`

## 导航改动
- 在各文件的 `<ul class="nav-menu">` 中新增：`<li><a href="/400x400-black-image" class="nav-link">400x400 Black Image</a></li>`。
- 当前页为 400x400 时，设置 `class="nav-link active"` 或 `aria-current="page"`。
- 保持现有顺序与语义，文案使用英文。

## 首页功能列表改动
- 在 `index.html` 的 `.features-grid` 中新增一个卡片：
  - `href="/400x400-black-image"`
  - `card-icon`：简单方形图标（SVG 黑色方块造型，保持 48×48 与 1.5px 描边风格一致）。
  - `card-title`：`400x400 Black Image`
  - `card-description`：`Generate and download a 400×400 pure black image in PNG, JPG, or SVG formats`
  - `card-cta`：`Get Started →`

## 页面样式优化（400x400-black-image.html）
- 使用 `.card-layout` 替换 `faq-card` 外层容器。
- 移除内联样式，新增/复用类：
  - `.image-preview-container`（白/灰卡片内的预览容器：背景 `var(--gray-50)`、边框 `var(--gray-200)`、圆角 `var(--radius-lg)`、内边距 `var(--space-3)`）
  - `.download-actions`（按钮区域：居中、`gap: var(--space-3)`、`margin-top: var(--space-4)`）
  - `.assistive-text`（说明文字：`font-size: 0.875rem`、`color: var(--gray-500)`、`margin-top: var(--space-2)`）
- 在 `styles.css` 补充按钮变体（不影响现有页面）：
  - `.btn` 基础样式（对齐现有规范）
  - `.btn-primary`/`.btn-secondary`（主蓝色与白底边框变体，含 `:hover`、`:focus-visible`）
- 可访问性：按钮添加 `aria-label`；保留 Canvas 的 `aria-label`；统一 `:focus-visible` 蓝色轮廓。

## 响应式与一致性
- 复用 `styles.css` 的断点体系（≤768px/≤480px 自动收敛卡片与按钮尺寸）。
- 所有数值使用设计系统变量（颜色、间距、圆角、阴影、时长）。

## 验证步骤
- 本地 `vercel dev`：
  - 逐页检查 Menu 是否包含 `400x400 Black Image`，当前页高亮状态是否正确。
  - 首页功能卡片是否渲染正确、交互一致（hover/焦点）。
  - `400x400-black-image` 页：卡片视觉、按钮态（hover/focus）、响应式表现；PNG/JPG/SVG 下载正确。

## 备注
- 页面与导航文案均使用英文，符合项目规则；我将按现有代码风格进行最小侵入式改动，统一使用设计系统变量与类名。