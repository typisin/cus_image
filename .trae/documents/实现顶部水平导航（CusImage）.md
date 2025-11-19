## 导航目标与原则
- 顶部水平导航，功能导向，承载当前页面的三项核心功能。
- 桌面端优先，移动端简化；扁平化、简约交互；一致使用设计系统变量。

## 信息架构
- 导航项（按重要性与使用频率排序）：
  - 描述生成（`#describer`）
  - 智能抠图（`#cutout`）
  - Unicode艺术（`#unicode`）
- 保持与卡片锚点一致，避免语义不一致。

## HTML 结构改造
- 在 `header > .container` 中，左侧保留 `.brand`，右侧新增 `nav.nav`。
- 目标结构：
```html
<header class="header">
  <div class="container">
    <div class="brand">
      <div class="logo">🖼️</div>
      <h1 class="title">CusImage</h1>
      <p class="subtitle">智能图片编辑解决方案</p>
    </div>
    <nav class="nav" aria-label="主导航">
      <ul class="nav-menu">
        <li><a href="#describer" class="nav-link">描述生成</a></li>
        <li><a href="#cutout" class="nav-link">智能抠图</a></li>
        <li><a href="#unicode" class="nav-link">Unicode艺术</a></li>
      </ul>
    </nav>
  </div>
</header>
```

## 样式设计（扁平化）
- 使用现有变量与排版规范；不引入额外阴影，仅用颜色与底边指示状态。
```css
.header .container { display: flex; align-items: center; justify-content: space-between; }
.nav { display: flex; align-items: center; }
.nav-menu { display: flex; gap: var(--space-6); list-style: none; margin: 0; padding: 0; }
.nav-link { display: inline-flex; align-items: center; height: 44px; padding: 0 var(--space-2); color: var(--gray-700); text-decoration: none; border-bottom: 2px solid transparent; transition: color var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease); }
.nav-link:hover { color: var(--gray-900); border-bottom-color: var(--primary-blue-light); }
.nav-link[aria-current="page"], .nav-link.active { color: var(--gray-900); border-bottom-color: var(--primary-blue); }
.nav-link:focus-visible { outline: 2px solid var(--primary-blue-light); outline-offset: 2px; border-radius: var(--radius-sm); }
```

## 响应式策略（桌面优先，移动简化）
```css
@media (max-width: 768px) {
  .header { padding: var(--space-4) 0; }
  .header .container { flex-direction: column; align-items: stretch; gap: var(--space-3); }
  .brand { justify-content: center; }
  .nav-menu { justify-content: center; gap: var(--space-4); }
  .nav-link { height: 36px; }
}
@media (max-width: 480px) {
  .nav-menu { gap: var(--space-3); flex-wrap: wrap; }
  .nav-link { font-size: 0.875rem; }
}
```

## 交互与可用性
- 无登录区，右侧仅导航；未来若增加用户入口，可在 `.nav` 右侧扩展。
- 可选轻量激活指示（根据 `hash` 设置当前项）：
```html
<script>
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-link');
  function updateActive() {
    const hash = window.location.hash || '#describer';
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
  }
  window.addEventListener('hashchange', updateActive);
  updateActive();
});
</script>
```

## 实施清单
- 更新 `index.html`：在 `header > .container` 中新增 `nav.nav` 与三项功能链接。
- 更新 `styles.css`：添加 `.header .container` 弹性布局、`.nav`、`.nav-menu`、`.nav-link` 样式与响应式规则。
- 可选：在 `index.html` 末尾加入激活脚本，使导航在滚动/跳转时高亮当前功能。

请确认以上方案；确认后我将按此计划进行修改并验证显示效果（含桌面与移动端）。