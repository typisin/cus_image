## 优化目标
- 参考 `image-describer.html` 的 SEO 模板，为 `turn-images-into-unicode.html` 与 `ai-cutout.html` 补齐搜索引擎、社交与结构化数据。
- 所有页面文案与描述保持英文。
- 保持本地 Vercel 环境一致性进行验证。

## 将新增/对齐的 SEO 要素
- 基础元信息：`meta description`、`meta keywords`（已存在，仅微调长度与关键词覆盖）、`meta robots`（补充 `index, follow`）。
- 规范链接：`canonical`（保持路径为站点主域对应页面）。
- 社交分享：Open Graph 与 Twitter Card（`og:title/description/type/url/image`、`twitter:card/title/description/image`）。
- 语言与地域：`link rel=alternate` 带 `hreflang="en"`，`og:locale`（如 `en_US`）。
- 结构化数据：JSON-LD
  - `WebPage`：name/url/description/inLanguage。
  - `SoftwareApplication`：name、applicationCategory、operatingSystem、offers（免费）。
  - `FAQPage`：每页 2–3 条问答，覆盖用户意图与核心功能。
- 语义与可访问性：确保主要标题唯一且清晰（保留现有结构，不改动品牌 `h1`，工具说明用 `h2`；图片均保留 `alt`）。

## 文件与插入位置
- `image-describer.html` 作为参照：
  - 参考位置：`image-describer.html:21–29` 的 OG/Twitter；`image-describer.html:35–74` 的两段 JSON-LD。
- `turn-images-into-unicode.html`：
  - 在 `turn-images-into-unicode.html:3–20` 的 `<head>` 中：
    - 新增 `meta name="robots" content="index, follow"`。
    - 新增 OG/Twitter（title/description/url/image）。
    - 新增 `link rel="alternate" hreflang="en"`。
    - 新增 JSON-LD（`WebPage` + `SoftwareApplication` + 简短 `FAQPage`）。
- `ai-cutout.html`：
  - 在 `ai-cutout.html:3–20` 的 `<head>` 中：
    - 新增 `meta name="robots" content="index, follow"`。
    - 新增 OG/Twitter（title/description/url/image）。
    - 新增 `link rel="alternate" hreflang="en"`。
    - 新增 JSON-LD（`WebPage` + `SoftwareApplication` + 简短 `FAQPage`）。

## 具体内容（英文）
- Open Graph（示例，以 Unicode 页为例）：
  - `og:title`: "Turn Images into Unicode – Free Converter & ASCII Art Generator"
  - `og:description`: "Convert any image into Unicode art and ASCII characters. Perfect for terminals, social posts, and creative projects."
  - `og:type`: "website"
  - `og:url`: "https://www.cusimage.com/turn-images-into-unicode"
  - `og:image`: "https://www.cusimage.com/logo.png"
- Twitter Card：`summary_large_image`（两页一致，标题与描述对应各自功能）。
- JSON-LD（Unicode 页）：
  - `WebPage`: name/url/description/inLanguage。
  - `SoftwareApplication`: name="Turn Images into Unicode Converter", applicationCategory="MultimediaApplication", operatingSystem="Web Browser", offers 价格 0。
  - `FAQPage`: 例如 "What is a Unicode converter?", "Is it free?", "How does ASCII art work?"。
- JSON-LD（Cutout 页）：
  - `WebPage` 与 `SoftwareApplication` 名称与描述匹配背景移除工具；FAQ 覆盖 "What is AI cutout?", "Is it free?", "How precise is edge detection?"。

## 验证与一致性
- 使用 `vercel dev` 在本地验证两页 head 输出是否正确、无重复标签；通过浏览器检查 `<head>` 元信息与 JSON-LD 渲染。
- 保持所有描述英文，与项目规则一致。

## 预计改动范围
- 仅在两页 `<head>` 中新增若干 `meta/link` 与两个 `script type="application/ld+json"` 片段，无需改动主体交互代码。

请确认以上方案，我将据此为 Unicode 与 Cutout 页面落地 SEO 优化并在本地 Vercel 环境完成验证。