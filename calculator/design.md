# 计算器设计文档

## 一、项目架构总览

```
calculator/
├── index.html        # 页面结构：标签导航 + 显示区 + 三个面板
├── styles.css        # macOS Calculator 风格样式
├── calc.js           # 核心逻辑：引擎 + UI控制器
├── test.js           # 自动化测试套件 (69项)
├── calculator.md     # 需求说明
├── test_result.md    # 测试结果记录
└── design.md         # 本文档
```

**技术栈**: 纯 HTML + CSS + JavaScript，无框架依赖，直接在浏览器中运行。

## 二、架构分层

```
┌─────────────────────────────────────┐
│         CalculatorUI                 │  ← UI控制器层
│   (标签切换 / 按钮事件 / 键盘 / 显示) │
├──────────────┬──────────────────────┤
│ Calculator   │  Programmer          │  ← 引擎层
│ Engine       │  Engine              │
│ (基础+科学)   │  (进制转换+位运算)    │
└──────────────┴──────────────────────┘
```

### 三层设计

| 层级 | 类名 | 职责 |
|------|------|------|
| **表现层** | `CalculatorUI` | DOM交互、事件分发、显示更新、键盘支持 |
| **引擎层** | `CalculatorEngine` | 基础四则运算、科学函数、表达式求值 |
| **引擎层** | `ProgrammerEngine` | 进制转换、位运算、多进制显示 |

UI层不直接操作DOM写逻辑，而是通过引擎层计算后更新显示。引擎层纯数学运算，不依赖DOM。

## 三、功能模块说明

### 3.1 CalculatorEngine（基础 + 科学计算器引擎）

**状态变量**:
- `currentOperand`: 当前输入的数字字符串
- `previousOperand`: 上一个操作数
- `operation`: 当前待执行的操作符 (+, -, *, /, **, root)
- `shouldResetScreen`: 是否在下一次输入时重置屏幕
- `expression`: 表达式字符串（显示用）

**核心方法**:

| 方法 | 功能 |
|------|------|
| `appendDigit(digit)` | 追加数字/小数点到当前操作数，处理前导零和重复小数点 |
| `chooseOp(op)` | 选择操作符，若有未完成的运算则先计算 |
| `compute()` | 执行当前运算（支持 +, -, *, /, **, root） |
| `evaluate()` | 计算最终结果，更新表达式显示 |
| `clear()` | 清零所有状态 |
| `toggleSign()` | 正负号切换 |
| `percent()` | 百分比转换 |
| `formatNumber(str)` | 数字格式化（千位分隔符、科学计数法） |
| `scientificFn(fn)` | 科学函数：x², x³, √, ³√, log, ln, sin, cos, tan, x!, x^y, π, e |
| `factorial(n)` | 阶乘计算 |

**科学函数列表**:
- 幂类: x², x³, x^y (二元), EXP(小数位移)
- 根类: √, ³√, x√y (二元)
- 对数: log(10底), ln(e底)
- 三角: sin, cos, tan (弧度制)
- 阶乘: x!
- 常量: π, e

### 3.2 ProgrammerEngine（程序员计算器引擎）

**状态变量**:
- `value`: 当前数值（内部统一用十进制存储）
- `radix`: 当前进制模式 (dec/hex/oct/bin)
- `inputBuffer`: 输入缓冲区（紧凑格式，用于内部解析）
- `previousValue`: 上一个操作数值
- `operation`: 当前操作符（算术 + 位运算）
- `shouldReset`: 是否重置输入缓冲

**核心方法**:

| 方法 | 功能 |
|------|------|
| `appendDigit(digit)` | 按当前进制解析数字，验证有效性 |
| `parseInput(str)` | 按进制解析字符串为数值 |
| `formatValue(val, radix)` | 紧凑格式输出（内部buffer用） |
| `formatDisplay(val, radix)` | 显示格式输出（BIN为32位填充） |
| `getAllRadixes()` | 获取DEC/HEX/OCT/BIN四种表示 |
| `getBitString()` | 获取32位二进制字符串（用于bit显示） |
| `chooseOp(op)` | 选择操作符（算术 + AND/OR/XOR/SHL/SHR）|
| `executeOp()` | 执行运算 |
| `bitwiseNot()` | 按位取反 NOT |
| `setRadix(radix)` | 切换进制模式 |

**支持的位运算**: AND, OR, XOR, SHL(左移), SHR(右移), NOT

### 3.3 CalculatorUI（UI控制器）

**核心方法**:

