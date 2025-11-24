## 目标
- 参照 Image Describer 页面 SEO 模板，为 Blank Image 页面补齐与增强 SEO 元信息、结构化数据与页面内文案，围绕关键词“blank image”及实际功能进行优化。

## 元信息（Head）
- 标题：`Blank Image Generator – Printable Grid, Lined & Staff Paper | CusImage`
- 描述（英文，页面文案约束）：强调自定义尺寸、单位（px/mm/in）、DPI、网格/横线/竖线、模板（Lined/Staff/Graph）、导出（PNG/JPG/SVG）等特性
- 关键词（英文）：`blank image, printable blank page, grid paper, lined paper, staff paper, A4, Letter, DPI, PNG, JPG, SVG`
- 其他：
  - `robots: index, follow`
  - `canonical: https://www.cusimage.com/blank-image`
  - `hreflang: en`
  - OpenGraph/Twitter：`og:title`、`og:description`、`og:type=website`、`og:url`、`og:image`；`twitter:card=summary`、`twitter:title`、`twitter:description`、`twitter:image`

## 结构化数据（JSON-LD）
- `WebPage`：页面名称、URL、描述、语言
- `SoftwareApplication`：应用名称 `Blank Image Generator`，类别 `MultimediaApplication`，操作系统 `Web Browser`，`offers: Free`
- `FAQPage`：
  - 什么是 blank image 生成器？
  - 如何设置纸张尺寸与 DPI？
  - 如何添加网格、横线、竖线及线型？
  - 支持哪些导出格式（PNG/JPG/SVG）？
  - 是否可打印、是否免费？

## 页面内 SEO 文案（English，仅页面文案遵循项目规则）
- 在主内容下方新增 `faq-card` 样式的说明区：
  - 介绍段落：覆盖关键词（blank image、grid paper、lined paper、printable 等）
  - 特性列表：纸张预设（A4/A3/Letter）、单位与DPI、网格/线型、模板、导出格式
  - FAQ 条目 3–5 个，与 JSON-LD 内容一致
- 添加到现有 `blank-image.html` 中，遵循 UI 规范的样式类（`faq-card`、`tool-h1` 等）

## 内部链接
- 在文案中添加到相关页面的链接：`/image-describer`、`/ai-cutout`、`/400x400-black-image`

## 实施范围
- 仅编辑 `blank-image.html`；不改动后端与环境变量；保持现有 Analytics 的懒加载脚本

## 验证
- 本地 Vercel：检查 Head 元信息、JSON-LD 无报错、FAQ 文案渲染与响应式
- 关键词与功能点覆盖符合预期