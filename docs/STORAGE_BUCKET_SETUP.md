# Supabase Storage Bucket 创建指南

## 📦 创建 Storage Bucket

### 步骤 1：登录 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目

### 步骤 2：进入 Storage 页面

1. 在左侧导航栏中，点击 **Storage**（存储）
2. 或者直接访问：`https://supabase.com/dashboard/project/[your-project-ref]/storage/buckets`

### 步骤 3：创建新 Bucket

1. 点击页面右上角的 **New bucket**（新建存储桶）按钮
2. 或者点击 **Create a new bucket** 链接

### 步骤 4：配置 Bucket

在弹出的对话框中填写以下信息：

#### 基本信息

- **Name（名称）**: `task-event-files`
  - ⚠️ 注意：名称必须与代码中的 `STORAGE_BUCKET` 常量一致
  - 只能包含小写字母、数字和连字符（-）
  - 不能包含空格或特殊字符

- **Public bucket（公共存储桶）**: 
  - ❌ **取消勾选**（选择私有存储）
  - 原因：文件包含团队内部信息，不应公开访问

#### 高级设置（可选）

- **File size limit（文件大小限制）**: `10MB`
  - 默认值通常足够，如需调整可以修改
  - 单位：MB

- **Allowed MIME types（允许的 MIME 类型）**:
  ```
  image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  ```
  - 或者留空以允许所有类型（不推荐）

### 步骤 5：创建 Bucket

1. 点击 **Create bucket**（创建存储桶）按钮
2. 等待创建完成（通常几秒钟）

### 步骤 6：验证创建成功

创建成功后，您应该能在 Storage 页面看到：
- ✅ Bucket 名称：`task-event-files`
- ✅ 图标显示为 🔒（表示私有）
- ✅ 文件数量：0（初始为空）

---

## 🔐 配置 Storage Policies（存储策略）

创建 Bucket 后，需要配置访问策略以控制文件的上传、查看和删除权限。

### 步骤 1：进入 Policies 页面

1. 点击 `task-event-files` Bucket
2. 点击 **Policies**（策略）标签页
3. 或者直接访问：`https://supabase.com/dashboard/project/[your-project-ref]/storage/policies/bucket/task-event-files`

### 步骤 2：创建上传策略（INSERT）

1. 点击 **New Policy**（新建策略）
2. 选择 **For full customization**（完全自定义）
3. 配置如下：

**策略名称**：
```
Team members can upload files
```

**Allowed operation（允许的操作）**：
- ✅ INSERT

**Policy definition（策略定义）**：
```sql
(bucket_id = 'task-event-files'::text) AND (
  EXISTS (
    SELECT 1 FROM task_events te
    JOIN tasks t ON t.id = te.task_id
    JOIN team_members tm ON tm.team_id = t.team_id
    WHERE (storage.foldername(name))[1] = te.id::text
    AND tm.user_id = auth.uid()
  )
)
```

**说明**：
- ⚠️ **直接使用 `name`**（不是 `objects.name`）- Storage Policies 中 `name` 已经指向当前行的文件名
- 只有团队成员可以上传文件
- 文件路径的第一级目录必须是事件ID
- 用户必须是该事件所属团队的成员

4. 点击 **Review**（审查）
5. 点击 **Save policy**（保存策略）

### 步骤 3：创建查看策略（SELECT）

1. 再次点击 **New Policy**
2. 选择 **For full customization**
3. 配置如下：

**策略名称**：
```
Team members can view files
```

**Allowed operation（允许的操作）**：
- ✅ SELECT

**Policy definition（策略定义）**：
```sql
(bucket_id = 'task-event-files'::text) AND (
  EXISTS (
    SELECT 1 FROM task_events te
    JOIN tasks t ON t.id = te.task_id
    JOIN team_members tm ON tm.team_id = t.team_id
    WHERE (storage.foldername(name))[1] = te.id::text
    AND tm.user_id = auth.uid()
  )
)
```

**说明**：
- ⚠️ **直接使用 `name`**（不是 `objects.name`）- Storage Policies 中 `name` 已经指向当前行的文件名

4. 点击 **Review**
5. 点击 **Save policy**

### 步骤 4：创建删除策略（DELETE）

1. 再次点击 **New Policy**
2. 选择 **For full customization**
3. 配置如下：

**策略名称**：
```
Team members can delete files
```

**Allowed operation（允许的操作）**：
- ✅ **DELETE** ⚠️ **重要：必须选择 DELETE，不要选择 SELECT**

