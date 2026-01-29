# 项目文档索引

## 📚 文档导航

### 🚀 快速开始

- **[README.md](../README.md)** - 项目总览和完整指南 ⭐
- **[DATABASE_SETUP.md](../DATABASE_SETUP.md)** - 数据库设置指南

### 📖 功能文档

#### 个人功能
- **[个人日程管理](../README.md#个人功能数据库配置)** - 个人日程管理功能说明
- **[进展更新功能](../README.md#进展更新功能)** - 完成率跟踪和进展更新

#### 团队功能
- **[团队管理](../docs/TEAM_SETUP_GUIDE.md)** - 团队创建和管理
- **[任务管理](../README.md#任务管理)** - 任务创建和跟踪
- **[过程性成果记录](./TASK_EVENTS_FEATURE.md)** - 事件记录和文件上传

### 🗄️ 数据库文档

#### SQL 脚本
- **[SQL 文件说明](./sql/README.md)** - 所有 SQL 脚本的详细说明
- **[个人日程表](./sql/CREATE_SCHEDULES_TABLE.sql)** - 创建个人日程表
- **[进展更新功能](./sql/ADD_SCHEDULE_PROGRESS_FEATURE.sql)** - 添加进展跟踪
- **[日期结构更新](./sql/UPDATE_SCHEDULE_DATE_STRUCTURE.sql)** - 日期范围和子项目
- **[团队数据库完整设置](./sql/TEAM_DATABASE_COMPLETE.sql)** - 团队功能完整数据库
- **[团队邀请功能](./sql/TEAM_INVITATIONS_SETUP.sql)** - 邮箱邀请功能
- **[任务事件功能](./sql/TASK_EVENTS_SETUP.sql)** - 过程性成果记录

#### 修复脚本
- **[RLS 递归修复](./sql/FIX_RLS_RECURSION.sql)** - 修复 RLS 递归问题
- **[邀请函数修复](./sql/FIX_TEAM_INVITATION_FUNCTION_SIMPLE.sql)** - 修复栈溢出问题

#### 数据迁移
- **[数据迁移脚本](./sql/MIGRATION_EXECUTE.sql)** - 从个人版迁移到团队版

### 🔧 配置文档

- **[Storage Bucket 设置](./STORAGE_BUCKET_SETUP.md)** - Supabase Storage 配置
- **[SMTP 配置指南](./SMTP_SETUP.md)** - Supabase SMTP 详细配置指南 ⭐
- **[邮箱邀请设置](./EMAIL_INVITATION_SETUP.md)** - 邮件服务配置
- **[邮件邀请问题排查](./EMAIL_INVITATION_TROUBLESHOOTING.md)** - 邮件发送问题诊断和解决 ⚠️

### 🐛 故障排除

- **[启动问题排查](./STARTUP_TROUBLESHOOTING.md)** - 应用启动问题排查指南 ⭐
- **[故障排除指南](./TROUBLESHOOTING.md)** - 常见问题和解决方案
- **[数据库验证](./VERIFY_DATABASE_SETUP.md)** - 验证数据库配置

### 📝 开发文档

- **[项目组织](./PROJECT_ORGANIZATION.md)** - 项目结构说明
- **[代码审查](./CODE_REVIEW.md)** - 代码质量报告
- **[优化总结](./OPTIMIZATION_SUMMARY.md)** - 性能优化记录
- **[Git 使用指南](./GIT_GUIDE.md)** - Git 命令和最佳实践

### 📋 需求分析

- **[团队需求分析](../TEAM_REQUIREMENTS_ANALYSIS.md)** - 团队功能需求
- **[数据库设计](../TEAM_DATABASE_DESIGN.md)** - 数据库设计文档

---

## 📂 文档分类

### 按用途分类

#### 安装和配置
1. README.md - 项目总览和安装指南
2. DATABASE_SETUP.md - 数据库设置
3. TEAM_SETUP_GUIDE.md - 团队功能设置
4. STORAGE_BUCKET_SETUP.md - Storage 配置
5. SMTP_SETUP.md - SMTP 配置指南
6. EMAIL_INVITATION_SETUP.md - 邮件配置

#### 功能说明
1. TASK_EVENTS_FEATURE.md - 过程性成果记录
2. sql/README.md - SQL 脚本说明

#### 问题解决
1. TROUBLESHOOTING.md - 故障排除
2. VERIFY_DATABASE_SETUP.md - 数据库验证
3. sql/FIX_*.sql - 修复脚本

#### 开发参考
1. PROJECT_ORGANIZATION.md - 项目结构
2. CODE_REVIEW.md - 代码审查
3. OPTIMIZATION_SUMMARY.md - 优化记录
4. GIT_GUIDE.md - Git 指南

---

## 🔍 快速查找

### 我想...

- **开始使用项目** → [README.md](../README.md)
- **设置数据库** → [DATABASE_SETUP.md](../DATABASE_SETUP.md)
- **创建团队** → [TEAM_SETUP_GUIDE.md](./TEAM_SETUP_GUIDE.md)
- **上传文件** → [STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md)
- **配置 SMTP** → [SMTP_SETUP.md](./SMTP_SETUP.md)
- **启动问题** → [STARTUP_TROUBLESHOOTING.md](./STARTUP_TROUBLESHOOTING.md)
- **解决问题** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **查看 SQL 脚本** → [sql/README.md](./sql/README.md)
- **了解项目结构** → [PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md)

---

**最后更新**：2026-01-28  
**项目版本**：v2.2.0
