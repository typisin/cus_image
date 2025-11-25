## 方案概述
- 创建一个共享 Footer 组件，在所有页面复用，以统一样式与内容并简化后续维护。
- 使用原生 Web Component（自定义元素 `cus-footer`），在组件内渲染与首页一致的三栏结构（Brand/Tools/Friends）。
- 保持文案与样式英文，符合 UI 规范文档的字体、颜色、间距与响应式要求。

## 实施细节
- 新增 `footer.js`：注册 `cus-footer`，`connectedCallback()` 注入统一的 `<footer class="footer">` 结构，内容包含：
  - Brand：CusImage 简介与版权
  - Tools：站内功能列表链接（Image Describer、AI Cutout、Turn Images into Unicode、Fb Covers、400x400 Black Image、Blank Image）
  - Friends：AIStage、Free Image to Prompt AI 外链（使用 `target="_blank" rel="noopener noreferrer"`）
- 页面改造：
  - 在所有页面末尾替换原有 `<footer>` 为 `<cus-footer></cus-footer>`
  - 在页面引用 `footer.js`：`<script src="/footer.js" defer></script>`
  - 覆盖页面列表：`index.html`、`image-describer.html`、`ai-cutout.html`、`turn-images-into-unicode.html`、`images-for-fb-cover.html`、`400x400-black-image.html`、`blank-image.html`、`black-400.html`

## 验证
- 使用本地 Vercel 环境打开所有页面，检查 Footer 显示一致、链接正常、响应式表现良好。
- 后续 Footer 变更只需修改 `footer.js` 一处即可全站生效。