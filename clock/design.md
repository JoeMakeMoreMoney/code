# 番茄钟 macOS 应用设计文档

## 1. 项目概述

- **项目名称**: 番茄钟 (PomodoroClock)
- **Bundle Identifier**: com.pomodoro.clock
- **核心功能**: 番茄工作法计时器，支持工作/休息轮换、通知提醒、菜单栏显示
- **目标用户**: 追求高效工作的 macOS 用户
- **最低系统版本**: macOS 12.0+

## 2. 需求说明

### 2.1 功能需求

| 功能 | 描述 |
|------|------|
| 番茄计时 | 25分钟工作 → 5分钟短休息 → 循环4次后15分钟长休息 |
| 开始/暂停 | 一键控制计时器运行状态 |
| 重置 | 将当前会话重置到初始时间 |
| 跳过 | 跳过当前会话，进入下一个 |
| 通知提醒 | 会话结束时发送系统通知 |
| 菜单栏显示 | 显示剩余时间，支持菜单操作 |
| 全局快捷键 | 空格=开始/暂停，R=重置，S=跳过 |
| 设置面板 | 可调整工作/休息时长、开关声音 |

### 2.2 UI/UX 需求

- 圆形进度环显示剩余时间比例
- 大号数字显示 MM:SS 格式时间
- 当前会话类型标签（工作/短休息/长休息）
- 会话计数器（第 X 轮，共 4 轮）
- 三个控制按钮：重置、开始/暂停、跳过
- 设置窗口：时长调节、声音开关

### 2.3 视觉规范

| 元素 | 规范 |
|------|------|
| 工作颜色 | #E74C3C (番茄红) |
| 短休息颜色 | #27AE60 (绿色) |
| 长休息颜色 | #3498DB (蓝色) |
| 计时器字体 | SF Pro Rounded, 72pt, Bold |
| 标签字体 | SF Pro Text, 18pt, Medium |
| 窗口最小尺寸 | 340 x 480 pt |

## 3. 功能模块

### 3.1 模块架构 (MVVM)

```
┌─────────────────────────────────────────────────────────┐
│                        Views                             │
│  ContentView  │  TimerRingView  │  ControlButtonsView  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     ViewModels                           │
│                    TimerViewModel                        │
│  - 时间状态管理  - 计时逻辑  - 会话切换  - 设置持久化   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       Models                             │
│           SessionType  │  TimerState                      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 核心模块说明

| 模块 | 文件 | 职责 |
|------|------|------|
| SessionType | `Sources/Models/SessionType.swift` | 枚举定义工作/短休息/长休息，含默认时长和颜色 |
| TimerState | `Sources/Models/TimerState.swift` | 枚举定义 idle/running/paused/completed |
| TimerViewModel | `Sources/ViewModels/TimerViewModel.swift` | 计时逻辑核心，状态管理，通知发送 |
| ContentView | `Sources/Views/ContentView.swift` | 主界面，包含设置弹窗 |
| TimerRingView | `Sources/Views/TimerRingView.swift` | 圆形进度环组件 |
| ControlButtonsView | `Sources/Views/ControlButtonsView.swift` | 三个控制按钮 |
| AppDelegate | `Sources/App/AppDelegate.swift` | 应用生命周期，菜单栏，窗口管理 |
| NotificationManager | `Sources/Utilities/NotificationManager.swift` | 通知管理（已弃用，功能合并到 ViewModel） |

## 4. 流程说明

### 4.1 应用启动流程

```
main.swift
    │
    ▼
NSApplication.shared.run()
    │
    ▼
AppDelegate.applicationDidFinishLaunching()
    │
    ├──► setupWindow()      创建窗口，初始化 ViewModel
    ├──► setupMenuBar()     创建菜单栏项，注册通知观察者
    └──► setupGlobalShortcuts()  注册全局键盘监听
```

### 4.2 计时器工作流程

```
用户点击开始/空格键
    │
    ▼
TimerViewModel.toggleTimer()
    │
    ├──► timerState == .idle/.paused ──► startTimer()
    │                                           │
    │                                           ▼
    │                                    Timer.scheduledTimer
    │                                           │
    │                                           ▼
    │                                    每秒触发 tick()
    │                                           │
    │                                           ▼
    │                                    timeRemaining -= 1
    │                                           │
    │                               ┌──────────┴──────────┐
    │                               ▼                     ▼
    │                         timeRemaining > 0      timeRemaining == 0
    │                               │                     │
    │                               │                     ▼
    │                               │              completeSession()
    │                               │                     │
    │                               │                     ├──► 发送通知
    │                               │                     ├──► 播放声音
    │                               │                     ├──► 完成工作计数
    │                               │                     └──► 切换下一会话
    │                               │
    └──► timerState == .running ──► pauseTimer()
```

### 4.3 会话切换流程

```
工作会话完成
    │
    ▼
completedSessions += 1
    │
    ▼
completedSessions % 4 == 0 ?
    │
    ├──► 是 ──► 进入长休息 (15分钟)
    │
    └──► 否 ──► 进入短休息 (5分钟)

短/长休息完成
    │
    ▼
