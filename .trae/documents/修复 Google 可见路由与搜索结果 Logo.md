## 修改目标
- 让 Google 搜索结果显示站点图标/品牌 Logo（使用你上传的 `logo.png`）。
- 修复 `/describer` 进入 404 的问题，统一到 `/image-describer`。

## 具体改动
- 所有主要页面在 `<head>` 增加 PNG 图标声明，并保留现有 SVG：
  - `index.html` 在 10–12 行后追加：`<link rel="icon" type="image/png" href="/logo.png">`
  - `image-describer.html` 在 13–15 行后追加同样的 PNG 声明，并将社交图与结构化数据指向 `logo.png`：
    - 把 `og:image`、`twitter:image` 改为 `https://www.cusimage.com/logo.png`（当前为 `favicon.svg`，见 24、28 行）
    - 修正 `canonical`、`hreflang`、`og:url`、JSON-LD `url` 的域名为 `https://www.cusimage.com/image-describer`（见 9、19、23、39 行）
  - `ai-cutout.html` 在 10–13 行后追加 PNG 声明，并新增 `<link rel="canonical" href="https://www.cusimage.com/ai-cutout">`
  - `turn-images-into-unicode.html` 在 10–13 行后追加 PNG 声明，并新增 `<link rel="canonical" href="https://www.cusimage.com/turn-images-into-unicode">`
- 在首页添加 Organization 结构化数据（品牌 Logo）：
  - `index.html` 中新增 `<script type="application/ld+json">`，内容包含：
    - `@type: "Organization"`, `url: "https://www.cusimage.com"`, `logo: "https://www.cusimage.com/logo.png"`
- 修复 404 路由：
  - `vercel.json` 增加永久重定向：
    - `{ "source": "/describer", "destination": "/image-describer", "permanent": true }`
    - `{ "source": "/describer/", "destination": "/image-describer", "permanent": true }`

## 验证要点（本地 Vercel 环境）
- 访问 `/describer` 返回 301/308 至 `/image-describer`，`Location` 头正确。
- 用浏览器查看各页面 `<head>`：存在 `logo.png` 的 `rel=icon`，canonical 为线上域名。
- 使用 Google Rich Results Test 验证 Organization/FAQ/WebPage 结构化数据通过。

## 说明
- 仅修改静态 HTML 与 `vercel.json`，不影响功能逻辑。
- `logo.png` 同时用于社交分享卡片与品牌结构化数据；SVG 继续作为现代浏览器图标，PNG 提供给 Google 抓取。