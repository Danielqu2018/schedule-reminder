# SQL 文件说明

## 文件结构

### 核心数据库设置文件

1. **`CREATE_SCHEDULES_TABLE.sql`** - 个人日程表创建脚本 ⭐（个人功能必需）
   - 创建 `schedules` 表（个人日程管理功能）
   - 包含完整的 RLS 策略、索引和约束
   - 使用 `IF NOT EXISTS` 安全创建，不会覆盖现有表
   - 用途：创建个人日程管理功能所需的数据库表

2. **`ADD_SCHEDULE_PROGRESS_FEATURE.sql`** - 个人日程进展更新功能 ⭐（推荐）
   - 为 `schedules` 表添加进展相关字段（完成率、更新时间等）
   - 创建 `schedule_progress_updates` 表（进展更新历史记录）
   - 包含自动更新触发器
   - 用途：添加进展跟踪和更新历史功能

3. **`UPDATE_SCHEDULE_DATE_STRUCTURE.sql`** - 更新日期结构 + 子项目功能 ⭐（推荐）
   - 将 `date`/`time` 改为 `start_date`/`end_date`（日期范围）
   - 创建 `schedule_sub_items` 表（子项目管理）
   - 迁移现有数据
   - 用途：支持日期范围和子项目管理

4. **`TEAM_DATABASE_COMPLETE.sql`** - 完整数据库设置脚本（推荐用于全新安装）
   - 包含所有表结构、索引、约束、触发器和 RLS 策略
   - 已修复所有递归问题
   - 用途：一次性创建完整的数据库结构

5. **`TEAM_INVITATIONS_SETUP.sql`** - 团队邀请功能设置脚本
   - 创建 `team_invitations` 表
   - 创建邀请相关的数据库函数
   - 已修复栈溢出和列名歧义问题
   - 用途：添加邮箱邀请功能

6. **`TASK_EVENTS_SETUP.sql`** - 任务过程性成果记录功能 ⭐（新增）
   - 创建 `task_events` 表（事件记录）
   - 创建 `task_event_files` 表（文件存储）
   - 包含完整的 RLS 策略和 Storage 配置说明
   - 用途：添加过程性成果记录和文件上传功能

### 修复文件

7. **`FIX_RLS_RECURSION.sql`** - 修复 RLS 递归问题
   - 修复 `teams` 和 `team_members` 表的 RLS 策略
   - 解决 "infinite recursion detected" 错误
   - 用途：如果遇到 RLS 递归错误，执行此脚本

8. **`FIX_TEAM_INVITATION_FUNCTION_SIMPLE.sql`** - 修复邀请函数栈溢出问题
   - 修复 `create_team_invitation` 函数的栈溢出问题
   - 简化函数逻辑，移除可能导致递归的查询
   - 用途：如果遇到 "stack depth limit exceeded" 错误，执行此脚本

### 数据迁移文件

9. **`MIGRATION_EXECUTE.sql`** - 数据迁移脚本
   - 从个人版迁移到团队版
   - 创建默认团队和工作组
   - 迁移 schedules 到 tasks
   - 用途：将现有个人日程数据迁移到团队版本

## 使用指南

### 全新安装

#### 个人功能（必需）

1. **创建个人日程表**：
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- docs/sql/CREATE_SCHEDULES_TABLE.sql
   ```
   这是个人日程管理功能的基础，必须首先执行。

2. **添加进展更新功能**（推荐）：
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- docs/sql/ADD_SCHEDULE_PROGRESS_FEATURE.sql
   ```
   添加完成率跟踪和进展更新历史功能。

3. **更新日期结构 + 子项目功能**（推荐）：
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- docs/sql/UPDATE_SCHEDULE_DATE_STRUCTURE.sql
   ```
   将日期改为日期范围（启动日期/完成日期），并添加子项目管理功能。

#### 团队功能（可选）

4. **执行完整数据库设置**：
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- docs/sql/TEAM_DATABASE_COMPLETE.sql
   ```

5. **添加邀请功能**：
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- docs/sql/TEAM_INVITATIONS_SETUP.sql
   ```

6. **添加任务事件功能**（可选）：
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- docs/sql/TASK_EVENTS_SETUP.sql
   ```
   添加过程性成果记录和文件上传功能。

**注意**：个人功能和团队功能可以共存，`schedules` 表与团队表互不冲突。

### 修复问题

#### 如果遇到 RLS 递归错误

```sql
-- 执行修复脚本
-- docs/sql/FIX_RLS_RECURSION.sql
```

#### 如果遇到邀请函数栈溢出错误

```sql
-- 执行修复脚本
-- docs/sql/FIX_TEAM_INVITATION_FUNCTION_SIMPLE.sql
```

### 数据迁移

如果已有个人日程数据，需要迁移到团队版本：

```sql
-- 执行迁移脚本
-- docs/sql/MIGRATION_EXECUTE.sql
```

## 注意事项

1. **执行顺序**：
   - 个人功能：按顺序执行 `CREATE_SCHEDULES_TABLE.sql` → `ADD_SCHEDULE_PROGRESS_FEATURE.sql` → `UPDATE_SCHEDULE_DATE_STRUCTURE.sql`
   - 团队功能：先执行 `TEAM_DATABASE_COMPLETE.sql`，再执行 `TEAM_INVITATIONS_SETUP.sql` 和 `TASK_EVENTS_SETUP.sql`
   - 修复文件可以在任何时候执行

2. **备份数据**：
   - 执行任何 SQL 脚本前，建议先备份数据库
   - 特别是在生产环境中

3. **RLS 策略**：
   - 所有表都已启用 RLS
   - 策略已优化，避免递归问题
   - 如果遇到权限问题，检查 RLS 策略是否正确配置

4. **函数权限**：
   - `create_team_invitation` 和 `accept_team_invitation` 使用 `SECURITY DEFINER`
   - 这些函数需要足够的权限才能执行
   - 确保函数所有者有正确的权限

## 文件更新历史

- **2026-01-28**: 
  - 添加 `TASK_EVENTS_SETUP.sql` 任务事件功能脚本
  - 更新文件编号和说明

- **2025-01-27**: 
  - 创建 `FIX_TEAM_INVITATION_FUNCTION_SIMPLE.sql` 修复栈溢出问题
  - 更新 `TEAM_INVITATIONS_SETUP.sql` 使用简化版本的函数
  - 删除重复的修复文件
