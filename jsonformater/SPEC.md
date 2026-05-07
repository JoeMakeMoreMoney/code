# JSON Formator - Specification

## 1. Project Overview

- **Project Name**: JSON Formator
- **Type**: Desktop GUI Application
- **Core Functionality**: A macOS desktop tool for importing, validating, formatting, and exporting JSON files with intuitive error feedback.
- **Target Users**: Developers and anyone working with JSON data on macOS.

## 2. Technology Stack

- **Framework**: Electron (latest stable)
- **Frontend**: HTML/CSS/JavaScript (vanilla for simplicity)
- **Build Tool**: electron-builder for macOS packaging

## 3. UI/UX Specification

### 3.1 Window Configuration
- Default size: 900×700 pixels
- Minimum size: 700×500 pixels
- Native macOS window frame (standard title bar with close/minimize/zoom buttons)
- Single-window application

### 3.2 Layout Structure
```
┌──────────────────────────────────────────────────────────────┐
│  [Title Bar - Native macOS]                                  │
├──────────────────────────────────────────────────────────────┤
│  Header Area (logo + title)                                  │
├──────────────────────────────────────────────────────────────┤
│  File Path Section                                            │
│  ┌────────────────────────────────────────┐ ┌─────────────┐  │
│  │ Path Input TextField                    │ │ Browse Btn  │  │
│  └────────────────────────────────────────┘ └─────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  Action Buttons Bar                                           │
│  [Import] [Validate] [Format] [Export]                       │
├──────────────────────────────────────────────────────────────┤
│  JSON Content Area (Editor)                                  │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  Text Editor (monospace font, line numbers)             ││
│  │  - Syntax error highlighting                            ││
│  │  - Line/column indicator                                 ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│  Status Bar                                                   │
│  [Error Panel - shows validation errors when present]       │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Visual Design

**Color Palette**:
- Background: #1E1E1E (dark editor background)
- Surface: #252526 (panels, buttons background)
- Primary: #0078D4 (macOS blue - actions)
- Success: #4CAF50 (valid JSON)
- Error: #F44336 (error highlight)
- Warning: #FF9800 (warning)
- Text Primary: #D4D4D4 (light gray)
- Text Secondary: #808080 (muted)
- Border: #3C3C3C

**Typography**:
- UI Font: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Editor Font: "SF Mono", "Monaco", "Menlo", monospace, 14px
- Header Title: 24px, font-weight 600
- Button Text: 13px, font-weight 500

**Spacing**:
- Base unit: 8px
- Content padding: 16px
- Button padding: 8px 16px
- Section gap: 16px

**Visual Effects**:
- Button hover: brightness increase 10%
- Button active: brightness decrease 5%
- Input focus: 2px #0078D4 border
- Error line highlight: semi-transparent red background (#F4433620)
- Smooth transitions: 150ms ease

### 3.4 Components

**File Path Input**:
- Full-width text field
- Placeholder: "Enter JSON file path or click Browse..."
- States: default, focused, filled

**Browse Button**:
- Label: "Browse..."
- Opens native macOS file dialog (.json filter)
- After selection, populates path input

**Action Buttons**:
- Import: Loads JSON file content into editor
- Validate: Checks JSON syntax, highlights errors
- Format: Validates first, then formats if valid
- Export: Saves editor content to file

**JSON Editor**:
- Monospace font with line numbers
- Dark theme matching VS Code aesthetic
- Error line highlighting with gutter indicator
- Scrollable for large files

**Status/Error Panel**:
- Fixed height: 80px
- Shows error message, line/column, suggested fix
- Scrollable for multiple errors
- Hidden when no errors

## 4. Functional Specification

### 4.1 Core Features

**F1: File Selection**
- Browse button opens macOS native file dialog
- Filter: *.json files
- Selected path populates the text input
- User can manually edit the path input
- Path input accepts drag-and-drop of .json files

**F2: Import JSON**
- Reads file from specified path
- Displays content in editor
- If file read fails, show error alert
- Supports UTF-8 encoded files

**F3: Validate JSON**
- Parses JSON content
- On error: highlights error location in editor, shows error details in status panel
  - Error details include: line number, column, error message, suggested fix
- On success: shows success notification (non-blocking)

**F4: Format JSON**
- If JSON is invalid: same behavior as Validate
- If JSON is valid: pretty-prints with 2-space indentation
- Replaces editor content with formatted JSON
- Shows success notification

**F5: Export JSON**
- If file path exists: saves to that path
- If no path: defaults to home directory
- Shows save dialog if no path or user wants to change location
- Success notification after save

### 4.2 User Interactions & Flows

**Flow 1: Open and Format**
1. User clicks Browse → selects file → path appears in input
2. User clicks Import → content appears in editor
3. User clicks Format → content is formatted (if valid)
4. User clicks Export → file is saved

**Flow 2: Direct Edit**
1. User drags .json file onto window OR enters path manually
2. User clicks Import
3. User edits content in editor
4. User clicks Validate to check syntax
5. User clicks Format if valid

### 4.3 Data Flow
```
User Action → IPC (Renderer→Main) → File System/API → IPC (Main→Renderer) → UI Update
```

### 4.4 Key Modules

**Main Process (main.js)**:
- Window management
- File system operations (read/write JSON files)
- Native dialog integration
- IPC handlers

**Renderer Process (renderer.js)**:
- UI state management
- JSON parsing/validation/formatting
- Error highlighting logic
- Event handlers

**Preload (preload.js)**:
- Secure IPC bridge between main and renderer

### 4.5 Edge Cases

- Empty file: show warning, load empty content
- Very large file (>10MB): show loading indicator
- Binary/non-text file: show error on import
- File permission denied: show specific error message
- Invalid JSON with special characters: ensure error position is accurate
- Unsaved changes on close: no prompt (keep it simple)

## 5. Acceptance Criteria

- [ ] Application launches on macOS without errors
- [ ] Browse button opens native file picker, filters .json files
- [ ] Import button loads file content into editor
- [ ] Validate button correctly identifies JSON syntax errors
- [ ] Error location is highlighted in editor with red background
- [ ] Error panel shows line, column, message, and fix suggestion
- [ ] Format button prettifies valid JSON with 2-space indent
- [ ] Export button saves content to file system
- [ ] Default export path is original import path or home directory
- [ ] UI follows dark theme color specification
- [ ] Window is resizable with minimum size constraint