**Policy definition（策略定义）**：
```sql
(bucket_id = 'task-event-files'::text) AND (
  owner = auth.uid()
  OR EXISTS (
    SELECT 1 FROM task_events te
    JOIN tasks t ON t.id = te.task_id
    JOIN team_members tm ON tm.team_id = t.team_id
    WHERE (storage.foldername(name))[1] = te.id::text
    AND tm.user_id = auth.uid()
    AND tm.role IN ('owner', 'admin')
  )
)
```

**重要说明**：
- ⚠️ Storage 的 objects 表中使用 `owner` 字段（不是 `uploaded_by`）
- ⚠️ **直接使用 `name`**（不是 `objects.name`）- Storage Policies 中 `name` 已经指向当前行的文件名
- ⚠️ `storage.foldername(name)` 是正确的语法，用于提取文件路径的第一级目录
- `owner` 字段存储的是上传文件的用户 UUID
- 文件上传者可以删除自己上传的文件
- 团队管理员和所有者可以删除任何文件

4. 点击 **Review**
5. 点击 **Save policy**

---

## ✅ 验证配置

### 检查清单

- [ ] Bucket `task-event-files` 已创建
- [ ] Bucket 设置为私有（🔒 图标）
- [ ] INSERT 策略已创建
- [ ] SELECT 策略已创建
- [ ] DELETE 策略已创建

### 测试上传

1. 在前端应用中记录一个事件
2. 尝试上传一个文件
3. 检查 Storage 页面是否能看到上传的文件
4. 验证文件路径格式：`{event_id}/{filename}`

---

## 🔧 故障排除

### 问题 1：无法上传文件

**可能原因**：
- Bucket 名称不匹配
- Storage Policies 未正确配置
- RLS 策略阻止访问

**解决方法**：
1. 检查代码中的 `STORAGE_BUCKET` 常量是否为 `task-event-files`
2. 检查 Storage Policies 是否正确创建
3. 检查数据库 RLS 策略是否允许访问 `task_events` 表

### 问题 2：文件上传后无法查看

**可能原因**：
- SELECT 策略未配置
- 文件路径格式不正确

**解决方法**：
1. 检查 SELECT 策略是否存在
2. 确认文件路径格式为 `{event_id}/{filename}`

### 问题 3：权限错误

**可能原因**：
- 用户不是团队成员
- RLS 策略配置错误

**解决方法**：
1. 确认用户在 `team_members` 表中
2. 检查 RLS 策略是否正确

### 问题 4：策略3 COMMAND 错误（ERROR 42703）

**问题**：策略3的 COMMAND 显示为 SELECT 而不是 DELETE

**原因**：创建策略时选择了错误的操作类型

**解决方法**：
1. 删除错误的策略3（点击 ⋮ 菜单 > Delete policy）
2. 重新创建 DELETE 策略，确保选择 **DELETE** 操作类型
3. 使用正确的策略定义（见步骤 4）

**详细说明**：查看 [Storage Policy 修复指南](./STORAGE_POLICY_FIX.md)

### 问题 5：保存后再次编辑显示 `objects.name`

**问题**：保存策略后，再次编辑时看到 `storage.foldername(objects.name)` 而不是 `storage.foldername(name)`

**原因**：这是 Supabase Dashboard 的 UI 显示特性

**说明**：
- ✅ **这是正常的**：Supabase Dashboard 在显示时会自动添加 `objects.` 前缀
- ✅ **策略仍然有效**：即使显示为 `objects.name`，策略功能正常
- ✅ **不影响使用**：可以正常上传、查看、删除文件
- ⚠️ **如果遇到 ERROR 42703**：说明策略定义有问题，需要检查 SQL 语法

**验证方法**：
1. 保存策略后，尝试上传一个文件
2. 如果上传成功，说明策略工作正常
3. UI 显示的 `objects.name` 只是显示问题，不影响功能

---

## 📝 注意事项

1. **Bucket 名称**：
   - 必须与代码中的常量一致
   - 创建后无法重命名（只能删除重建）

2. **文件路径**：
   - 文件存储在 `{event_id}/{filename}` 格式的路径下
   - 这有助于组织文件和管理权限

3. **存储限制**：
   - Supabase 免费版有存储限制
   - 建议定期清理不需要的文件

4. **安全性**：
   - 始终使用私有 Bucket（除非确实需要公开）
   - 配置适当的 Storage Policies
   - 定期审查访问权限

---

## 🔗 相关链接

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Storage Policies 文档](https://supabase.com/docs/guides/storage/security/access-control)
- [RLS 策略文档](https://supabase.com/docs/guides/auth/row-level-security)

---

**创建日期**：2026-01-28  
**版本**：1.0.0
