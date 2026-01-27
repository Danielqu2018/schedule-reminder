# Git 使用指南 - 上传应用到远程仓库

本指南将帮助您使用 Git 命令将 ProjectFlow 应用上传到 GitHub、GitLab 或其他 Git 托管平台。

---

## 📋 目录

- [准备工作](#准备工作)
- [方法一：首次上传（新仓库）](#方法一首次上传新仓库)
- [方法二：已有远程仓库](#方法二已有远程仓库)
- [日常更新](#日常更新)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

---

## 🔧 准备工作

### 1. 检查 Git 是否已安装

```bash
git --version
```

如果显示版本号（如 `git version 2.x.x`），说明已安装。如果未安装，请访问 [Git 官网](https://git-scm.com/) 下载安装。

### 2. 配置 Git 用户信息（首次使用）

```bash
# 设置用户名
git config --global user.name "您的姓名"

# 设置邮箱
git config --global user.email "your.email@example.com"
```

### 3. 检查当前 Git 状态

在项目根目录执行：

```bash
cd schedule-reminder
git status
```

- 如果显示 "not a git repository"，说明需要初始化 Git 仓库
- 如果显示文件列表，说明已有 Git 仓库

---

## 🚀 方法一：首次上传（新仓库）

### 步骤 1：在 GitHub/GitLab 创建新仓库

#### GitHub 创建仓库：

1. 登录 [GitHub](https://github.com)
2. 点击右上角 **"+"** → **"New repository"**
3. 填写仓库信息：
   - **Repository name**: `schedule-reminder`（或您喜欢的名称）
   - **Description**: 团队项目管理系统
   - **Visibility**: Public（公开）或 Private（私有）
   - ⚠️ **不要**勾选 "Initialize this repository with a README"
4. 点击 **"Create repository"**
5. 复制仓库 URL（如：`https://github.com/yourusername/schedule-reminder.git`）

#### GitLab 创建仓库：

1. 登录 [GitLab](https://gitlab.com)
2. 点击 **"New project"** → **"Create blank project"**
3. 填写项目信息并创建
4. 复制仓库 URL

### 步骤 2：初始化本地 Git 仓库

```bash
# 进入项目目录
cd schedule-reminder

# 初始化 Git 仓库
git init

# 检查状态
git status
```

### 步骤 3：添加文件到暂存区

```bash
# 添加所有文件
git add .

# 或选择性添加
git add README.md
git add src/
git add package.json
# ... 其他文件
```

**注意**：`.env` 文件已在 `.gitignore` 中，不会被提交（这是正确的，因为包含敏感信息）。

### 步骤 4：提交更改

```bash
# 提交更改（首次提交）
git commit -m "Initial commit: ProjectFlow 团队项目管理系统"

# 或使用更详细的提交信息
git commit -m "Initial commit

- React + TypeScript + Vite 项目结构
- 个人日程管理功能
- Supabase 集成
- 响应式设计"
```

### 步骤 5：连接远程仓库

```bash
# 添加远程仓库（替换为您的仓库 URL）
git remote add origin https://github.com/yourusername/schedule-reminder.git

# 验证远程仓库
git remote -v
```

**如果使用 SSH**：

```bash
git remote add origin git@github.com:yourusername/schedule-reminder.git
```

### 步骤 6：推送到远程仓库

```bash
# 推送到远程仓库（首次推送）
git push -u origin main

# 如果默认分支是 master，使用：
git push -u origin master
```

**如果遇到错误**，可能需要先设置默认分支：

```bash
# 重命名分支为 main（如果当前是 master）
git branch -M main

# 然后再推送
git push -u origin main
```

### 步骤 7：验证上传成功

1. 访问您的 GitHub/GitLab 仓库页面
2. 确认所有文件都已上传
3. 确认 README.md 正确显示

---

## 🔄 方法二：已有远程仓库

如果远程仓库已经存在（例如，您克隆了仓库或仓库已初始化），使用以下步骤：

### 步骤 1：检查远程仓库

```bash
# 查看远程仓库配置
git remote -v

# 如果没有远程仓库，添加一个
git remote add origin https://github.com/yourusername/schedule-reminder.git
```

### 步骤 2：拉取远程更改（如果有）

```bash
# 拉取远程更改
git pull origin main --allow-unrelated-histories

# 或
git pull origin master --allow-unrelated-histories
```

### 步骤 3：添加并提交更改

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "Update: 项目整理和优化"
```

### 步骤 4：推送到远程

```bash
# 推送到远程仓库
git push origin main

# 或
git push origin master
```

---

## 📝 日常更新

### 标准工作流程

```bash
# 1. 查看更改状态
git status

# 2. 添加更改的文件
git add .

# 或添加特定文件
git add src/pages/NewPage.tsx
git add README.md

# 3. 提交更改
git commit -m "Add: 新增功能说明"

# 4. 推送到远程
git push origin main
```

### 提交信息规范

使用清晰的提交信息：

```bash
# 功能添加
git commit -m "Add: 添加团队管理功能"

# 功能修复
git commit -m "Fix: 修复登录页面错误"

# 文档更新
git commit -m "Docs: 更新 README.md"

# 代码重构
git commit -m "Refactor: 重构任务管理组件"

# 样式调整
git commit -m "Style: 优化移动端样式"
```

---

## ❓ 常见问题

### 问题 1：推送被拒绝（Push rejected）

**错误信息**：`Updates were rejected because the remote contains work that you do not have locally`

**解决方法**：

```bash
# 先拉取远程更改
git pull origin main --rebase

# 解决冲突（如果有）
# 然后再次推送
git push origin main
```

### 问题 2：需要输入用户名和密码

**解决方法**：

#### 使用 Personal Access Token（推荐）

1. GitHub: Settings → Developer settings → Personal access tokens → Generate new token
2. 复制生成的 token
3. 推送时使用 token 作为密码

#### 使用 SSH 密钥（推荐）

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 添加到 GitHub: Settings → SSH and GPG keys → New SSH key
```

然后使用 SSH URL：

```bash
git remote set-url origin git@github.com:yourusername/schedule-reminder.git
```

### 问题 3：忘记提交某些文件

```bash
# 添加遗漏的文件
git add forgotten-file.ts

# 修改最后一次提交（不创建新提交）
git commit --amend --no-edit

# 强制推送（谨慎使用）
git push origin main --force
```

### 问题 4：提交了不应该提交的文件（如 .env）

```bash
# 从 Git 中移除文件（但保留本地文件）
git rm --cached .env

# 提交更改
git commit -m "Remove: 移除 .env 文件"

# 推送到远程
git push origin main

# 确认 .env 在 .gitignore 中
```

### 问题 5：分支名称不匹配

```bash
# 查看当前分支
git branch

# 重命名分支
git branch -M main

# 推送时指定分支
git push -u origin main
```

---

## ✅ 最佳实践

### 1. 提交前检查

```bash
# 查看将要提交的更改
git status
git diff

# 运行代码检查
npm run lint

# 测试应用
npm run dev
```

### 2. 频繁提交

- 小步提交，每次提交一个功能或修复
- 提交信息清晰明确
- 避免一次性提交大量更改

### 3. 使用分支（推荐）

```bash
# 创建新分支
git checkout -b feature/new-feature

# 在新分支上开发
# ... 进行更改 ...

# 提交更改
git add .
git commit -m "Add: 新功能"

# 切换回主分支
git checkout main

# 合并分支
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

### 4. 忽略文件

确保 `.gitignore` 包含：

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.vs/
```

### 5. 定期同步

```bash
# 定期拉取远程更改
git pull origin main

# 推送本地更改
git push origin main
```

---

## 📚 常用 Git 命令速查

```bash
# 初始化仓库
git init

# 查看状态
git status

# 添加文件
git add .
git add <file>

# 提交更改
git commit -m "提交信息"

# 查看提交历史
git log
git log --oneline

# 连接远程仓库
git remote add origin <url>

# 推送到远程
git push origin main

# 拉取远程更改
git pull origin main

# 查看远程仓库
git remote -v

# 创建分支
git checkout -b <branch-name>

# 切换分支
git checkout <branch-name>

# 合并分支
git merge <branch-name>

# 查看差异
git diff
```

---

## 🎯 完整示例

### 首次上传完整流程

```bash
# 1. 进入项目目录
cd schedule-reminder

# 2. 初始化 Git
git init

# 3. 添加所有文件
git add .

# 4. 首次提交
git commit -m "Initial commit: ProjectFlow 团队项目管理系统"

# 5. 添加远程仓库（替换为您的 URL）
git remote add origin https://github.com/yourusername/schedule-reminder.git

# 6. 设置主分支
git branch -M main

# 7. 推送到远程
git push -u origin main
```

### 日常更新流程

```bash
# 1. 查看更改
git status

# 2. 添加更改
git add .

# 3. 提交更改
git commit -m "Update: 更新功能说明"

# 4. 推送到远程
git push origin main
```

---

## 🔗 相关资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 帮助文档](https://docs.github.com/)
- [GitLab 文档](https://docs.gitlab.com/)
- [Git 教程 - 菜鸟教程](https://www.runoob.com/git/git-tutorial.html)

---

## 💡 提示

1. **首次推送可能需要身份验证**：使用 Personal Access Token 或 SSH 密钥
2. **大文件上传**：如果文件很大，考虑使用 Git LFS
3. **私有仓库**：敏感信息使用私有仓库
4. **备份重要数据**：定期备份，不要只依赖远程仓库

---

**祝您使用愉快！** 🎉

如有问题，请查看 [常见问题](#常见问题) 或提交 Issue。
