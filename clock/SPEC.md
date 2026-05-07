# 番茄钟 - Pomodoro Timer for macOS

## 1. Project Overview

- **Project Name**: PomodoroClock
- **Bundle Identifier**: com.pomodoro.clock
- **Core Functionality**: A Pomodoro timer app with work/break intervals, notifications, and menubar support
- **Target Users**: Productivity-focused users on macOS
- **macOS Version Support**: macOS 12.0+

## 2. UI/UX Specification

### Window Structure
- Single main window (non-resizable)
- Menu bar extra for quick access and status display
- Notification alerts for timer completion

### Visual Design

**Color Palette**
- Primary (Work): #E74C3C (Tomato Red)
- Secondary (Break): #27AE60 (Green)
- Long Break: #3498DB (Blue)
- Background: System background (adaptive light/dark)
- Text Primary: System label color
- Text Secondary: System secondary label color

**Typography**
- Timer Display: SF Pro Rounded, 72pt, Bold
- Labels: SF Pro Text, 18pt, Medium
- Buttons: SF Pro Text, 14pt, Regular

**Spacing**
- Window padding: 40pt
- Element spacing: 24pt
- Button padding: 16pt horizontal, 12pt vertical

### Views & Components

1. **Main Window**
   - Circular progress ring showing time remaining
   - Large timer display (MM:SS format)
   - Current session label (Work/Short Break/Long Break)
   - Session counter (e.g., "Session 2 of 4")
   - Control buttons: Start, Pause, Reset, Skip

2. **Timer States**
   - Idle: Timer shows default (25:00), Start enabled
   - Running: Countdown active, Pause visible
   - Paused: Timer frozen, Resume visible
   - Completed: Notification, auto-advance to next session

3. **Settings (in preferences)**
   - Work duration: 25 minutes (default)
   - Short break: 5 minutes (default)
   - Long break: 15 minutes (default)
   - Sessions before long break: 4 (default)
   - Sound on/off toggle

## 3. Functionality Specification

### Core Features
- Standard Pomodoro technique timer
- Configurable work/break durations
- Automatic session cycling (work → short break → work → ... → long break)
- Desktop notifications on session complete
- Menu bar status item showing remaining time
- Keyboard shortcuts (Space: start/pause, R: reset)

### User Interactions
1. Click Start → Timer begins countdown
2. Click Pause → Timer pauses at current time
3. Click Reset → Timer resets to session default
4. Click Skip → Move to next session type
5. Timer reaches 0 → Notification + auto-advance

### Architecture Pattern
- MVVM (Model-View-ViewModel)
- Combine for reactive updates

## 4. Technical Specification

### Dependencies
- XcodeGen (for project generation)
- No third-party dependencies (pure SwiftUI/AppKit)

### UI Framework
- SwiftUI for main interface
- AppKit for menu bar integration

### Asset Requirements
- App icon (tomato themed)
- SF Symbols for buttons (play.fill, pause.fill, arrow.counterclockwise, forward.fill)

### File Structure
```
PomodoroClock/
├── Sources/
│   ├── App/
│   │   ├── main.swift
│   │   ├── PomodoroClockApp.swift
│   │   └── AppDelegate.swift
│   ├── Models/
│   │   ├── TimerState.swift
│   │   └── SessionType.swift
│   ├── ViewModels/
│   │   └── TimerViewModel.swift
│   ├── Views/
│   │   ├── ContentView.swift
│   │   ├── TimerRingView.swift
│   │   └── ControlButtonsView.swift
│   └── Utilities/
│       └── NotificationManager.swift
├── Resources/
│   └── Assets.xcassets/
├── project.yml
└── SPEC.md
```