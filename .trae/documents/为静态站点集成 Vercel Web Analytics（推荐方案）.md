## 选择与理由
- 推荐方案：在每个 HTML 页面 `<head>` 中直接引入 `/_vercel/insights/script.js`。
- 适配度：当前项目为纯静态 HTML/原生 JS（非 React/Next），无需引入 npm 包或改造构建流程。
- 官方机制：启用后，Vercel 会在部署中提供 `/_vercel/insights/*` 路由，脚本体积约 1.1KB，隐私友好。[参考：Quickstart 与社区文档](https://vercel.com/docs/analytics/quickstart)；示例脚本路径与用法可见社区与实践文章（`/_vercel/insights/script.js`）(示例用法来源：reddit 与 Astro 实践文章)。

## 操作步骤
1. 在 Vercel Dashboard 项目页的 Analytics 标签中点击 Enable，保存设置。[文档说明会在下一次部署中加入 `/_vercel/insights/*` 路由]
2. 在以下文件的 `<head>` 末尾添加脚本标签（建议放在现有 `fonts` 与 `favicon` 之后）：
   - `index.html`
   - `image-describer.html`
   - `ai-cutout.html`
   - `turn-images-into-unicode.html`
   - `test-navigation.html`
   - `layout-demo.html`

   代码：
   ```html
   <script defer src="/_vercel/insights/script.js"></script>
   ```
3. 本地验证（保持与线上一致的本地 Vercel 环境）：
   - 使用 `vercel dev` 启动并访问各页面，确认脚本成功加载（Network 中可见 `/_vercel/insights/script.js`）。
   - 说明：开发环境通常不计入数据，但可以确认资源加载与路由存在。[Quickstart]
4. 部署验证：
   - 完成部署后，访问站点页面，浏览器 Network 中应看到对 `/_vercel/insights/view` 的请求。
   - 打开 Vercel Dashboard 的 Analytics 查看 PV、访客与来源数据。首批数据通常在访问后很快出现。

## 注意事项
- 可能被部分广告拦截器或隐私浏览器阻止，属正常现象（不影响站点）。
- 若未来升级为框架方案：
  - 非 React/Next：`npm i @vercel/analytics` 后在全局布局中使用 `import { inject } from '@vercel/analytics'; inject();`。
  - React/Next：在根布局加入 `<Analytics />` 组件即可。[`@vercel/analytics` 包文档]

## 你需要做的改动
- 仅在上面列出的 HTML 文件的 `<head>` 中粘贴脚本标签并重新部署，无需更改路由或引入构建工具。

## 参考
- Quickstart（启用与路由说明）：https://vercel.com/docs/analytics/quickstart
- 包文档（非 React/Next 使用 `inject()`）：https://www.npmjs.com/package/@vercel/analytics
- 静态站点脚本路径与实践示例：`/_vercel/insights/script.js`（社区经验与实践文章）