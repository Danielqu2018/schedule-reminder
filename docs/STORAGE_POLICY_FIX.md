# Storage Policy 策略3修复指南

## 🔍 问题诊断

根据您提供的截图，策略3存在以下问题：

1. **COMMAND 错误**：
   - **当前**：`SELECT` ❌
   - **应该是**：`DELETE` ✅

2. **SQL 表达式错误（ERROR 42703）**：
   - **当前**：`storage.foldername(objects.name)` ❌
   - **应该是**：`storage.foldername(name)` ✅
   - **原因**：Storage Policies 中 `name` 已经指向当前行的文件名，不需要 `objects.` 前缀

3. **⚠️ Supabase Dashboard 显示问题**：
   - 保存策略后，再次编辑时可能显示 `objects.name`
   - **这是正常的 UI 显示特性**，不影响策略功能
   - 如果策略能保存成功且功能正常，可以忽略这个显示问题

## ✅ 解决方案

### 方法1：删除并重新创建策略（推荐）

1. **删除错误的策略3**
   - 点击策略3右侧的 **⋮**（三个点）菜单
   - 选择 **Delete policy**
   - 确认删除

2. **创建新的 DELETE 策略**
   - 点击 **New policy** 按钮
   - 选择 **For full customization**
   - 配置如下：

**策略名称**：
```
Team members can delete files
```

**Allowed operation（允许的操作）**：
- ✅ **DELETE**（重要：必须选择 DELETE，不是 SELECT）

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

**重要提示**：
- ⚠️ 必须选择 **DELETE** 操作类型
- ⚠️ 使用 `owner` 字段（不是 `uploaded_by`）
- ⚠️ **直接使用 `name`**（不是 `objects.name`）- Storage Policies 中 `name` 已经指向当前行的文件名
- ⚠️ `storage.foldername(name)` 是正确的语法
- `owner` 字段存储的是上传文件的用户 UUID

### 方法2：编辑现有策略

1. 点击策略3右侧的 **⋮** 菜单
2. 选择 **Edit policy**
3. 将 **COMMAND** 从 `SELECT` 改为 `DELETE`
4. **修复 SQL 表达式**：
   - 找到 `storage.foldername(objects.name)`
   - 改为 `storage.foldername(name)`（删除 `objects.` 前缀）
5. 更新策略定义为上面的 SQL
6. 点击 **Review** 检查
7. 点击 **Save** 保存

**⚠️ 注意**：保存后再次编辑时，Supabase Dashboard 可能会显示 `objects.name`，这是正常的 UI 显示特性，不影响策略功能。如果策略能保存成功且文件操作正常，说明配置正确。

---

## 📋 正确的策略配置清单

确保您有以下3个策略：

| 策略名称 | COMMAND | 说明 |
|---------|---------|------|
| Team members can upload files | **INSERT** | 允许团队成员上传文件 |
| Team members can view files | **SELECT** | 允许团队成员查看文件 |
| Team members can delete files | **DELETE** | 允许删除文件 |

---

## 🔧 验证步骤

1. **检查策略数量**：应该有3个策略（INSERT、SELECT、DELETE各一个）
2. **检查操作类型**：确保每个策略的 COMMAND 正确
3. **测试删除功能**：
   - 上传一个测试文件
   - 尝试删除该文件
   - 应该可以成功删除

---

## ⚠️ 常见错误

### 错误1：COMMAND 选择错误
- ❌ 将 DELETE 策略的 COMMAND 设置为 SELECT
- ✅ 确保 DELETE 策略的 COMMAND 是 DELETE

### 错误2：使用错误的字段名
- ❌ `uploaded_by = auth.uid()`
- ✅ `owner = auth.uid()`

### 错误3：使用错误的列引用
- ❌ `storage.foldername(objects.name)` - ERROR 42703（列不存在）
- ✅ `storage.foldername(name)` - 正确
- **原因**：Storage Policies 中 `name` 已经指向当前行的文件名，不需要 `objects.` 前缀

**⚠️ 重要**：如果保存后再次编辑时看到 `objects.name`，这是 Supabase Dashboard 的 UI 显示特性，不影响策略功能。只要策略能保存成功且文件操作正常，说明配置正确。

### 错误4：策略定义语法错误
- 确保 SQL 语法正确
- 确保所有表名和字段名正确
- 确保括号匹配
- 确保使用 `name` 而不是 `objects.name`

---

**修复日期**：2026-01-28  
**状态**：✅ 已修复
