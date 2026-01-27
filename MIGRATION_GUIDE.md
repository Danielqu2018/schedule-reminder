# 迁移指南 - 从个人日程到团队项目管理

## 迁移概述

将现有的简单个人日程管理系统升级为支持团队协作的完整项目管理系统。

---

## 迁移策略

### 方案A：渐进式迁移（推荐）

**优势：**
- 风险低
- 用户逐步适应
- 可以回滚
- 分阶段验证

**步骤：**
1. **阶段1**：保持现有功能，添加团队管理（1-2周）
2. **阶段2**：添加工作组和任务升级（1-2周）
3. **阶段3**：添加工作子项功能（2-3周）
4. **阶段4**：添加统计扩展（1周）
5. **阶段5**：优化和测试（1周）

### 方案B：完全重写

**优势：**
- 架构清晰
- 技术债务少
- 更好的用户体验

**劣势：**
- 时间长（6-8周）
- 风险高
- 需要完全测试
- 无法回滚

---

## 数据迁移

### 步骤1：备份现有数据

```sql
-- 备份schedules表
CREATE TABLE schedules_backup AS SELECT * FROM schedules;

-- 导出数据
COPY schedules TO 'schedules_backup.csv' WITH CSV HEADER;
```

### 步骤2：创建新的数据库表

按照`TEAM_DATABASE_DESIGN.md`中的SQL脚本创建所有新表。

### 步骤3：迁移数据

```sql
-- 为每个用户创建默认个人团队
INSERT INTO teams (name, owner_id, description)
SELECT 
  '个人团队' as name,
  user_id as owner_id,
  '从个人日程自动迁移的默认团队' as description
FROM schedules
GROUP BY user_id
ON CONFLICT DO NOTHING;

-- 创建个人工作组
INSERT INTO work_groups (team_id, name, description, leader_id)
SELECT 
  t.id as team_id,
  '默认工作组' as name,
  '个人工作默认组' as description,
  t.owner_id as leader_id
FROM teams t
WHERE t.name = '个人团队'
ON CONFLICT DO NOTHING;

-- 迁移schedules到tasks
INSERT INTO tasks (team_id, work_group_id, title, description, start_date, end_date, status, created_by, created_at)
SELECT 
  t.id as team_id,
  wg.id as work_group_id,
  s.title,
  s.description,
  s.date as start_date,
  s.date as end_date,
  s.status,
  s.user_id as created_by,
  s.created_at
FROM schedules s
JOIN teams t ON t.owner_id = s.user_id AND t.name = '个人团队'
JOIN work_groups wg ON wg.team_id = t.id AND wg.name = '默认工作组';

-- 为每个任务创建一个默认工作子项
INSERT INTO work_items (
  task_id, title, description, execution_order, 
  planned_start_time, assignee_id, created_by, created_at
)
SELECT 
  t.id as task_id,
  t.title,
  t.description,
  'parallel' as execution_order,
  CONCAT(t.start_date, ' ', t.time || ':00')::timestamp as planned_start_time,
  t.user_id as assignee_id,
  t.user_id as created_by,
  t.created_at
FROM tasks t
WHERE t.team_id IN (
  SELECT id FROM teams WHERE name = '个人团队'
);
```

### 步骤4：验证迁移

```sql
-- 检查数据完整性
SELECT 
  (SELECT COUNT(*) FROM schedules) as original_count,
  (SELECT COUNT(*) FROM tasks) as migrated_count,
  (SELECT COUNT(*) FROM work_items) as items_count;

-- 检查是否有数据丢失
SELECT s.title 
FROM schedules s
LEFT JOIN tasks t ON t.title = s.title AND t.created_at = s.created_at
WHERE t.id IS NULL;

-- 检查用户是否都有个人团队
SELECT u.email 
FROM auth.users u
LEFT JOIN teams t ON t.owner_id = u.id AND t.name = '个人团队'
WHERE t.id IS NULL;
```

---

## 代码迁移

### 现有代码分析

**当前文件：**
- `index.html` - 主页面
- `styles.css` - 样式
- `script.js` - 主要逻辑

**需要重构：**
- 所有代码需要支持团队概念
- 需要添加权限控制
- 需要支持复杂的数据关系

### 推荐重构方案

#### 选项1：保持现有架构，增量添加功能

**文件结构保持不变：**
```
schedule-reminder/
├── index.html (添加团队管理UI)
├── styles.css (添加新样式)
├── script.js (扩展功能)
└── supabase-config.js (保持不变)
```

**代码组织：**
```javascript
// script.js
class ScheduleReminder {
  // 现有功能保持不变
  constructor() { /* ... */ }
  
  // 新增团队管理功能
  async createTeam(name, description) { /* ... */ }
  async addTeamMember(teamId, userId, role) { /* ... */ }
  
  // 新增工作子项功能
  async createWorkItem(taskId, itemData) { /* ... */ }
  async updateWorkItemStatus(itemId, status, progress) { /* ... */ }
  
  // 新增清单生成功能
  generateWorkItemList(taskId) { /* ... */ }
  
  // 新增统计功能
  calculateMemberStats(memberId, dateRange) { /* ... */ }
}
```

**优点：**
- 开发周期短
- 可以逐步测试
- 风险可控

**缺点：**
- 代码会变得复杂
- 难以维护
- 功能耦合度高

#### 选项2：使用现代框架重写（推荐）

