# NERV 系统监控器 (evamonitor)

## 项目概述

NERV 系统监控器是一个基于网页的系统监控面板，采用动漫《新世纪福音战士》EVA/NERV 视觉主题。它以科幻终端界面的形式实时显示系统指标，包括 CPU 使用率、内存消耗、网络速度、电池状态和运行时间。

该应用使用 React 和 TypeScript 构建，采用 Vite 作为构建工具，具有以下特点：
- 暗色美学配合多色状态指示器（绿色=正常、橙色=警告、红色=危险、青色=次要信息）
- 使用浏览器 Performance API 进行实时系统监控
- **数字滚动动画** - 数字变化时平滑过渡，带闪光效果
- **扫描线效果** - 复古 CRT 显示器风格的扫描线动画
- **面板发光效果** - 动态边框发光，根据状态变化颜色
- **紧急模式** - 高负载时触发红色警告闪烁
- 日语语音播报使用 Web Speech API (TTS)
- 背景音乐支持及音频控制
- 响应式设计，适配移动端和桌面端

## 技术栈

- **前端框架**: React 19.2.0 + TypeScript 5.9.3
- **构建工具**: Vite 7.2.4
- **样式**: Tailwind CSS 3.4.19 + 自定义 NERV 主题
- **UI 组件**: shadcn/ui (50+ 组件) + Radix UI 基础组件
- **图标**: Lucide React
- **图表**: Recharts
- **字体**: Share Tech Mono, Noto Sans JP (Google Fonts)
- **表单处理**: React Hook Form + Zod 验证

## 项目结构

```
app/
├── index.html              # 入口 HTML 文件
├── package.json            # 依赖和脚本
├── vite.config.ts          # Vite 构建配置 (base: './' 使用相对路径)
├── tailwind.config.js      # Tailwind CSS 主题配置
├── components.json         # shadcn/ui 配置
├── eslint.config.js        # ESLint 代码规范
├── tsconfig.json           # TypeScript 基础配置 (项目引用)
├── tsconfig.app.json       # TypeScript 应用配置
├── tsconfig.node.json      # TypeScript Node 配置
├── postcss.config.js       # PostCSS 配置
├── src/
│   ├── main.tsx            # 应用入口点
│   ├── App.tsx             # 根组件，包含仪表板布局
│   ├── App.css             # 组件特定样式 + 动画效果
│   ├── index.css           # 全局样式，包含 NERV 主题和动画
│   ├── components/
│   │   ├── ui/             # shadcn/ui 基础组件 (50+ 组件)
│   │   │   ├── button.tsx, card.tsx, chart.tsx, dialog.tsx
│   │   │   └── ... (手风琴、警告、日历、表单等)
│   │   └── nerv/           # 自定义 NERV 主题监控组件
│   │       ├── NERVHeader.tsx      # 头部，显示同步率和 MAGI 状态
│   │       ├── CPUMonitor.tsx      # CPU 使用率，带六边形指示器
│   │       ├── MemoryMonitor.tsx   # 内存使用率可视化
│   │       ├── NetworkMonitor.tsx  # 网络速度图表和指标
│   │       ├── SystemStatus.tsx    # 电池、运行时间、时间显示
│   │       ├── LogTerminal.tsx     # 终端风格的系统日志
│   │       ├── CircularGauge.tsx   # 圆形仪表盘
│   │       ├── AnimatedNumber.tsx  # 数字滚动动画组件 ✨
│   │       ├── ScanlineEffect.tsx  # 扫描线效果组件 ✨
│   │       ├── AudioControl.tsx    # BGM 和语音设置面板
│   │       ├── BarVisualizer.tsx   # 音频风格条形可视化
│   │       ├── Oscilloscope.tsx    # 波形示波器显示
│   │       ├── RadarScanner.tsx    # 动画雷达扫描器
│   │       └── SpectrumAnalyzer.tsx # 频谱分析器
│   ├── hooks/
│   │   ├── useSystemInfo.ts        # 主要系统指标 Hook
│   │   ├── useAudioSystem.ts       # 音频/BGM/语音播报 Hook ✨
│   │   └── use-mobile.ts           # 移动设备检测
│   └── lib/
│       └── utils.ts                # 工具函数 (cn 辅助函数)
├── public/                 # 静态资源 (BGM 文件、图片)
│   └── README-AUDIO.md     # 音频系统使用说明
└── dist/                   # 构建输出目录
```

