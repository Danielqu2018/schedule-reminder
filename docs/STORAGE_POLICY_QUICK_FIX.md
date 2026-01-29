# Storage Policy 快速修复指南

## 🚨 ERROR 42703 修复

### 问题原因

在 Storage Policies 的 SQL 表达式中使用了 `objects.name`，但应该直接使用 `name`。

### ⚠️ 重要说明：Supabase Dashboard 显示问题

**如果您保存策略后，再次编辑时看到 `objects.name`，这是正常的！**

Supabase Dashboard 在显示策略时会自动添加 `objects.` 前缀，但：
- ✅ **策略实际工作正常**：即使显示为 `objects.name`，策略仍然有效
- ✅ **ERROR 42703 已解决**：如果策略能保存成功，说明错误已修复
- ✅ **功能正常**：可以正常上传、查看、删除文件

**这是 Supabase Dashboard 的 UI 显示特性，不影响实际功能。**

### 快速修复步骤

1. **打开策略编辑界面**
   - 点击策略3右侧的 **⋮** 菜单
   - 选择 **Edit policy**

2. **修复 SQL 表达式**
   
   找到这一行：
   ```sql
   storage.foldername(objects.name)
   ```
   
   改为：
   ```sql
   storage.foldername(name)
   ```
   
   **完整修复后的 SQL**：
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

3. **检查操作类型**
   - 确保 **COMMAND** 是 **DELETE**（不是 SELECT）

4. **保存**
   - 点击 **Review** 检查
   - 点击 **Save** 保存

---

## ✅ 正确的 SQL 语法

### Storage Policies 中的列引用

| ❌ 错误 | ✅ 正确 | 说明 |
|---------|--------|------|
| `objects.name` | `name` | Storage Policies 中直接使用列名 |
| `objects.bucket_id` | `bucket_id` | 不需要表前缀 |
| `objects.owner` | `owner` | 直接引用列名 |

### 为什么？

Storage Policies 是在 `storage.objects` 表上定义的，所以：
- `name` 自动指向 `storage.objects.name`
- `bucket_id` 自动指向 `storage.objects.bucket_id`
- `owner` 自动指向 `storage.objects.owner`

**不需要** `objects.` 前缀！

### ⚠️ Supabase Dashboard 显示说明

**重要**：保存策略后，再次编辑时 Supabase Dashboard 可能会显示 `objects.name`，这是正常的 UI 显示特性：

- ✅ **策略功能正常**：即使显示为 `objects.name`，策略仍然有效
- ✅ **不影响使用**：可以正常上传、查看、删除文件
- ✅ **验证方法**：如果策略能保存成功且文件操作正常，说明配置正确
- ⚠️ **如果遇到 ERROR 42703**：说明策略定义有问题，需要检查 SQL 语法

**这是 Supabase Dashboard 的显示特性，不是错误。**

---

## 📝 完整的三个策略 SQL

### 策略1：INSERT（上传）

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

### 策略2：SELECT（查看）

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

### 策略3：DELETE（删除）

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

---

**修复日期**：2026-01-28  
**状态**：✅ 已修复
