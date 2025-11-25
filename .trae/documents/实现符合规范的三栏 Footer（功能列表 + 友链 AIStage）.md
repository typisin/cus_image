## 目标
- 为首页实现一个符合 UI 设计规范的 Footer，包含：
  1) 功能列表（链接到站内功能页面）
  2) 友链（AIStage）
  3) 品牌与版权信息
- 文案与标题使用英文，符合项目规则。

## 结构设计（HTML）
- 文件：`/Users/youpengtu/Applications/cus_image/index.html`
- 结构：
```
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">...品牌与简介...</div>
      <div class="footer-section">
        <h4 class="footer-title">Tools</h4>
        <ul class="footer-list">
          <li><a href="/image-describer">Image Describer</a></li>
          <li><a href="/ai-cutout">AI Cutout</a></li>
          <li><a href="/turn-images-into-unicode">Turn Images into Unicode</a></li>
          <li><a href="/images-for-fb-cover">Fb Covers</a></li>
          <li><a href="/400x400-black-image">400x400 Black Image</a></li>
          <li><a href="/blank-image">Blank Image</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4 class="footer-title">Friends</h4>
        <ul class="footer-list">
          <li><a href="https://aistage.net" target="_blank" rel="noopener noreferrer">AIStage</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 CusImage. All rights reserved.</p>
    </div>
  </div>
</footer>
```

## 样式（CSS，添加到 `styles.css`）
- 使用设计系统变量：颜色、间距、圆角、阴影、字体 Inter。
- 栅格与响应式：
  - `.footer-grid`: `display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: var(--space-8);`
  - ≤768px: 单列栅格
- 标题与列表：
  - `.footer-title`: 字重 600，颜色 `var(--gray-900)`，下边距 `var(--space-3)`
  - `.footer-list`: 去除默认样式，条目间距 `var(--space-2)`；链接颜色 `var(--gray-700)` 悬停主蓝，并有 `:focus-visible` 边框/阴影指示
- 容器与底部：
  - `.footer`: 背景白色，顶部边框 `var(--gray-200)`，内边距使用 `var(--space-8)`
  - `.footer-bottom`: 顶部边框或轻微分隔，字号使用辅助文本规范

## 验证
- 使用本地 Vercel 环境预览首页表现；检查栅格、颜色、间距、响应式是否符合规范。

我将按以上方案更新 `index.html` 与 `styles.css` 并进行本地验证。