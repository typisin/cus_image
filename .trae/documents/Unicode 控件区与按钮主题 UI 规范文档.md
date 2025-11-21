## 适用范围
- 页面：`unicode.html`
- 模块：`controls-section`、`convert-btn`、`result-actions`、`action-btn`、`upload-area`
- 语言：英文文案；遵循项目变量与设计系统

## 栅格与容器
- `controls-section`
- display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); padding: var(--space-6)
- background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm)
- `control-group`
- display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto; row-gap: var(--space-3)
- `control-label`: row 1 col 1; `control-value`: row 1 col 2; `slider`/`select`: row 2 col 1-2
- `convert-btn`: grid-column: 1 / -1; width: 100%; margin-top: var(--space-2)
- `result-actions`: display: flex; gap: var(--space-3); desktop 右对齐，移动端居中

## 间距与对齐
- 外间距：`tool-columns` gap: var(--space-8); `controls-section` margin-bottom: var(--space-8)
- 内间距：`controls-section` padding: var(--space-6); `upload-area` padding: var(--space-12)
- 文本/数值：标签与控件垂直间距 var(--space-3); 数值右对齐（窄屏左对齐）

## 按钮主题（统一为蓝色体系）
- 主按钮 `convert-btn`
- background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light)); color: var(--white)
- padding: var(--space-4) var(--space-6); border-radius: var(--radius-md); font-weight: 600; font-size: 1rem
- Hover: background: var(--primary-blue-dark); transform: translateY(-1px); box-shadow: var(--shadow-md)
- Focus-visible: box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2); outline: none
- 次按钮 `action-btn`
- display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem
- background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-300)
- padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); font-weight: 500
- Hover: background: var(--gray-200); color: var(--gray-900)
- Focus-visible: box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); outline: none
- 下载按钮 `#downloadBtn.action-btn`：背景 var(--primary-blue); 文字 var(--white); 无边框；Hover 使用 var(--primary-blue-dark)
- 上传按钮 `upload-btn`：与主按钮一致的蓝色渐变与圆角体系

## 按钮不越界约束
- 所有按钮必须在所属 `div` 容器内渲染：
- width: 100%; max-width: 100%; box-sizing: border-box
- 禁止负外边距或绝对定位跨出 `controls-section`
- `grid-column` 范围仅在所属容器栅格内；`text-overflow: ellipsis` 避免长文案溢出
- 保持容器圆角与内边距；不使用超出父容器视觉边界的阴影

## 响应式规则
- 桌面 (≥768px)：`controls-section` 双列，`convert-btn` 全行宽；`result-actions` 右对齐
- 移动 (<768px)：`tool-columns` 改为 column-reverse；`controls-section` 与 `upload-section` 100% 宽；`controls-section` 单列；`control-value` 左对齐；`convert-btn` 全宽
- 小屏 (<480px)：`controls-section` 与 `result-section` padding: var(--space-4)；`result-header` 垂直堆叠；`unicode-output` 字号 0.625rem

## 颜色与对比
- 主色：`--primary-blue`, `--primary-blue-light`, `--primary-blue-dark`
- 灰阶：`--gray-50` … `--gray-900`；背景 `--white`
- 对比度：按钮文字与背景≥4.5:1；强调信息≥3:1

## 文案（英文）
- 控件标签：Character Density / Output Width / Character Set
- 主按钮：Convert to Unicode
- 结果区按钮：Copy / Download
- 上传区：Upload Image for Unicode Conversion / Select Image / Click or drag image here to convert into Unicode art / Supports JPG, PNG, GIF formats

## 无障碍
- 触达面积≥44px；键盘可达；焦点可见性按 Focus-visible 规则
- 禁用态：opacity 0.5~0.6，cursor: not-allowed，无位移阴影

## 验收清单
- 所有按钮在各断点均未溢出各自容器；`max-width: 100%` 生效
- `convert-btn` 始终位于 `controls-section` 栅格内且 `grid-column: 1 / -1`
- Hover/Focus/Disabled 三态符合色彩与动画规范
- 文案与对比度满足规范

如确认该 UI 文档，我将按此规范进一步排查并修正越界的按钮布局问题。