进入工作会话 (25分钟)
```

## 5. 文件结构

```
番茄钟/
├── Sources/
│   ├── App/
│   │   ├── main.swift              # 应用入口，不使用 @main
│   │   └── AppDelegate.swift        # 应用代理，管理窗口和菜单栏
│   ├── Models/
│   │   ├── SessionType.swift        # 会话类型枚举
│   │   └── TimerState.swift         # 计时器状态枚举
│   ├── ViewModels/
│   │   └── TimerViewModel.swift     # 计时逻辑核心 ViewModel
│   ├── Views/
│   │   ├── ContentView.swift        # 主界面视图 + 设置视图
│   │   ├── TimerRingView.swift      # 圆形进度环组件
│   │   └── ControlButtonsView.swift # 控制按钮组件
│   └── Utilities/
│       └── NotificationManager.swift # 通知管理器（保留接口）
├── Resources/
│   ├── Info.plist                   # 应用配置信息
│   ├── PomodoroClock.entitlements   # 权限配置
│   └── Assets.xcassets/
│       └── AppIcon.appiconset/      # 应用图标
├── project.yml                      # XcodeGen 项目配置
├── SPEC.md                          # 需求规格说明
└── design.md                        # 本文档
```

## 6. 数据持久化

使用 `UserDefaults` 存储用户设置：

| Key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| workDuration | Int | 25 | 工作时长（分钟） |
| shortBreakDuration | Int | 5 | 短休息时长（分钟） |
| longBreakDuration | Int | 15 | 长休息时长（分钟） |
| soundEnabled | Bool | true | 是否启用声音 |

## 7. 通知系统

使用 `UserNotifications` framework（NSUserNotification 已弃用）：

```swift
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }

// 发送通知
let content = UNMutableNotificationContent()
content.title = "番茄钟"
content.body = "\(currentSession.rawValue) 完成！"
content.sound = .default

let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
UNUserNotificationCenter.current().add(request)
```

## 8. 全局快捷键

通过 `NSEvent` 监控键盘事件（无需特殊权限）：

| 按键 | KeyCode | 功能 |
|------|---------|------|
| 空格 | 49 | 开始/暂停 |
| R | 15 | 重置 |
| S | 1 | 跳过 |

## 9. 构建说明

### 9.1 环境要求

- Xcode 15.0+
- XcodeGen (`brew install xcodegen`)
- macOS 12.0+ SDK

### 9.2 构建步骤

```bash
# 1. 清理旧的构建产物
rm -rf ~/Library/Developer/Xcode/DerivedData/番茄钟-*

# 2. 生成 Xcode 项目
xcodegen generate

# 3. 构建项目
xcodebuild -project 番茄钟.xcodeproj -scheme 番茄钟 -configuration Debug build

# 4. 构建产物位置
~/Library/Developer/Xcode/DerivedData/番茄钟-*/Build/Products/Debug/番茄钟.app
```

### 9.3 安装到 Applications

```bash
cp -R ~/Library/Developer/Xcode/DerivedData/番茄钟-*/Build/Products/Debug/番茄钟.app /Applications/
```

## 10. 测试验证

### 10.1 功能测试清单

| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 应用启动 | 窗口正常显示，计时器显示 25:00 | 启动应用观察 |
| 开始计时 | 计时器倒计时，每秒减少 | 点击开始按钮 |
| 暂停计时 | 计时器停止 | 点击暂停按钮 |
| 重置计时 | 回到当前会话初始时间 | 点击重置按钮 |
| 跳过会话 | 切换到下一会话类型 | 点击跳过按钮 |
| 会话完成 | 显示通知，切换下一会话 | 等待计时结束 |
| 4轮循环 | 第4轮工作后进入长休息 | 完成4个工作轮 |
| 设置生效 | 修改后空闲时时间更新 | 调整设置并重置 |
| 菜单栏 | 显示剩余时间 | 观察菜单栏 |
| 全局快捷键 | 后台运行时快捷键生效 | 切换到其他应用测试 |

### 10.2 界面文字验证

- [ ] 主界面显示"工作"、"短休息"、"长休息"
- [ ] 会话计数显示"第 X 轮，共 4 轮"
- [ ] 设置面板所有文字为中文
- [ ] 菜单项全部为中文
- [ ] 快捷键提示为中文

### 10.3 图标验证

- [ ] 应用图标显示为番茄时钟图案
- [ ] 菜单栏显示正常尺寸图标

## 11. 技术要点

### 11.1 不使用 @main

应用入口使用传统方式：

```swift
// main.swift
import AppKit
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
```

### 11.2 SwiftUI 与 AppKit 混用

主窗口使用 SwiftUI，通过 `NSHostingView` 嵌入：

```swift
window?.contentView = NSHostingView(rootView: contentView)
```

### 11.3 非沙盒应用

`entitlements` 中 `com.apple.security.app-sandbox` 设置为 `false`，以便全局快捷键正常工作。

### 11.4 辅助功能模式

`NSApp.setActivationPolicy(.accessory)` 使应用作为辅助工具运行，不在 Dock 中显示图标。
