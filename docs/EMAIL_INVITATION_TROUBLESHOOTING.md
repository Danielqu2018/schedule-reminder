# 邮件邀请问题排查指南

## 🔍 问题诊断

如果点击"发送邀请"后，Supabase 没有反应，请按以下步骤排查：

---

## ✅ 检查清单

### 1. Edge Function 是否已部署？

**检查方法**：
1. 登录 Supabase Dashboard
2. 进入 **Edge Functions**（路径：`https://supabase.com/dashboard/project/[your-project-ref]/functions`）
3. 查看是否有 `send-invitation-email` 函数
4. 检查函数状态是否为 **Active**

**如果未部署**：
```bash
# 1. 安装 Supabase CLI（如果未安装）
npm install -g supabase

# 2. 登录 Supabase
supabase login

# 3. 链接到您的项目
supabase link --project-ref your-project-ref

# 4. 部署 Edge Function
supabase functions deploy send-invitation-email
```

**获取 project-ref**：
- Supabase Dashboard > Project Settings > General
- 查看 **Reference ID**

---

### 2. 检查浏览器控制台错误

**步骤**：
1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签
3. 点击"发送邀请"按钮
4. 查看是否有错误信息

**常见错误**：

**错误1：`Failed to fetch` 或 `Network error`**
- **原因**：Edge Function 未部署或 URL 错误
- **解决**：确认 Edge Function 已部署，检查网络连接

**错误2：`401 Unauthorized`**
- **原因**：API Key 错误或过期
- **解决**：检查 `.env` 文件中的 `VITE_SUPABASE_ANON_KEY` 是否正确

**错误3：`404 Not Found`**
- **原因**：Edge Function 路径错误或未部署
- **解决**：确认函数名称和路径正确

---

### 3. 检查 Edge Function 日志

**步骤**：
1. Supabase Dashboard > **Logs** > **Edge Functions**
2. 选择 `send-invitation-email` 函数
3. 查看最近的日志记录
4. 检查是否有错误信息

**查看日志**：
- 如果没有任何日志 → Edge Function 可能未被调用
- 如果有错误日志 → 查看具体错误信息

---

### 4. 验证 SMTP 配置

虽然您已经配置了 SMTP，但需要确认：

1. **SMTP 开关已启用**
   - Authentication > SMTP
   - 确认 "Enable custom SMTP" 开关为 **ON**（绿色）

2. **配置信息正确**
   - Host: `smtp.resend.com` ✅
   - Port: `587` ✅
   - Username: `resend` ✅
   - Password: 已填写 ✅
   - Sender email: `danielqu2018@sina.com` ✅

3. **测试 SMTP 连接**
   - 在 SMTP 配置页面点击 **Save changes**
   - Supabase 会自动测试连接
   - 如果失败，会显示错误信息

---

### 5. 检查 Edge Function 调用

**前端代码检查**：
打开浏览器开发者工具 > Network 标签：
1. 点击"发送邀请"
2. 查找对 `send-invitation-email` 的请求
3. 检查：
   - **请求状态**：应该是 200（成功）或 500（服务器错误）
   - **请求 URL**：应该是 `https://[your-project].supabase.co/functions/v1/send-invitation-email`
   - **请求头**：应该包含 `Authorization: Bearer [anon-key]`
   - **响应内容**：查看返回的 JSON

**如果请求未发送**：
- 检查前端代码是否有错误
- 检查网络连接
- 检查 CORS 设置

**如果请求返回错误**：
- 查看响应内容中的错误信息
- 检查 Edge Function 日志

---

### 6. 验证 inviteUserByEmail 调用

Edge Function 使用 `inviteUserByEmail()` 发送邮件，但有以下限制：

**限制**：
- 如果用户**未注册**：会发送 Supabase 的默认邀请邮件（使用您配置的 SMTP）
- 如果用户**已注册**：`inviteUserByEmail()` 会失败，不会发送邮件

**检查方法**：
1. 查看 Edge Function 日志
2. 查找是否有 "already registered" 或 "already exists" 错误
3. 如果用户已注册，需要其他方式发送邮件

---

## 🔧 解决方案

### 方案 1：确认 Edge Function 已部署

```bash
# 检查 Supabase CLI 是否已安装
supabase --version

# 如果未安装，安装 CLI
npm install -g supabase

# 登录
supabase login

# 链接项目（替换 your-project-ref）
supabase link --project-ref your-project-ref

# 部署函数
supabase functions deploy send-invitation-email

# 验证部署
supabase functions list
```

---

### 方案 2：检查环境变量

**前端环境变量**（`.env` 文件）：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Edge Function 环境变量**（自动从项目配置获取）：
- `SUPABASE_URL`：自动获取
- `SUPABASE_SERVICE_ROLE_KEY`：自动获取

