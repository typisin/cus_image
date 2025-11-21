## 目标
- 优化 `controls-section` 的整体布局与密度，提升可读性与一致性
- 统一按钮主题色为项目主色（蓝色），主次分明，与全站规范一致
- 保持页面文案为英文，遵循现有设计变量与响应式策略

## 设计原则
- 使用全局设计变量：`var(--primary-blue)`、`var(--gray-*)`、`--radius-*`、`--space-*`、`--shadow-*`
- 主操作使用主色（蓝色），次操作采用中性灰；Focus 状态使用浅蓝描边
- 控件区采用卡片样式+网格布局，信息分组清晰，在移动端自动堆叠

## 布局优化（controls-section）
- 将 `.controls-section` 从单列内容改为网格布局：
  - `display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);`
  - 每个 `.control-group` 改为竖向排列：标签在上、控件在下，减少横向拥挤
- 细化 `.control-group`：
  - `display: grid; grid-template-columns: 1fr auto; row-gap: var(--space-3);`
  - 第一行：`label` 左侧，`value` 右侧对齐
  - 第二行：`slider/select` 占满一行
- 响应式：
  - `@media (max-width: 768px)` 将 `.controls-section` 改为单列 `grid-template-columns: 1fr`，控件保持上下结构
- 视觉：
  - 卡片保持 `background: var(--white)`、边框与圆角不变，整体 padding 适度收紧至 `var(--space-6)` 以提升信息密度

## 按钮主题优化
- 转换按钮 `.convert-btn`：
  - 颜色从绿色改为蓝色主色：`background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light))`
  - Hover：`background: var(--primary-blue-dark); box-shadow: var(--shadow-md)`
  - Focus：`outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.2)`
- 结果区按钮 `.action-btn`：
  - 统一为主次按钮体系：
    - `#downloadBtn` 使用主色（蓝色）
    - `#copyBtn` 使用中性灰（保留灰色，但提升 hover 反馈）
  - 样式：采用 `inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.5rem 0.875rem; border-radius: var(--radius-md)`，与 Cutout 页 `.btn` 保持一致

## 具体改动点
- `unicode.css`
  - 更新 `.controls-section` 为网格布局，并在 768px 下改为单列
  - 重构 `.control-group`、`.control-label`、`.control-value` 的排列与间距
  - 调整 `.slider` 宽度占用，保证与新网格契合
  - 更新 `.convert-btn` 为蓝色主题与交互反馈
  - 新增 `.action-btn.primary` 与 `.action-btn.secondary`（或直接针对 `#downloadBtn` 与 `#copyBtn`）以区分主次
- `unicode.html`
  - 无需结构性改动；按钮的主次通过选择器针对 ID 应用即可

## 验证
- 桌面端：控件区两列网格，标签/数值居上，控件居下，阅读更顺畅
- 移动端：自动单列堆叠，间距合理，操作区域不拥挤
- 按钮：转换与下载为蓝色主色，复制为灰色次按钮；hover/focus 反馈统一

请确认方案，我将按上述步骤实施具体代码修改并进行视觉与交互验证。