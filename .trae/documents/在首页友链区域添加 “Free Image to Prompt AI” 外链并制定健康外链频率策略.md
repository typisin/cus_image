## 实施方案
- 位置与结构：在 `index.html` 的 Footer 友链（Friends）栏目下，追加一条外链，保持与现有 AIStage 一致的结构与样式。
- 外链代码（去除示例中的反引号，加入安全属性）：
  - `<a href="https://artiverse.app/ai/fluxproweb-com-image-to-prompt/" title="Free Image to Prompt AI" target="_blank" rel="noopener noreferrer" class="footer-link">Free Image to Prompt AI</a>`
- 样式与规范：沿用已定义的 `.footer-link`、`.footer-list`，文案使用英文，符合 UI 设计规范中的字体、颜色与间距要求。
- 验证：使用本地 Vercel 环境预览首页，检查链接展示、跳转、响应式与可访问性（focus-visible）。

## 外链添加频率最佳实践
- 节奏建议：
  - 高质量、主题相关的外链优先；避免一次性批量添加，建议“渐进式”增加。
  - 基准节奏：每月 1–2 个优质外链；如资源充分可提升至每季度 3–5 个，但分周进行（例如每 1–2 周新增 1 个）。
- 质量与合规：
  - 保持主题相关（AI 图像、提示生成、图片工具），避免链接农场或低质量目录。
  - 付费或推广性质链接使用 `rel="nofollow"` 或 `rel="sponsored"`；纯互惠且可信站点可保持默认。
- 位置与密度：
  - 首页 Footer 友链栏目即可满足平台抓取要求；避免在单页堆积过多，控制总量与可读性。
  - 锚文本清晰、非堆砌关键词；与 UI 规范的辅助文本字号一致（0.875rem）。
- 维护与监控：
  - 每季度巡检一次外链有效性（404/重定向变化）；失效则替换或移除。
  - 观察搜索表现与点击数据（Search Console/Analytics），必要时调整节奏与位置。

若你确认，我将把该外链添加到首页 Footer 的 Friends 列表，并完成本地验证。