| 方法 | 功能 |
|------|------|
| `initTabs()` | 初始化标签切换事件 |
| `switchTab(name)` | 切换计算器模式，重置引擎状态 |
| `initButtons()` | 事件委托绑定按钮点击 |
| `handleButton(btn)` | 根据当前模式分发到对应处理器 |
| `handleBasicButton()` | 基础计算器按钮处理 |
| `handleScientificButton()` | 科学计算器按钮处理（额外处理sci属性） |
| `handleProgrammerButton()` | 程序员计算器按钮处理（radix/prog/hex）|
| `updateDisplay()` | 根据当前模式更新显示 |
| `updateBasicDisplay()` | 更新基础/科学计算器显示 |
| `updateProgrammerDisplay()` | 更新程序员计算器显示（多进制+bit） |
| `initKeyboard()` | 键盘事件绑定（数字、运算符、Enter、Escape） |
| `backspace()` | 退格删除最后一位 |

## 四、流程调用

### 4.1 基础计算流程

```
用户点击数字按钮
    ↓
CalculatorUI.handleButton()
    → handleBasicButton() [data-num="5"]
        → CalculatorEngine.appendDigit('5')
            → 更新 currentOperand
    ↓
CalculatorUI.updateDisplay()
    → updateBasicDisplay()
        → resultEl.textContent = formatNumber(currentOperand)
```

### 4.2 运算流程（以 12 + 5 = 为例）

```
点击 "1" → appendDigit('1') → currentOperand = "1"
点击 "2" → appendDigit('2') → currentOperand = "12"
点击 "+" → chooseOp('+')
    → previousOperand = "12"
    → operation = '+'
    → shouldResetScreen = true
    → expression = "12 +"
点击 "5" → appendDigit('5')
    → shouldResetScreen为true, 重置currentOperand
    → currentOperand = "5"
点击 "=" → evaluate()
    → compute(): 12 + 5 = 17
    → currentOperand = "17"
    → expression = "12 + 5 ="
    → operation = null, previousOperand = ""
```

### 4.3 链式运算流程（2 + 3 × 4 = ）

```
"2" → currentOperand = "2"
"+" → chooseOp('+') → previousOperand = "2", operation = '+'
"3" → currentOperand = "3"
"×" → chooseOp('*')
    → operation已有('+'), shouldResetScreen为false
    → 先 compute(): 2 + 3 = 5
    → currentOperand = "5"
    → previousOperand = "5", operation = '*'
"4" → currentOperand = "4"
"=" → evaluate() → compute(): 5 * 4 = 20
```

### 4.4 程序员计算器流程（DEC输入 → HEX显示）

```
点击 "4" → appendDigit('4') [radix=dec]
    → validDigits.dec.includes('4') ✓
    → inputBuffer = "4"
    → value = parseInt("4", 10) = 4
点击 "2" → appendDigit('2')
    → inputBuffer = "42"
    → value = 42
点击 "HEX" → setRadix('hex')
    → radix = 'hex'
    → inputBuffer = formatValue(42, 'hex') = "2A"
更新显示:
    → getAllRadixes(): {DEC:"42", HEX:"2A", OCT:"52", BIN:"...101010"}
    → bitDisplay: 32位bit高亮显示
```

### 4.5 标签切换流程

```
用户点击 "科学" 标签
    ↓
CalculatorUI.switchTab('scientific')
    → 更新tab按钮active状态
    → 切换panel显示 (隐藏basic, 显示scientific)
    → basicEngine.clear() [重置状态]
    → updateDisplay()
```

## 五、UI设计

### 5.1 视觉风格

参考 macOS Calculator 深色主题：
- **背景**: #2c2c2c (计算器主体), #1c1c1c (标签栏)
- **数字按钮**: #505050 灰色背景，白色文字
- **运算符按钮**: #ff9f0a 橙色背景，白色文字
- **功能按钮**: #3a3a3a 深灰背景，白色文字
- **等号按钮**: #ff9f0a 橙色（与运算符一致）

### 5.2 三个页面布局

| 页面 | 列数 | 特色 |
|------|------|------|
| 基础计算器 | 4列 × 5行 | 标准数字+四则运算布局 |
| 科学计算器 | 5列 × 7行 | 额外一列放科学函数键 |
| 程序员计算器 | 4列 + 显示区 | DEC/HEX/OCT/BIN四行显示 + 32位bit条 |

### 5.3 交互细节

- 按钮点击有 `scale(0.95)` 缩放反馈
- 当前操作符高亮（白色背景+橙色文字）
- 长数字自动缩小字号
- 基础/科学模式支持键盘输入（数字、运算符、Enter、Escape、Backspace）

## 六、关键设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 技术栈 | 纯HTML/CSS/JS | 无需构建工具，直接浏览器打开 |
| 引擎分离 | 基础+科学共用一个引擎，程序员独立引擎 | 程序员模式需要进制转换和位运算，与基础模式差异大 |
| BIN内部格式 | 紧凑格式存储，32位填充仅用于显示 | 避免输入缓冲区被前导零污染 |
| 链式运算 | 先计算再切换操作符 | 符合macOS计算器行为 (2+3×4 = 20) |
| 精度处理 | round(x * 1e12) / 1e12 | 解决浮点精度问题 (0.1+0.2) |
