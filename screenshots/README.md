# Screenshots 说明

## 如何生成项目截图

### 1. 正常模式截图 (normal.png)
- 启动开发服务器: `npm run dev`
- 打开 `http://localhost:5173`
- 等待系统稳定（CPU/内存使用率正常）
- 使用浏览器截图或系统截图工具
- 推荐尺寸: 1920x1080

### 2. 警告模式截图 (warning.png)
- 运行一些程序使 CPU 使用率达到 50-80%
- 截图显示橙色警告状态

### 3. 紧急模式截图 (emergency.png)
- 运行 CPU 密集型任务（如视频渲染、编译）
- 使 CPU 使用率 > 80%
- 截图显示红色紧急状态、闪烁边框

### 4. 主题展示截图 (themes.png)
- 点击右下角调色盘按钮
- 分别切换到三种主题后截图
- 可拼接成一张展示图

## 推荐截图工具

- **Mac**: Cmd + Shift + 5 (系统自带)
- **Windows**: Win + Shift + S (系统自带)
- **浏览器**: Chrome DevTools → Capture screenshot

## GIF 录制

使用以下工具录制动态 GIF：
- **Mac**: LICEcap, Giphy Capture
- **Windows**: ScreenToGif, ShareX
- **在线**: ezgif.com (转换视频为 GIF)

## 录制内容建议

1. **数字滚动动画** - 录制数字变化时的平滑过渡
2. **扫描线效果** - 展示从上到下移动的扫描线
3. **主题切换** - 录制切换三个主题的过程
4. **紧急模式触发** - 录制从高负载到红色警告的过程
