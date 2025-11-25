## 文档更新范围

* 仅更新 `.trae/documents/Image Describer改造：上传与Coze工作流、布局对齐.md`，不改代码。

* 补充工作流入参、前端样式选择、路由与返回结构。

## 新环境变量

* `COZE_WORKFLOW_Describer_ID`（已确定值：`7576540260534239232`）

* 使用 Vercel CLI 添加到 development/preview/production。

## 新后端路由（说明）

* 路径：`/api/coze/describer/run`

* 读取：`COZE_SAT`、`COZE_WORKFLOW_Describer_ID`

* 请求：`POST` Body

  ```json
  {
    "image": "<dataURL 或远程URL>/file id",
    "prompt_style": "Brief | In detail | Vivid | Abstractly"
  }
  ```

* 转发到 Coze：

  ```json
  {
    "workflow_id": "${COZE_WORKFLOW_Describer_ID}",
    "parameters": {
      "input": "{\"image\":\"...\",\"prompt_style\":\"Brief\"}"
    }
  }
  ```

* 返回（统一文本结果）：

  * 成功：`{ code, msg, data, log_id, text, execute_id }`

  * `text` 提取顺序：`data.output.text` → 若 `data` 是字符串可解析 JSON，则取 `output.text` 或顶层 `text` → 若 `output` 为纯文本字符串则直接使用

  * 失败：`{ error, code, detail }`

## 前端交互（说明）

* 在 `/image-describer` 添加样式选择控件（UI 文案中文，传参英文枚举）：

  * 选项与映射：

    * “简洁” → `Brief`

    * “详细” → `In detail`

    * “生动” → `Vivid`

    * “抽象” → `Abstractly`

  * 默认值：`Brief`

* 上传流程：

  1. 点击 `Reupload` 直接触发 `imageInput.click()`
  2. 选择图片后，生成 `dataURL`（建议最大边 1024）
  3. `POST /api/coze/describer/run` 发送 `{ image: dataURL, prompt_style }`
  4. 用返回的 `text` 填充到 `#descriptionText`；失败时降级到本地 `analyze()`

## 布局对齐（说明）

* 结果容器 `align-items: stretch`

* `.result-image-card { display:flex; flex-direction:column; min-height:300px }`

* `.image-preview-container` 与文本容器统一 `min-height`；`#descriptionText { display:flex; align-items:center }`

## 验证步骤（本地）

* 设置 `COZE_WORKFLOW_Describer_ID` 与 `COZE_SAT`

* `vercel dev` 访问 `/image-describer`：选择图片→选择样式→触发工作流→文本渲染与复制；异常时降级

## 安全与限制

* 限制图片大小与最大边，避免请求体过大

* Token 仅在服务端环境变量中保存，不下发到前端

## 后续实施

* 得到确认后：

  1. 新增 `api/coze/describer/run.js`（按上文逻辑）
  2. 在前端添加样式选择控件并接入新路由
  3. 调整少量 CSS 以达成对齐