**文件结构：**
```
team-project-manager/
├── src/
│   ├── components/
│   │   ├── Team/
│   │   │   ├── TeamList.tsx
│   │   │   ├── TeamCreate.tsx
│   │   │   └── TeamMembers.tsx
│   │   ├── Task/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCreate.tsx
│   │   │   └── TaskDetail.tsx
│   │   ├── WorkItem/
│   │   │   ├── WorkItemList.tsx
│   │   │   ├── WorkItemCreate.tsx
│   │   │   └── WorkItemDetail.tsx
│   │   └── Statistics/
│   │       ├── TaskStats.tsx
│   │       ├── MemberStats.tsx
│   │       └── TeamOverview.tsx
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── types/
├── public/
└── package.json
```

**优点：**
- 代码结构清晰
- 易于维护和扩展
- 更好的开发体验
- 支持TypeScript
- 更好的性能

**缺点：**
- 开发周期长
- 需要学习新框架
- 完全重写风险高

---

## 推荐实施方案

基于您的需求，我推荐以下方案：

### 第一步：立即可以做的（1-2天）

**保持现有架构，快速实现核心功能：**

1. **扩展数据库**
   - 在Supabase中创建新表
   - 迁移现有数据
   - 配置RLS策略

2. **添加团队管理**
   - 团队创建UI
   - 成员管理UI
   - 工作组管理UI

3. **升级任务系统**
   - 任务关联团队和工作组
   - 添加任务优先级
   - 添加任务分配

### 第二步：核心功能实现（2-3周）

4. **实现工作子项**
   - 子项创建UI
   - 执行顺序选择（并行/顺序）
   - 时间管理（时长/完成时间）
   - 人员分配（负责人/配合人）
   - 工作目标录入

5. **实现清单生成**
   - 自动排序逻辑
   - 清单展示UI
   - 进度跟踪

6. **实现人员统计**
   - 统计数据计算
   - 人员绩效展示
   - 团队效率分析

### 第三步：优化和测试（1周）

7. **性能优化**
   - 数据库查询优化
   - 前端渲染优化
   - 添加缓存

8. **全面测试**
   - 功能测试
   - 性能测试
   - 用户体验测试

---

## 立即行动建议

### 今天可以做的：

1. **评审数据库设计**
   - 查看`TEAM_DATABASE_DESIGN.md`
   - 与团队讨论表结构
   - 确认是否需要调整

2. **创建测试环境**
   - 在Supabase中创建新项目
   - 执行数据库创建脚本
   - 测试RLS策略

3. **设计关键界面**
   - 团队管理界面原型
   - 工作子项界面原型
   - 统计界面原型

### 本周可以做的：

4. **开始实现**
   - 创建新的HTML页面（团队管理）
   - 实现团队CRUD功能
   - 实现工作子项基础功能

5. **数据迁移测试**
   - 使用测试数据测试迁移
   - 验证数据完整性
   - 调试迁移脚本

---

## 时间估算

| 阶段 | 任务 | 预估时间 | 依赖 |
|------|------|----------|------|
| 1 | 数据库设计和创建 | 2-3天 | 无 |
| 2 | 数据迁移脚本开发 | 1-2天 | 阶段1 |
| 3 | 团队管理UI和功能 | 3-4天 | 阶段1 |
| 4 | 工作子项UI和功能 | 5-6天 | 阶段3 |
| 5 | 清单生成功能 | 2-3天 | 阶段4 |
| 6 | 统计功能扩展 | 3-4天 | 阶段2、4、5 |
| 7 | 优化和测试 | 3-4天 | 阶段1-6 |
| **总计** | | **19-26天** | 约4-5周 |

---

## 风险缓解

### 技术风险

**风险：** 数据迁移可能导致数据丢失
**缓解：** 
- 先在测试环境验证
- 创建完整备份
- 提供回滚方案

**风险：** 性能可能下降
**缓解：**
- 提前进行性能测试
- 优化数据库查询
- 添加必要的索引

### 项目风险

**风险：** 需求可能变更
**缓解：**
- 与团队充分沟通
- 分阶段验证
- 保持灵活性

**风险：** 开发周期可能延长
**缓解：**
- 合理估算时间
- 优先实现核心功能
- 非核心功能可后续迭代

---

## 成功标准

### 功能完整性
- ✅ 支持团队和工作组管理
- ✅ 支持任务和工作子项管理
- ✅ 支持并行和顺序执行配置
- ✅ 支持负责人和配合人管理
- ✅ 自动生成工作子项清单
- ✅ 支持人员工作统计

### 数据准确性
- ✅ 现有数据成功迁移
- ✅ 统计数据准确无误
- ✅ 权限控制正确实施

### 性能要求
- ✅ 页面响应时间 < 2秒
- ✅ 查询响应时间 < 500ms
- ✅ 支持50+并发用户

### 用户体验
- ✅ 界面友好易用
- ✅ 提供清晰的使用指南
- ✅ 支持移动端访问

---

## 下一步

1. **评审文档**
   - 查看`TEAM_DATABASE_DESIGN.md`
   - 查看`TEAM_REQUIREMENTS_ANALYSIS.md`
   - 确认需求理解

2. **决策技术方案**
   - 选择保持现有架构还是重构
   - 确定优先级和排期

3. **开始实施**
   - 创建开发环境
   - 开始数据库设计和创建
   - 启动前端开发

---

## 需要的决策

### 1. 技术架构
- 是否升级到现代框架（React/Vue）？
- 还是保持现有HTML/JS架构？

### 2. 功能优先级
- 哪些功能是必须的（P0）？
- 哪些功能可以后续迭代（P1/P2）？

### 3. 开发周期
- 预期什么时候完成？
- 是否可以分阶段发布？

### 4. 团队规模
- 预计有多少用户？
- 预计有多少并发用户？

---

## 联系和支持

如果在迁移过程中遇到问题：
1. 查看详细的设计文档
2. 参考数据库SQL脚本
3. 进行充分测试
4. 逐步验证每个功能

祝迁移顺利！🚀