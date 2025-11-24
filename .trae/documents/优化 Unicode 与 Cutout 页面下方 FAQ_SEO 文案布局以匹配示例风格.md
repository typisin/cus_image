## 目标
- 参考你提供的截图与现有 Image Describer 页面风格，为 Unicode 与 AI Cutout 页面下方的 SEO 文案与 FAQ 采用一致的卡片式布局（圆角、浅灰背景、阴影、合理间距与排版）。

## HTML 结构调整（不改动上方工具区，仅优化下方文案区）
- 统一结构：
  - 外层：`<section class="faq">` → `<div class="container">`
  - 标题：`<h2>`（模块标题）+ `<h1 class="tool-h1">`（主标题，渐变样式）
  - 简介与特性：使用 `content-grid` 两列 → 每列包裹一个 `content-pane`，内部用卡片容器 `faq-card`（简介一卡、特性列表一卡）
  - FAQ 列表：使用 `content-grid` 三列（移动端一列），每个问答块包裹在 `content-pane` 内的 `faq-card` 里
- 页面位置：
  - `turn-images-into-unicode.html`：已存在 `section.faq`，改造其内部为上述结构
  - `ai-cutout.html`：在 `</main>` 与 `<footer>` 之间新增 `section.faq`，结构与 Unicode 页一致，文案针对 Cutout 功能（与上方 SEO 元信息一致）

## CSS 样式补充与对齐（新增少量类，复用现有设计系统变量）
- 新增/补充样式（建议添加到 `styles.css` 或页面专用 CSS 中）：
  - `.faq-card`: 背景 `var(--gray-50)`、边框 `1px solid var(--gray-200)`、圆角 `var(--radius-xl)`、内边距 `var(--space-6)`、阴影 `var(--shadow-sm)`、行距 `1.6`
  - `.faq-card h2, .faq-card h3`: 字重 600，颜色 `var(--gray-900)`，底部间距 `var(--space-3)`
  - `.faq-card ul`: 左缩进、项间距 `0.5rem`
  - `.faq-intro .tool-h1`: 保持与 Image Describer 相同的渐变文本（已存在样式复用）；顶部外边距 `var(--space-4)`、底部 `var(--space-4)`
  - `.faq .content-grid`: 保持现有网格样式，卡片间距 `var(--space-6)`，在移动端单列（768px 以下）
- 响应式：
  - `<768px`：所有 `content-grid` 切为单列；标题字号略降（复用现有断点）

## 文案（英文，保持项目规则）
- Unicode 页：
  - 简介卡：简述 Unicode/ASCII 文本艺术用途
  - 特性卡：免费、保持宽高比、多字符集、复制/下载、隐私友好
  - FAQ 卡：What is Unicode art? / Is the converter free? / How do you keep aspect ratio?
- Cutout 页：
  - 简介卡：AI 背景移除用途与优势
  - 特性卡：精准边缘、发丝细节、浏览器内运行、隐私友好、支持常见格式
  - FAQ 卡：What is AI cutout? / Is the cutout tool free? / How accurate is edge detection?

## 验证（本地 Vercel 环境）
- 使用 `vercel dev` 打开两页，检查：卡片圆角、阴影、间距、标题排版是否与示例一致；移动端是否降为单列，视觉舒适。
- 确认无新 404（已移除对 `/logo.png` 的引用；Insights 脚本本地不加载）。

## 变更范围与注意
- 仅在两个页面的文案区增加/改造 HTML 包裹与少量 CSS 类；不改动工具区逻辑。
- 保持英文文案，符合项目规则；不新增多余文件，仅在现有 CSS 中追加若干规则。

请确认，我将按以上方案实施并在本地 Vercel 环境完成验证。