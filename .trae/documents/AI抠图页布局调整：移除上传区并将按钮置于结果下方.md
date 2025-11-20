## 目标
- 当展示抠图结果时，移除（从DOM中暂时卸载）上传区域 `div.upload-section`，避免干扰布局。
- 将 `#removeBackgroundBtn` 与结果区域处于同一列，并固定在结果区域下方，保持合理间距，不再出现“悬浮覆盖”现象。

## 现状与问题
- 结果区域：`cutout.html:51` 的 `#resultsSection`。
- 按钮现位置：已放在结果区域之后的 `div.remove-background-container`（`cutout.html:102-105`）。
- JS显示逻辑：`showResults` 控制结果显示（`cutout.js:132-142`），`showUploadArea` 控制上传区显示（`cutout.js:125-137`）。
- CSS仍有与上传区关联的按钮样式（`.upload-area.file-selected #removeBackgroundBtn`），导致按钮受上传区状态影响，出现悬浮错位风险（`cutout.css:254-266, 295-298`）。

## 变更点
1. HTML
- 保持 `remove-background-container` 在 `#resultsSection` 之后，确保同一列的垂直堆叠结构。

2. CSS
- 删除或覆盖 `.upload-area.file-selected #removeBackgroundBtn` 相关样式与 hover 位移，防止按钮受上传区状态影响。
- 为 `.remove-background-container` 增加上下间距（如 `margin-top: 2rem; margin-bottom: 2rem;`），并确保按钮为 `display: inline-block` 居中显示。

3. JS
- 在首次展示结果时，调用新方法 `detachUploadSection()`：将 `div.upload-section` 从 DOM 中移除，并保存其父节点与相邻节点引用，避免影响布局。
- 在 `reset()` 时调用 `restoreUploadSection()`：将上传区插回原位置，恢复初始态。
- 维持 `showResults(show)` 对 `#removeBackgroundBtn` 的显隐控制，按钮仅在结果显示时出现。

## 实现步骤
1. CSS清理
- 移除 `.upload-area.file-selected #removeBackgroundBtn` 与其 hover 的位移与特化样式（`cutout.css:254-266, 295-298`）。
- 保留并完善 `.remove-background-container` 的间距与按钮视觉样式，避免任何绝对定位或位移。

2. JS增强
- 在 `AICutout` 类中新增：
  - `detachUploadSection()`：查找 `.upload-section`，记录 `this.uploadSection`, `this.uploadSectionParent`, `this.uploadSectionNextSibling`，执行 `remove()`。
  - `restoreUploadSection()`：若保存了引用，将 `.upload-section` 重新 `insertBefore(this.uploadSectionNextSibling)` 或 `appendChild` 回到 `this.uploadSectionParent`。
- 在 `showResults(true)` 流程中（如 `removeBackgroundBtn` 点击逻辑）调用 `detachUploadSection()`。
- 在 `reset()` 中调用 `restoreUploadSection()` 并清理按钮与结果区状态。

3. HTML确认
- 维持当前 `remove-background-container` 紧随 `#resultsSection` 后。

## 验证方案
- 打开页面，初始应显示上传区；选择文件后显示结果区，并且上传区被移除（非隐藏），按钮在结果区下方且不悬浮覆盖。
- 点击重置：上传区正确恢复，按钮隐藏；重复流程不报错。
- 响应式检查：窄屏下按钮与结果区域保持同一列垂直布局，间距稳定。

请确认以上方案，我将据此执行代码修改与验证。