## 构建和开发命令

```bash
# 进入应用目录
cd app

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行 ESLint
npm run lint
```

开发服务器运行在 Vite 默认端口（通常是 5173）。生产构建输出到 `dist/` 目录，配置了相对路径（`vite.config.ts` 中的 `base: './'`）。

## 代码风格指南

### TypeScript 规范
- 使用严格 TypeScript，组件 props 添加类型注解
- 优先使用 `FC` 类型的函数组件：`const Component: FC<Props> = () => {...}`
- 在同一文件中定义 props 接口
- 使用 `@/` 路径别名导入 `src/` 下的模块
- 路径别名在 `tsconfig.json` 和 `vite.config.ts` 中配置

### 组件结构
- `src/components/ui/` 中的 UI 组件遵循 shadcn/ui 模式，使用 CVA (class-variance-authority)
- `src/components/nerv/` 中的 NERV 组件使用科幻美学，动态颜色使用内联样式
- 组件使用 Tailwind 类进行布局，使用自定义 CSS 变量定义 NERV 颜色

### 样式规范

**NERV 调色板**（定义在 `index.css`）：
| 颜色 | 十六进制 | 用途 |
|------|----------|------|
| `--nerv-green` | #00ff00 | 正常/健康状态 |
| `--nerv-orange` | #ff8800 | 警告状态 |
| `--nerv-red` | #ff0044 | 危险/紧急状态 |
| `--nerv-cyan` | #00ffff | 次要信息/强调 |
| `--nerv-yellow` | #ffff00 | 高亮 |
| `--nerv-purple` | #ff00ff | 特殊指示器 |
| `--nerv-dark` | #0a0a0a | 背景色 |

**CSS 动画类**（定义在 `App.css`）：
| 类名 | 效果 |
|------|------|
| `glow-text` | 标准文字发光 |
| `glow-text-intense` | 强烈发光（用于重要数字）|
| `glow-text-red` | 红色警告发光 |
| `glow-text-cyan` | 青色发光 |
| `panel-glow` | 面板绿色发光边框 |
| `panel-glow-orange` | 面板橙色发光 |
| `panel-glow-red` | 面板红色发光 |
| `number-flash` | 数字变化闪光动画 |
| `value-pulse` | 数值脉冲闪烁 |
| `emergency-border-flash` | 紧急边框闪烁 |
| `emergency-pulse` | 红色覆盖层脉冲 |
| `scanline` | 移动扫描线效果 |
| `grid-bg` | 脉冲网格背景 |
| `glitch-effect` | 故障抖动效果 |
| `hazard-stripes` | 危险条纹背景 |

**状态颜色阈值**：
- 绿色 < 50% < 橙色 < 80% < 红色

### 命名规范
- 组件文件和导出使用 PascalCase（如 `CPUMonitor.tsx`）
- hooks、工具函数和变量使用 camelCase
- NERV 主题上下文中的常量使用 UPPER_CASE

## 关键架构细节

### 系统信息 Hook (`useSystemInfo.ts`)
仪表板的主要数据源。使用浏览器 API 收集实时数据：

- **CPU 使用率**: 使用 `requestIdleCallback` 定时和帧率分析估算
- **内存**: 使用 `performance.memory` API（仅限 Chrome/Chromium）
- **网络**: 使用 Network Information API (`navigator.connection`) 和 Performance API
- **电池**: 使用 Battery API (`navigator.getBattery()`)（如可用）
- **运行时间**: 从页面加载时间计算

**更新间隔**: 默认 1000ms，可通过参数配置。

**导出的工具函数**：
- `formatBytes(bytes, decimals)` - 将字节格式化为人类可读格式
- `formatSpeed(bytesPerSecond)` - 格式化速度，带 /s 后缀
- `formatUptime(seconds)` - 将秒格式化为 HH:MM:SS

