# 应用启动问题排查指南

## ✅ 当前状态

根据检查，开发服务器已经成功启动！

**访问地址**：http://localhost:3001/

**注意**：端口 3000 被占用，Vite 自动使用了端口 3001。

---

## 🔍 常见启动问题

### 问题 1：端口被占用

**现象**：
```
Port 3000 is in use, trying another one...
```

**说明**：
- Vite 会自动尝试下一个可用端口（3001, 3002...）
- 查看终端输出确认实际使用的端口号
- 使用终端显示的地址访问应用

**解决方案**：

**选项 A：使用自动分配的端口（推荐）**
- 查看终端输出，使用显示的端口号访问
- 例如：`http://localhost:3001/`

**选项 B：释放 3000 端口**
```powershell
# Windows PowerShell - 查找占用 3000 端口的进程
netstat -ano | findstr :3000

# 终止进程（替换 <PID> 为实际的进程ID）
taskkill /PID <PID> /F
```

**选项 C：修改配置文件使用其他端口**
编辑 `vite.config.ts`：
```typescript
server: {
  port: 5173,  // 改为其他端口
  open: true,
}
```

---

### 问题 2：环境变量未配置

**现象**：
- 浏览器控制台显示：`缺少 Supabase 配置！`
- 页面显示错误信息

**解决方案**：

1. **检查 .env 文件是否存在**
   ```powershell
   # 在项目根目录检查
   Test-Path .env
   ```

2. **如果不存在，创建 .env 文件**
   ```powershell
   # 复制示例文件
   Copy-Item .env.example .env
   ```

3. **编辑 .env 文件，填入 Supabase 配置**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **重启开发服务器**
   ```powershell
   # 停止当前服务器（Ctrl+C）
   # 重新启动
   npm run dev
   ```

**获取 Supabase 配置**：
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 **Project Settings** > **API**
4. 复制 **Project URL** 和 **anon public** key

---

### 问题 3：依赖未安装

**现象**：
```
Error: Cannot find module 'xxx'
```

**解决方案**：
```powershell
# 删除 node_modules 和锁定文件
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 重新安装依赖
npm install
```

---

### 问题 4：TypeScript 编译错误

**现象**：
- 终端显示 TypeScript 错误
- 页面无法加载

**解决方案**：

1. **查看详细错误信息**
   ```powershell
   npm run lint
   ```

2. **检查 tsconfig.json 配置**
   - 确认 `include` 包含 `["src"]`
   - 确认 `compilerOptions` 配置正确

3. **修复代码错误**
   - 根据错误提示修复代码
   - 或临时禁用严格检查（不推荐）

---

### 问题 5：浏览器无法访问

**现象**：
- 服务器已启动，但浏览器无法访问
- ERR_CONNECTION_REFUSED

**解决方案**：

1. **确认服务器正在运行**
   - 查看终端是否有错误信息
   - 确认端口号正确

2. **检查防火墙**
   - Windows 防火墙可能阻止本地连接
   - 临时关闭防火墙测试

3. **尝试不同的地址**
   - `http://localhost:3001/`
   - `http://127.0.0.1:3001/`
   - `http://0.0.0.0:3001/`

4. **清除浏览器缓存**
   - 按 `Ctrl+Shift+Delete` 清除缓存
   - 或使用隐私模式访问

---

### 问题 6：页面空白

**现象**：
- 页面加载但显示空白
- 浏览器控制台有错误

**解决方案**：

1. **打开浏览器开发者工具**
   - 按 `F12` 或 `Ctrl+Shift+I`
   - 查看 **Console** 标签的错误信息

2. **检查常见错误**：
   - Supabase 配置错误
   - 网络请求失败
   - JavaScript 运行时错误

3. **检查 Network 标签**
   - 查看是否有请求失败
   - 检查 Supabase API 请求状态

---

## 🚀 快速启动检查清单

启动应用前，请确认：

- [ ] Node.js 已安装（版本 >= 18.0.0）
  ```powershell
  node --version
  ```

- [ ] 依赖已安装
  ```powershell
  Test-Path node_modules
  ```

- [ ] .env 文件已创建并配置
  ```powershell
  Test-Path .env
  ```

- [ ] Supabase 配置正确
  - VITE_SUPABASE_URL 格式正确
  - VITE_SUPABASE_ANON_KEY 已填入

- [ ] 端口可用（或使用自动分配的端口）

---

## 📝 标准启动流程

1. **打开终端，进入项目目录**
   ```powershell
   cd E:\Cursor\schedule-reminder
   ```

2. **检查环境变量**
   ```powershell
   # 确认 .env 文件存在
   Test-Path .env
   ```

3. **启动开发服务器**
   ```powershell
   npm run dev
   ```

4. **查看终端输出**
   - 确认服务器启动成功
   - 记录实际使用的端口号（如：3001）

5. **在浏览器中访问**
   - 使用终端显示的地址
   - 例如：`http://localhost:3001/`

---

## 🔧 完整重置步骤

如果以上方法都无法解决，尝试完整重置：

```powershell
# 1. 停止所有 Node 进程
Get-Process node | Stop-Process -Force

# 2. 删除依赖和缓存
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
Remove-Item -Recurse -Force node_modules\.vite

# 3. 重新安装依赖
npm install

# 4. 检查 .env 文件
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "请编辑 .env 文件，填入 Supabase 配置"
}

# 5. 启动服务器
npm run dev
```

---

## 📞 获取帮助

如果问题仍未解决：

1. **查看详细错误信息**
   - 终端输出
   - 浏览器控制台（F12）
   - 浏览器 Network 标签

2. **检查项目文档**
   - [README.md](../README.md)
   - [故障排除指南](./TROUBLESHOOTING.md)
   - [数据库设置指南](../DATABASE_SETUP.md)

3. **验证 Supabase 配置**
   - 确认项目状态为 Active
   - 检查 API 密钥是否正确
   - 验证数据库表是否已创建

---

**最后更新**：2026-01-29  
**适用版本**：v2.2.0
