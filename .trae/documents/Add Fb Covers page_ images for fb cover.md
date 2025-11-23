## 目标

为当前站点增加功能“Fb Covers”，新增页面文件 `images-for-fb-cover.html`，围绕关键词 `images for fb cover`，从飞书多维表格读取图片并以响应式画廊展示。页面内所有文案与描述使用英文；开发与运行保持 Vercel 本地环境一致。

## 路由与文件

* 新增页面：`images-for-fb-cover.html`（英文文案，关键词与 SEO meta 包含 "images for fb cover"）

* 新增前端脚本：`fb-covers.js`（负责调用本地 API、渲染画廊、错误与加载态）

* 使用现有样式体系：扩展 `styles.css` 中的通用栅格与卡片样式，保证移动端友好

* 更新 `vercel.json`：增加 clean URL 路由 `/images-for-fb-cover` → `images-for-fb-cover.html`

## 飞书数据源与后端 API

* 新增服务端函数：`api/feishu/fb-covers.js`（Edge Runtime）

  * 获取租户凭证：`POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal`

  * 列出记录：`GET https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records?view_id={view_id}`（官方“列出记录/查询记录”）

  * 字段解析：优先读取附件字段；附件项含 `url/tmp_url/file_token`，直接使用 `url` 作为图片源；若为外链文本字段亦支持

  * 输出结构：`[{ id, title, imageUrl, description, tags }]`（字段名通过环境变量指定或智能匹配）

* 错误处理与防抖：处理权限与配额错误；统一 JSON 错误格式；前端重试与轻缓存

## 环境变量（Vercel CLI Development）

* `FEISHU_APP_ID` / `FEISHU_APP_SECRET`：用于换取 `tenant_access_token`

* `FEISHU_BITABLE_APP_TOKEN`：来自链接中的 Base token（`D8pgb7iGvakdyfsXPqZci1jPnCD`）

* `FEISHU_BITABLE_TABLE_ID`：`tblW2TYCevgHUVxY`

* `FEISHU_BITABLE_VIEW_ID`：`vewp80nCFn`（可选）

* `FEISHU_IMAGE_FIELD``NAME`_：_`fb_cover`

* 使用本地 CLI 添加示例：`vercel env add FEISHU_APP_ID development` 等；随后 `vercel env pull` 同步到本地运行

## 前端展示

* 页面结构：标题、搜索/过滤（预留）、响应式图片网格（移动端单列、平板双列、桌面 3–4 列）、加载态与错误态

* 图片卡片：封面图、标题（可选）、点击查看大图（原图 `url`）

* 性能优化：懒加载、`loading="lazy"`、简单占位骨架；必要时分页/无限滚动

## 文案与 SEO（英文）

* Title：`Images for FB Cover`

* Meta description：包含关键词 `images for fb cover`，说明页面从 Feishu Bitable 拉取封面图片

* 统一英文按钮与提示：`Loading`, `Retry`, `No images found`

## 安全与一致性

* 所有密钥走 Vercel 环境变量；不在代码中硬编码

* 仅通过本地 API 与 Feishu Open API 通信；前端不暴露令牌

* 运行与检查使用本地 `vercel dev` 环境，保持与线上一致

## 验证与测试

* 启动 `vercel dev` 后访问 `/images-for-fb-cover`；确认加载态、图片渲染、移动端响应式

* 断网/无权限模拟：验证错误提示与重试

* 数据为空视图：验证占位与 SEO 不受影响

## 变更影响

* 新增一页与一条 API；不影响既有工具页

* 可选在首页 `index.html` 添加导航卡片入口（英文文案），提高可发现性

## 交付

* 提交页面文件、脚本与 API 函数；更新 `vercel.json` 路由与本地 Development 环境变量说明

* 所有页面文案与描述统一英文；功能名展示为 “Fb Covers” 与关键词 "images for fb cover"

请确认以上计划；确认后我将开始实现并在本地 `vercel dev` 中验证。