**验证**：
1. Supabase Dashboard > Project Settings > API
2. 确认 URL 和 Keys 正确

---

### 方案 3：测试 Edge Function 调用

**使用 curl 测试**（替换为您的实际值）：
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/send-invitation-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{
    "email": "test@example.com",
    "teamName": "测试团队",
    "inviteUrl": "https://your-app.com/invite/accept?token=test123",
    "inviterName": "测试用户"
  }'
```

**预期响应**：
```json
{
  "success": true,
  "message": "邀请邮件已发送"
}
```

---

### 方案 4：检查用户是否已注册

**问题**：如果被邀请的邮箱已注册，`inviteUserByEmail()` 不会发送邮件。

**解决方法**：

**选项 A：使用自定义邮件模板**
1. Supabase Dashboard > Authentication > Email Templates
2. 选择 **Invite user** 模板
3. 自定义模板内容，使用变量：
   - `{{ .ConfirmationURL }}` - 确认链接
   - `{{ .Data.teamName }}` - 团队名称
   - `{{ .Data.inviteUrl }}` - 邀请链接
   - `{{ .Data.inviterName }}` - 邀请人名称

**选项 B：修改 Edge Function 使用 Send Email Hook**
- 需要配置 Send Email Hook
- 参考：[Supabase Send Email Hook 文档](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)

**选项 C：手动发送邀请链接**
- 如果邮件发送失败，应用会显示邀请链接
- 可以手动复制链接发送给被邀请者

---

### 方案 5：验证 SMTP 配置

**测试 SMTP 连接**：
1. Supabase Dashboard > Authentication > SMTP
2. 确认所有字段已填写
3. 点击 **Save changes**
4. Supabase 会自动测试连接
5. 如果失败，会显示错误信息

**常见 SMTP 问题**：

**问题1：Resend API Key 错误**
- **解决**：确认 Password 字段填入的是 Resend API Key（不是邮箱密码）
- **获取 API Key**：Resend Dashboard > API Keys > Create API Key

**问题2：发件人邮箱未验证**
- **解决**：在 Resend Dashboard 中验证发件人域名或邮箱
- **参考**：[Resend 域名验证指南](https://resend.com/docs/dashboard/domains/introduction)

**问题3：端口或 Host 错误**
- **解决**：确认 Host 为 `smtp.resend.com`，Port 为 `587`

---

## 📋 完整诊断流程

1. ✅ **检查 Edge Function 是否已部署**
   - Dashboard > Edge Functions
   - 确认 `send-invitation-email` 存在且为 Active

2. ✅ **检查浏览器控制台**
   - F12 > Console
   - 查看是否有错误信息

3. ✅ **检查网络请求**
   - F12 > Network
   - 查找 `send-invitation-email` 请求
   - 查看请求状态和响应

4. ✅ **检查 Edge Function 日志**
   - Dashboard > Logs > Edge Functions
   - 查看最近的日志记录

5. ✅ **验证 SMTP 配置**
   - Dashboard > Authentication > SMTP
   - 确认配置正确且已保存

6. ✅ **测试 Edge Function**
   - 使用 curl 或 Postman 测试
   - 确认函数正常工作

---

## 🐛 常见错误和解决方案

### 错误1：Edge Function 未部署

**现象**：浏览器控制台显示 `404 Not Found`

**解决**：
```bash
supabase functions deploy send-invitation-email
```

---

### 错误2：API Key 错误

**现象**：浏览器控制台显示 `401 Unauthorized`

**解决**：
1. 检查 `.env` 文件中的 `VITE_SUPABASE_ANON_KEY`
2. 确认 Key 与 Dashboard 中的 anon public key 一致
3. 重启开发服务器

---

### 错误3：用户已注册

**现象**：Edge Function 日志显示 "already registered"

**解决**：
1. 配置自定义邮件模板（推荐）
2. 或使用 Send Email Hook
3. 或手动发送邀请链接

---

### 错误4：SMTP 配置错误

**现象**：Edge Function 执行成功，但邮件未发送

**解决**：
1. 检查 SMTP 配置是否正确
2. 测试 SMTP 连接
3. 验证发件人邮箱/域名
4. 查看 Supabase Auth Logs 中的邮件发送错误

---

## 📞 获取更多帮助

如果问题仍未解决：

1. **查看详细日志**：
   - Edge Function 日志
   - Auth Logs（Authentication > Logs）
   - 浏览器控制台

2. **检查 Supabase 文档**：
   - [Edge Functions 文档](https://supabase.com/docs/guides/functions)
   - [Auth SMTP 配置](https://supabase.com/docs/guides/auth/auth-smtp)
   - [Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)

3. **联系支持**：
   - Supabase Discord
   - Supabase GitHub Issues

---

**最后更新**：2026-01-29  
**适用版本**：v2.2.0
