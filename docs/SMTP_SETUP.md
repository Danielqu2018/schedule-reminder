# Supabase SMTP 配置指南

## 📧 概述

Supabase 支持配置自定义 SMTP 服务器来发送邮件。这对于生产环境非常重要，因为默认的 SMTP 服务有严格的限制。

## ⚠️ 默认 SMTP 的限制

Supabase 提供的默认 SMTP 服务器仅用于开发和测试：
- ❌ 仅发送给已授权的团队成员邮箱
- ❌ 每小时限制 2 封邮件
- ❌ 不保证送达率和正常运行时间
- ❌ **不适合生产环境使用**

## 🚀 配置步骤

### 步骤 1：登录 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目

### 步骤 2：进入 SMTP 配置页面

**路径**：
```
Authentication > SMTP
```

**直接访问链接格式**：
```
https://supabase.com/dashboard/project/[your-project-ref]/auth/smtp
```

将 `[your-project-ref]` 替换为您的项目引用 ID（可在项目设置中找到）。

### 步骤 3：填写 SMTP 配置信息

在 SMTP 配置页面，您需要填写以下信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| **Host** | SMTP 服务器地址 | `smtp.gmail.com` |
| **Port** | SMTP 端口号 | `587`（TLS）或 `465`（SSL） |
| **User** | SMTP 用户名/邮箱 | `your-email@gmail.com` |
| **Password** | SMTP 密码/应用专用密码 | `your-app-password` |
| **Sender email** | 发件人邮箱地址 | `noreply@yourdomain.com` |
| **Sender name** | 发件人显示名称 | `ProjectFlow` 或 `您的应用名称` |

### 步骤 4：保存配置

1. 填写完所有信息后，点击 **Save**（保存）
2. Supabase 会测试 SMTP 连接
3. 如果配置正确，会显示成功消息

## 📋 常用 SMTP 服务商配置

### 1. Gmail（Google Workspace）

**配置信息**：
- **Host**: `smtp.gmail.com`
- **Port**: `587`（推荐，使用 TLS）或 `465`（使用 SSL）
- **User**: 您的 Gmail 地址（如：`your-email@gmail.com`）
- **Password**: **应用专用密码**（不是普通密码）
- **Sender email**: 您的 Gmail 地址
- **Sender name**: 自定义名称（如：`ProjectFlow`）

**⚠️ 重要：获取应用专用密码**

