## 项目与现状
- 框架：静态站点 + `vercel.json` 路由（无 Next.js 根布局）
- 已检测到：全站统一加载 `favicon.js`，各页已集成 Vercel Insights（性能监控），但未集成 Web Analytics（访问统计）
- 路由入口：`vercel.json:2-18`

## 未集成页面清单
- 首页：缺少 Analytics（`index.html:17` 已加载 Insights；`index.html:13` 引用 `favicon.js`）
- AI Cutout：缺少 Analytics（`ai-cutout.html:17`；`ai-cutout.html:13`）
- Image Describer：缺少 Analytics（`image-describer.html:34`；`image-describer.html:16`）
- Turn Images into Unicode：缺少 Analytics（`turn-images-into-unicode.html:31`；`turn-images-into-unicode.html:16`）
- Images for FB Cover：缺少 Analytics（`images-for-fb-cover.html:17`；`images-for-fb-cover.html:13`）
- Layout Demo：缺少 Analytics（`layout-demo.html:16`；`layout-demo.html:12`）
- Test Navigation：缺少 Analytics（`test-navigation.html:20`；`test-navigation.html:11`）

## 实施方案（中心化注入，改动最少）
- 方案：在 `favicon.js` 末尾追加动态加载 Web Analytics 脚本（所有页面已统一引入，可一次性覆盖全站）。仅在非本地环境加载，遵循现有 Insights 的模式。
- 追加代码：
```html
<script>
(function(){
  var h = location.hostname; var isLocal = /^(localhost|127\.0\.0\.1)$/.test(h);
  if(!isLocal){ var s = document.createElement('script'); s.defer = true; s.src = '/_vercel/analytics/script.js'; document.head.appendChild(s); }
})();
</script>
```
- 结果：所有静态页面均自动集成 Web Analytics；与已存在的 Insights 并存，不影响既有功能。

## 可选备选方案（逐页添加）
- 在每个 HTML 的 `<head>` 中添加：
```
<script defer src="/_vercel/analytics/script.js"></script>
```
- 代价更高（需逐页改动），不推荐。

## 验证步骤（本地 Vercel 环境）
- 使用本地 `vercel dev` 访问非 `localhost` 场景验证脚本加载，或上线预览后检查 Network 中 `/_vercel/analytics/script.js` 请求。
- 保持路由与变量与线上一致（项目规则）。
- 确认不影响 `api/*` JSON 接口（非 HTML 不加载前端脚本）。

## 注意事项
- 页面文案保持英文（项目规则）。
- 不改动现有路由与 API；仅追加脚本加载逻辑。
- Vercel 仪表盘需开启 Web Analytics 功能以查看报表。