### 音频系统 Hook (`useAudioSystem.ts`)
管理背景音乐和日语语音播报：

- **BGM**: HTML5 Audio 元素，支持循环
- **语音**: Web Speech API (TTS)，使用日语女声
- **状态报告**: 每 15 秒自动生成日语播报
- **数字转换**: 将数字转换为日语读法（ゼロ、イチ、ニ、サン...）

**语音特征**：
- 语言: 日语 (ja-JP)
- 语速: 1.1x（稍快）
- 音调: 1.2x（稍高）
- 优先使用日语女声（如可用）

### 数字动画组件 (`AnimatedNumber.tsx`)
参考赛车仪表盘效果设计的数字显示组件：

**特性**：
- 数字变化时平滑滚动过渡（ease-out 缓动）
- 变化瞬间触发闪光动画（亮度+缩放）
- 高阈值时自动脉冲闪烁
- 支持自定义发光颜色

**Props**：
```typescript
interface AnimatedNumberProps {
  value: number;           // 目标数值
  decimals?: number;       // 小数位数
  duration?: number;       // 动画持续时间(ms)
  className?: string;      // 额外类名
  suffix?: string;         // 后缀（如 '%'）
  prefix?: string;         // 前缀
  glowColor?: string;      // 发光颜色
  intense?: boolean;       // 是否强烈发光
  pulseOnHigh?: boolean;   // 高值时是否脉冲
  highThreshold?: number;  // 高值阈值
}
```

### 扫描线效果组件 (`ScanlineEffect.tsx`)
模拟复古 CRT 显示器的扫描线效果：

- 移动的水平扫描线
- 静态扫描线覆盖层
- 根据系统状态切换颜色（正常=青色，紧急=红色）

### 仪表板布局 (`App.tsx`)
主仪表板使用响应式 CSS Grid：

**桌面端 (md:+)**：
- 第 1 行: CPU 监控 | 内存监控 | 系统状态（3 列）
- 第 2 行: 4 个仪表盘 | 网络监控（2 列）| 日志终端（4 列）

**移动端**：
- 单列布局，调整高度
- 简化的头部指示器
- 针对小屏幕的网格调整

**紧急模式**：
当 CPU > 80% 或内存 > 85% 时触发：
- 背景变为红色调
- 扫描线变为红色
- 红色覆盖层脉冲动画

**同步率计算公式**：
```
syncRate = 100 - (cpuUsage * 0.3 + memoryUsage * 0.3)
```

### 使用的浏览器 API
| API | 用途 | 浏览器支持 |
|-----|------|------------|
| `navigator.hardwareConcurrency` | CPU 核心数 | 所有现代浏览器 |
| `navigator.getBattery()` | 电池状态 | Chrome, Edge |
| `performance.memory` | JS 堆内存 | 仅限 Chrome |
| `navigator.connection` | 网络信息 | Chrome, Android |
| `requestIdleCallback` | CPU 估算 | Chrome, Firefox |
| `SpeechSynthesis` | 语音播报 | 所有现代浏览器 |
| `Performance API` | 资源定时 | 所有现代浏览器 |

## 动画系统

### 核心动画效果

#### 1. 数字滚动动画
使用 `requestAnimationFrame` 实现平滑的数字过渡：
```typescript
// ease-out 缓动函数
const easeOut = 1 - Math.pow(1 - progress, 3);
```

#### 2. 发光效果
多层 `text-shadow` 实现霓虹发光：
```css
glow-text-intense {
  text-shadow: 
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 40px currentColor,
    0 0 80px currentColor,
    0 0 120px currentColor;
}
```

#### 3. 扫描线动画
从上到下移动的扫描线，使用固定定位：
```css
@keyframes scanlineMove {
  0% { top: -10%; }
  100% { top: 110%; }
}
```

#### 4. 紧急模式动画
- **边框闪烁**: 红橙交替，0.15s 周期
- **覆盖层脉冲**: 透明度变化，0.5s 周期
- **危险条纹**: 45度斜条纹背景

