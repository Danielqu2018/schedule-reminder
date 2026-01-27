# 开发服务器启动指南

## 问题排查

如果遇到 "ERR_CONNECTION_REFUSED" 错误，请按以下步骤排查：

### 1. 确认服务器已启动

在终端运行：
```bash
npm run dev
```

你应该看到类似输出：
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 2. 检查访问地址

Vite 默认端口是 **5173**，不是 3000！

请访问：
- http://localhost:5173
- 或 http://127.0.0.1:5173

### 3. 如果端口被占用

如果 5173 端口被占用，Vite 会自动使用下一个可用端口（如 5174）。

查看终端输出确认实际端口号。

### 4. 手动指定端口

如果想使用 3000 端口，确保没有其他程序占用：

```bash
# Windows PowerShell
netstat -ano | findstr :3000

# 如果端口被占用，终止进程或修改 vite.config.ts
```

### 5. 检查防火墙

确保防火墙允许本地连接。

### 6. 清除缓存重新启动

```bash
# 删除 node_modules/.vite 缓存
rm -rf node_modules/.vite

# 重新启动
npm run dev
```

## 快速测试

1. 打开终端，进入项目目录
2. 运行 `npm run dev`
3. 查看终端输出的实际端口号
4. 在浏览器访问显示的地址

## 常见问题

### 问题1：端口3000被占用
**解决**：Vite 默认使用 5173，或修改 `vite.config.ts` 中的端口配置

### 问题2：编译错误
**解决**：检查终端是否有 TypeScript 或 ESLint 错误

### 问题3：浏览器无法连接
**解决**：
- 确认服务器正在运行（查看终端）
- 使用正确的端口号（查看终端输出）
- 尝试使用 127.0.0.1 而不是 localhost
