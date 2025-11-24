## 页面与路由
- 文件名与路由：`blank-image.html`，访问路径 `/blank-image`
- 导航：在新页面的头部导航中添加 `Blank Image` 菜单项，保持与现有页面一致的导航结构
- SEO：英文标题与文案，示例：
  - `<title>Blank Image Generator | CusImage</title>`
  - `<meta name="description" content="Generate printable blank pages with grids, lines and templates. Export PNG/JPG/SVG.">`
  - `<meta name="keywords" content="blank image, grid paper, lined paper, staff paper, A4, Letter, PNG, JPG, SVG">`
- Analytics：沿用现有 `_vercel/insights` 懒加载脚本

## UI 结构（遵循 UI_SPECIFICATION）
- 使用现有 `styles.css` 设计系统（Inter 字体、蓝色主题、间距/圆角/阴影变量）
- 布局：
  - 头部：品牌、下拉导航（同 400x400 Black Image）
  - 主区：左右分栏（`grid-layout` 或 `flex-layout`）
    - 左侧：预览画布与导出区（卡片 `card-layout`）
    - 右侧：配置面板（卡片 `card-layout`）
  - 页脚：版权文案
- 英文文案示例：
  - 页面主标题：`Blank Image Generator`
  - 描述：`Create printable blank pages with custom grids, lines, and templates.`
  - 预览区标题：`Preview`
  - 配置区标题：`Settings`

## 控件设计（极简 + 高级）
- 尺寸与单位：
  - 预设纸张：`A4`, `A3`, `Letter`
  - 自定义尺寸：`Width`, `Height`，单位选择：`px/mm/in`
  - `DPI` 输入（默认 96；打印建议 300）
  - 比例锁定（勾选）
- 背景与颜色：
  - 背景颜色（HEX/RGB 选择器）+ 透明度（0–1）
  - 线条颜色（HEX/RGB）+ 透明度
- 网格/线条样式：
  - 模式选择：`None`, `Horizontal Lines`, `Vertical Lines`, `Grid`
  - 间距（单位同上）、粗细（px）、线型（Solid/Dashed/Dotted）
  - 边距：页面四周页边距（mm/in/px）
- 模板系统（预设）：
  - `Lined Paper`（作文纸/横线）：行距、顶端标题区高度
  - `Staff Paper`（五线谱）：每组 5 条线、组间距、页边距
  - `Graph Paper`（坐标/方格纸）：方格尺寸、粗细、每 N 格加深线
  - 模板切换后自动填充对应配置，可再微调
- 输出与操作：
  - 一键生成：`Generate`
  - 导出：`Download PNG`, `Download JPG`, `Download SVG`
  - 清除：`Reset`

## Canvas/SVG 绘制方案
- 尺寸换算：
  - `mm → px = mm * DPI / 25.4`
  - `in → px = in * DPI`
- 画布：`<canvas id="blankCanvas">` 按选择的尺寸与 DPI 设置 `width/height`
- 绘制层次：
  1. 背景（填充透明或指定颜色）
  2. 网格/线条（考虑页边距）：
     - 横线：`for (y = marginTop; y < height - marginBottom; y += spacingY)`
     - 竖线：`for (x = marginLeft; x < width - marginRight; x += spacingX)`
     - 方格：横线 + 竖线组合；每 N 格加粗（通过 `lineWidth` 或颜色加深）
     - 线型：`setLineDash([]|[dash])` 支持 `Solid/Dashed/Dotted`
- 模板实现：
  - Lined：固定横线间距，顶部留白标题区
  - Staff：按五线谱规则绘制 5 条平行线为一组，组间距可配
  - Graph：基础网格 + 强化线（如每 5 格加粗）
- SVG 输出：
  - 构造 `<svg>` 文档：背景 `rect` + 批量 `line`/`path`
  - 以 `Blob` 生成 URL，触发下载
- PNG/JPG 输出：
  - `canvas.toDataURL('image/png')`
  - `canvas.toDataURL('image/jpeg', quality)`

## 可访问性与交互
- 所有按钮与输入有 `aria-label`
- 下拉菜单、切换控件使用键盘可达与 `focus-visible`
- 预览画布添加 `aria-label` 与尺寸描述

## 页面代码骨架（示例结构）
- 头部引入：`styles.css`, `favicon.svg`, `favicon.js`, Inter 字体、Insights 脚本
- 主体：
  - 左卡片：`<canvas id="blankCanvas">` + 下载按钮区 + 轻提示 `notice`
  - 右卡片：尺寸、单位、DPI、颜色、模式、模板、间距、粗细等控件
- 脚本：
  - `DOMContentLoaded` 后初始化：事件绑定、默认模板（Graph/Lined/Staff 任一）
  - `render()`：根据当前状态重绘
  - `downloadPNG/JPG/SVG()`：触发下载
  - `applyTemplate(type)`：填充预设参数

## 与现有代码的一致性
- 复用 `card-layout`, `tool-title`, `tool-description`, `notice` 等样式
- 导航交互沿用 `nav-dropdown` 与 `nav-toggle` 逻辑
- 下载提示 `showDownloadNotice()` 参考 `400x400-black-image.html`

## 验证方案（本地 Vercel）
- 在本地开发环境中运行 `vercel dev`
- 打开 `/blank-image` 验证：
  - 不同单位与 DPI 的尺寸换算是否正确
  - 三大模板生成的线条布局与打印预览
  - PNG/JPG/SVG 导出是否与预览一致
  - 可访问性与键盘操作

## 交付内容
- 新增页面：`blank-image.html`（英文页面文案）
- 不改动后端或环境变量；纯前端实现
- 如需后续在其他页面导航中加入 `Blank Image`，可在确认后统一更新