### 性能优化
- 使用 `useMemo` 缓存条形图组件
- 动画使用 `transform` 和 `opacity`（GPU 加速）
- 扫描线使用 `pointer-events: none` 避免阻塞交互
- 使用 `requestAnimationFrame` 实现平滑数字动画

## 音频系统设置

### 添加背景音乐
1. 将 MP3 文件放入 `app/public/` 目录
2. 命名为 `bgm.mp3`
3. 通过设置面板（右下角）切换 BGM

### 语音播报
- 每 15 秒自动播报日语语音报告
- 播报 CPU、内存、电池和同步率状态
- 使用浏览器内置 TTS 引擎
- 语音质量因操作系统而异（Windows/Mac 有不同的语音包）

详细音频设置说明请参见 `public/README-AUDIO.md`。

## 测试

目前没有配置自动化测试框架。手动测试方法：

```bash
# 启动开发服务器
npm run dev

# 然后在浏览器中测试：
# - 检查不同屏幕尺寸下的响应式布局
# - 验证动画效果（数字变化、扫描线、发光）
# - 测试紧急模式（运行 CPU 密集型任务使使用率 > 80%）
# - 验证音频控制是否工作（需要先用户交互）
# - 使用 Chrome 获得完整的 API 支持（电池、内存）
# - 使用 DevTools Performance 选项卡验证 CPU 估算
```

**浏览器兼容性说明**：
- Battery API: 仅限 Chrome/Edge（需要 HTTPS 或 localhost）
- Memory API: 仅限 Chrome
- 动画效果: 所有现代浏览器
- 完整体验: 使用基于 Chromium 的浏览器

## 安全考虑

- 应用仅访问浏览器提供的 API
- 不收集或传输用户数据到外部
- 所有系统指标均为只读
- Battery API 需要安全上下文（HTTPS 或 localhost）
- 由于自动播放策略，音频需要用户交互

## 部署

该应用是可部署到任何静态托管服务的静态 Web 应用：

```bash
cd app
npm run build
# 部署 dist/ 文件夹内容
```

**重要**：`vite.config.ts` 中的 `base: './'` 配置确保相对路径在任何域名/子目录下都能正常工作。

## 添加新组件

### 添加 shadcn/ui 组件：
```bash
cd app
npx shadcn add <组件名称>
```

### 添加 NERV 主题组件：
1. 在 `src/components/nerv/` 中创建文件
2. 使用现有组件作为模板（如 `CPUMonitor.tsx`）
3. 遵循配色方案：根据状态阈值使用绿色/橙色/红色
4. 使用 `nerv-panel` 和 `nerv-corner` 类
5. 使用 `AnimatedNumber` 显示数值
6. 导入并添加到 `App.tsx`

## 参考资源

### 赛车仪表盘效果参考
项目参考了 `cool/` 目录中的赛车仪表盘设计：
- 数字滚动动画效果
- 扫描线效果
- 发光文字效果
- 紧急模式闪烁
- 网格背景动画

### 关键依赖

| 包 | 用途 |
|----|------|
| `react` / `react-dom` | UI 框架 |
| `@radix-ui/*` | 无头 UI 基础组件 |
| `recharts` | 数据可视化图表 |
| `lucide-react` | 图标库 |
| `class-variance-authority` | 组件变体管理 |
| `tailwind-merge` + `clsx` | 条件类名合并 |
| `zod` | 模式验证 |
| `react-hook-form` | 表单处理 |
| `kimi-plugin-inspect-react` | 开发检查工具 |

## 开发笔记

- 项目使用 ES 模块（package.json 中的 `"type": "module"`）
- TypeScript 使用项目引用以获得更好的构建性能
- ESLint 配置了 React Hooks 和 Refresh 插件
- Tailwind 使用在 `tailwind.config.js` 中定义的自定义动画
- 全局动画和关键帧在 `index.css` 和 `App.css` 中
- 数字动画使用 `requestAnimationFrame` 确保流畅
- 扫描线效果使用固定定位避免影响布局