1. 访问 [Google 账号设置](https://myaccount.google.com/)
2. 进入 **安全性** > **两步验证**（需要先启用两步验证）
3. 滚动到底部，找到 **应用专用密码**
4. 选择应用类型为"邮件"，设备类型为"其他（自定义名称）"
5. 输入名称（如：`Supabase`），点击"生成"
6. 复制生成的 16 位密码（格式：`xxxx xxxx xxxx xxxx`，使用时去掉空格）

**参考文档**：
- [Google 应用专用密码指南](https://support.google.com/accounts/answer/185833)

---

### 2. SendGrid

**配置信息**：
- **Host**: `smtp.sendgrid.net`
- **Port**: `587`
- **User**: `apikey`（固定值）
- **Password**: 您的 SendGrid API Key
- **Sender email**: 已验证的发件人邮箱（如：`noreply@yourdomain.com`）
- **Sender name**: 自定义名称

**获取 API Key**：
1. 登录 [SendGrid Dashboard](https://app.sendgrid.com/)
2. 进入 **Settings** > **API Keys**
3. 点击 **Create API Key**
4. 选择权限（建议选择 **Full Access** 或 **Mail Send**）
5. 复制生成的 API Key

**参考文档**：
- [SendGrid SMTP 配置指南](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)

---

### 3. Resend

**配置信息**：
- **Host**: `smtp.resend.com`
- **Port**: `587`
- **User**: `resend`（固定值）
- **Password**: 您的 Resend API Key
- **Sender email**: 已验证的域名邮箱（如：`noreply@yourdomain.com`）
- **Sender name**: 自定义名称

**获取 API Key**：
1. 登录 [Resend Dashboard](https://resend.com/dashboard)
2. 进入 **API Keys**
3. 点击 **Create API Key**
4. 复制生成的 API Key

**参考文档**：
- [Resend SMTP 配置指南](https://resend.com/docs/send-with-smtp)

---

### 4. Mailgun

**配置信息**：
- **Host**: `smtp.mailgun.org`
- **Port**: `587`
- **User**: 您的 Mailgun SMTP 用户名（格式：`postmaster@yourdomain.mailgun.org`）
- **Password**: 您的 Mailgun SMTP 密码
- **Sender email**: 已验证的域名邮箱（如：`noreply@yourdomain.com`）
- **Sender name**: 自定义名称

**获取 SMTP 凭证**：
1. 登录 [Mailgun Dashboard](https://app.mailgun.com/)
2. 进入 **Sending** > **Domain Settings**
3. 选择您的域名
4. 在 **SMTP credentials** 部分查看用户名和密码

**参考文档**：
- [Mailgun SMTP 配置指南](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)

---

### 5. AWS SES（Amazon Simple Email Service）

**配置信息**：
- **Host**: `email-smtp.[region].amazonaws.com`（如：`email-smtp.us-east-1.amazonaws.com`）
- **Port**: `587`（推荐）或 `465`
- **User**: 您的 AWS SES SMTP 用户名
- **Password**: 您的 AWS SES SMTP 密码
- **Sender email**: 已验证的发件人邮箱（如：`noreply@yourdomain.com`）
- **Sender name**: 自定义名称

**获取 SMTP 凭证**：
1. 登录 [AWS Console](https://console.aws.amazon.com/)
2. 进入 **Amazon SES** 服务
3. 进入 **SMTP Settings**
4. 点击 **Create SMTP credentials**
5. 输入 IAM 用户名，点击 **Create**
6. 下载或复制 SMTP 用户名和密码

**⚠️ 注意事项**：
- 需要在 AWS SES 中验证发件人邮箱或域名
- 新账户默认处于"沙盒模式"，只能发送给已验证的邮箱
- 需要申请"生产访问权限"才能发送给任意邮箱

**参考文档**：
- [AWS SES SMTP 配置指南](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)

---

### 6. Postmark

**配置信息**：
- **Host**: `smtp.postmarkapp.com`
- **Port**: `587`
- **User**: 您的 Postmark Server API Token
- **Password**: 您的 Postmark Server API Token（与 User 相同）
- **Sender email**: 已验证的发件人邮箱（如：`noreply@yourdomain.com`）
- **Sender name**: 自定义名称

**获取 API Token**：
1. 登录 [Postmark Dashboard](https://account.postmarkapp.com/)
2. 进入 **Servers**
3. 选择您的服务器
4. 在 **API Tokens** 部分查看 Server API Token

**参考文档**：
- [Postmark SMTP 配置指南](https://postmarkapp.com/developer/user-guide/transactional/smtp)

---

### 7. Brevo（原 Sendinblue）

**配置信息**：
- **Host**: `smtp-relay.brevo.com`
- **Port**: `587`
- **User**: 您的 Brevo SMTP 用户名（通常是您的登录邮箱）
- **Password**: 您的 Brevo SMTP 密码（不是登录密码）
- **Sender email**: 已验证的发件人邮箱
- **Sender name**: 自定义名称

**获取 SMTP 密码**：
1. 登录 [Brevo Dashboard](https://app.brevo.com/)
2. 进入 **SMTP & API** > **SMTP**
3. 在 **SMTP Server** 部分查看用户名和密码

**参考文档**：
- [Brevo SMTP 配置指南](https://help.brevo.com/hc/en-us/articles/209467485)

---

### 8. 腾讯企业邮箱

**配置信息**：
- **Host**: `smtp.exmail.qq.com`
- **Port**: `587`（推荐）或 `465`
- **User**: 您的企业邮箱地址（如：`noreply@yourdomain.com`）
- **Password**: 您的企业邮箱密码
- **Sender email**: 您的企业邮箱地址
- **Sender name**: 自定义名称

**参考文档**：
- [腾讯企业邮箱 SMTP 设置](https://service.exmail.qq.com/cgi-bin/help?subtype=1&&id=28&&no=1001259)

---

### 9. 阿里云企业邮箱

**配置信息**：
- **Host**: `smtp.mxhichina.com`（或 `smtp.qiye.aliyun.com`）
- **Port**: `587`（推荐）或 `465`
- **User**: 您的企业邮箱地址（如：`noreply@yourdomain.com`）
- **Password**: 您的企业邮箱密码
- **Sender email**: 您的企业邮箱地址
- **Sender name**: 自定义名称

**参考文档**：
- [阿里云企业邮箱 SMTP 设置](https://help.aliyun.com/document_detail/29450.html)

---

### 10. 163/126 邮箱（不推荐用于生产）

**配置信息**：
- **Host**: `smtp.163.com`（163 邮箱）或 `smtp.126.com`（126 邮箱）
- **Port**: `587` 或 `465`
- **User**: 您的邮箱地址
- **Password**: **授权码**（不是登录密码）
- **Sender email**: 您的邮箱地址
- **Sender name**: 自定义名称

**⚠️ 注意事项**：
- 需要开启 SMTP 服务并获取授权码
- 不推荐用于生产环境，建议使用企业邮箱或专业邮件服务

---

## 🔧 配置验证

### 测试 SMTP 连接

配置完成后，Supabase 会自动测试 SMTP 连接。如果配置正确，会显示成功消息。

### 发送测试邮件

1. 进入 **Authentication** > **Email Templates**
2. 选择一个邮件模板（如：**Invite user**）
3. 点击 **Send test email**
4. 输入测试邮箱地址
5. 检查是否收到邮件

### 查看邮件日志

如果邮件未发送，可以查看日志：
1. 进入 **Logs** > **Auth Logs**
2. 查看是否有错误信息
3. 检查 SMTP 连接是否成功

## 🛠️ 故障排除

### 问题 1：SMTP 连接失败

**可能原因**：
- Host 或 Port 配置错误
- 用户名或密码错误
- 防火墙阻止连接
- SMTP 服务商要求特定的 IP 白名单

**解决方案**：
1. 检查 Host 和 Port 是否正确
2. 验证用户名和密码（特别是应用专用密码）
3. 检查 SMTP 服务商是否需要 IP 白名单
4. 尝试使用不同的端口（587 或 465）

---

### 问题 2：邮件发送失败

**可能原因**：
- 发件人邮箱未验证
- 域名未配置 SPF/DKIM 记录
- 邮件被标记为垃圾邮件
- 达到发送限制

**解决方案**：
1. **验证发件人邮箱**：
   - 在 SMTP 服务商的控制台中验证发件人邮箱
   - 确保发件人邮箱与配置的 **Sender email** 一致

2. **配置域名 DNS 记录**：
   - 配置 SPF 记录：`v=spf1 include:[smtp-provider] ~all`
   - 配置 DKIM 记录（从 SMTP 服务商获取）
   - 配置 DMARC 记录（可选）

3. **检查发送限制**：
   - 查看 SMTP 服务商的发送限制
   - 确保未超过每日/每小时发送限制

4. **检查垃圾邮件文件夹**：
   - 查看收件箱的垃圾邮件文件夹
   - 将发件人添加到联系人列表

---

### 问题 3：Gmail 应用专用密码无效

**可能原因**：
- 未启用两步验证
- 密码输入错误（包含空格）
- 密码已过期或被撤销

**解决方案**：
1. 确保已启用两步验证
2. 重新生成应用专用密码
3. 复制密码时注意不要包含空格
4. 如果仍然失败，尝试使用 OAuth2 方式（需要额外配置）

---

### 问题 4：AWS SES 沙盒模式限制

**问题**：只能发送给已验证的邮箱

**解决方案**：
1. 登录 AWS SES Console
2. 进入 **Account dashboard**
3. 点击 **Request production access**
4. 填写申请表单，说明使用场景
5. 等待 AWS 审核（通常 24 小时内）

---

### 问题 5：邮件模板变量不显示

**可能原因**：
- 邮件模板语法错误
- 变量名称错误
- 数据未正确传递

**解决方案**：
1. 检查邮件模板语法（使用 `{{ .VariableName }}` 格式）
2. 确认变量名称正确（参考 [Supabase 邮件模板文档](https://supabase.com/docs/guides/auth/auth-email-templates)）
3. 检查代码中是否正确传递了数据

---

## 📚 相关文档

- [Supabase Auth SMTP 配置官方文档](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase 邮件模板指南](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Send Email Hook（自定义邮件发送）](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- [项目邮箱邀请设置指南](./EMAIL_INVITATION_SETUP.md)

---

## ✅ 配置检查清单

配置完成后，请确认：

- [ ] SMTP Host 和 Port 配置正确
- [ ] 用户名和密码正确（特别是应用专用密码）
- [ ] 发件人邮箱已验证
- [ ] 发件人名称已设置
- [ ] SMTP 连接测试成功
- [ ] 测试邮件发送成功
- [ ] 域名 DNS 记录已配置（SPF、DKIM）
- [ ] 邮件模板已自定义（可选）
- [ ] 已查看邮件日志，确认无错误

---

**最后更新**：2026-01-28  
**适用版本**：Supabase v2.x
