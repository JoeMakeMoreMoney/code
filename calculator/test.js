/**
 * Calculator Test Suite - Tests all three modes programmatically
 */

// Simulate CalculatorEngine for testing (no DOM needed)
class CalculatorEngine {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.expression = '';
    }

    appendDigit(digit) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (this.currentOperand.replace(/[^0-9]/g, '').length >= 15) return;
        if (this.currentOperand === '0' && digit !== '.') {
            this.currentOperand = digit;
        } else if (digit === '.' && this.currentOperand.includes('.')) {
            return;
        } else {
            this.currentOperand += digit;
        }
    }

    chooseOp(op) {
        if (this.operation && !this.shouldResetScreen) {
            const result = this.compute();
            this.currentOperand = result.toString();
        }
        this.previousOperand = this.currentOperand;
        this.operation = op;
        this.shouldResetScreen = true;
        this.expression = `${this.formatNumber(this.previousOperand)} ${this.opSymbol(op)}`;
    }

    compute() {
        if (!this.operation || !this.previousOperand) return parseFloat(this.currentOperand);
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return 0;
        let result;
        switch (this.operation) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/': result = current === 0 ? NaN : prev / current; break;
            case '**': result = Math.pow(prev, current); break;
            case 'root': result = Math.pow(current, 1 / prev); break;
            default: return current;
        }
        return Math.round(result * 1e12) / 1e12;
    }

    evaluate() {
        if (!this.operation || !this.previousOperand) return this.currentOperand;
        const result = this.compute();
        this.expression = `${this.formatNumber(this.previousOperand)} ${this.opSymbol(this.operation)} ${this.formatNumber(this.currentOperand)} =`;
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = true;
        if (isNaN(result)) {
            this.currentOperand = 'Error';
        } else {
            this.currentOperand = result.toString();
        }
        return this.currentOperand;
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.expression = '';
    }

    toggleSign() {
        if (this.currentOperand === 'Error') return;
        const val = parseFloat(this.currentOperand);
        if (isNaN(val)) return;
        this.currentOperand = (-val).toString();
    }

    percent() {
        if (this.currentOperand === 'Error') return;
        const val = parseFloat(this.currentOperand);
        if (isNaN(val)) return;
        this.currentOperand = (val / 100).toString();
    }

    formatNumber(numStr) {
        if (numStr === 'Error') return numStr;
        const num = parseFloat(numStr);
        if (isNaN(num)) return '0';
        if (numStr.includes('.') && numStr.split('.')[1].length > 10) {
            return num.toExponential(6);
        }
        const parts = numStr.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    opSymbol(op) {
        const symbols = { '+': '+', '-': '−', '*': '×', '/': '/' };
        return symbols[op] || op;
    }

    scientificFn(fn) {
        if (this.currentOperand === 'Error') return;
        const val = parseFloat(this.currentOperand);
        if (isNaN(val)) { this.currentOperand = 'Error'; return; }
        let result;
        switch (fn) {
            case 'square': result = val * val; break;
            case 'cube': result = val * val * val; break;
            case 'sqrt': result = Math.sqrt(val); break;
            case 'cbrt': result = Math.cbrt(val); break;
            case 'log': result = Math.log10(val); break;
            case 'ln': result = Math.log(val); break;
            case 'sin': result = Math.sin(val); break;
            case 'cos': result = Math.cos(val); break;
            case 'tan': result = Math.tan(val); break;
            case 'fact': result = this.factorial(val); break;
            case 'pow': this.chooseOp('**'); return;
            case 'root': this.chooseOp('root'); return;
            case 'eulere': result = Math.E; break;
            case 'pi': result = Math.PI; break;
            case 'exp': result = val * 10; break;
            default: return;
        }
        result = Math.round(result * 1e12) / 1e12;
        if (isNaN(result) || !isFinite(result)) {
            this.currentOperand = 'Error';
        } else {
            this.currentOperand = result.toString();
        }
        this.shouldResetScreen = true;
    }

    factorial(n) {
        if (n < 0 || n !== Math.floor(n)) return NaN;
        if (n > 170) return Infinity;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }

    computePower() {
        if (!this.operation || !this.previousOperand) return parseFloat(this.currentOperand);
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (this.operation === '**') return Math.pow(prev, current);
        if (this.operation === 'root') return Math.pow(current, 1 / prev);
        return this.compute();
    }
}

// ProgrammerEngine test simulation
class ProgrammerEngine {
    constructor() {
        this.value = 0;
        this.radix = 'dec';
        this.inputBuffer = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldReset = false;
    }

    parseInput(str) {
        if (!str || str === 'Error') return 0;
        switch (this.radix) {
            case 'hex': return parseInt(str, 16);
            case 'oct': return parseInt(str, 8);
            case 'bin': return parseInt(str, 2);
            default: return parseFloat(str);
        }
    }

    appendDigit(digit) {
        if (this.shouldReset) {
            this.inputBuffer = '';
            this.shouldReset = false;
        }
        const validDigits = { dec: '0123456789', hex: '0123456789ABCDEF', oct: '01234567', bin: '01' };
        if (!validDigits[this.radix].includes(digit.toUpperCase())) return;
        const clean = this.inputBuffer.replace(/[^0-9A-Fa-f]/g, '');
        if (clean.length > 16) return;
        if (this.inputBuffer === '0' && digit !== '.') {
            this.inputBuffer = digit;
        } else {
            this.inputBuffer += digit;
        }
        this.value = this.parseInput(this.inputBuffer);
    }

    formatValue(val, radix) {
        const intVal = Math.trunc(val);
        if (isNaN(intVal)) return '0';
        switch (radix) {
            case 'hex': return intVal.toString(16).toUpperCase();
            case 'oct': return intVal.toString(8);
            case 'bin': return intVal.toString(2);
            default: return String(intVal);
        }
    }

    formatDisplay(val, radix) {
        if (radix === 'bin') {
            let v = Math.trunc(val);
            if (v < 0) v = v >>> 0;
            return v.toString(2).padStart(32, '0');
        }
        return this.formatValue(val, radix);
    }

    getAllRadixes() {
        return {
            dec: this.formatDisplay(this.value, 'dec'),
            hex: this.formatDisplay(this.value, 'hex'),
            oct: this.formatDisplay(this.value, 'oct'),
            bin: this.formatDisplay(this.value, 'bin')
        };
    }

    getBitString() {
        let val = Math.trunc(this.value);
        if (val < 0) val = val >>> 0;
        return val.toString(2).padStart(32, '0');
    }

    chooseOp(op) {
        if (this.operation && !this.shouldReset) {
            this.executeOp();
        }
        this.previousValue = this.value;
        this.operation = op;
        this.shouldReset = true;
    }

    executeOp() {
        if (!this.operation || this.previousValue === null) return;
        let result;
        const prev = this.previousValue;
        const curr = this.value;
        switch (this.operation) {
            case '+': result = prev + curr; break;
            case '-': result = prev - curr; break;
            case '*': result = prev * curr; break;
            case '/': result = curr === 0 ? NaN : prev / curr; break;
            case 'and': result = prev & curr; break;
            case 'or': result = prev | curr; break;
            case 'xor': result = prev ^ curr; break;
            case 'shl': result = prev << curr; break;
            case 'shr': result = prev >> curr; break;
            default: result = curr;
        }
        this.value = Math.trunc(result);
        if (isNaN(this.value)) {
            this.value = 0;
            this.inputBuffer = 'Error';
        } else {
            this.inputBuffer = this.formatValue(this.value, this.radix);
        }
        this.previousValue = null;
        this.operation = null;
        this.shouldReset = true;
    }

    bitwiseNot() {
        this.value = ~Math.trunc(this.value);
        this.inputBuffer = this.formatValue(this.value, this.radix);
    }

    clear() {
        this.value = 0;
        this.inputBuffer = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldReset = false;
    }

    setRadix(radix) {
        this.radix = radix;
        this.inputBuffer = this.formatValue(this.value, radix);
    }

    decimal() {}
    toggleSign() {
        this.value = -this.value;
        this.inputBuffer = this.formatValue(this.value, this.radix);
    }
    percent() {}
}

// Test runner
class TestRunner {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    assert(condition, testName) {
        if (condition) {
            this.passed++;
            this.results.push(`  ✅ ${testName}`);
        } else {
            this.failed++;
            this.results.push(`  ❌ ${testName}`);
        }
    }

    section(name) {
        this.results.push(`\n${name}`);
        this.results.push(''.padEnd(name.length, '─'));
    }

    runAll() {
        this.testBasicCalculator();
        this.testScientificCalculator();
        this.testProgrammerCalculator();

        this.results.push(`\n${'='.repeat(50)}`);
        this.results.push(`测试结果汇总`);
        this.results.push(`${'='.repeat(50)}`);
        this.results.push(`总计: ${this.passed + this.failed} 项测试`);
        this.results.push(`通过: ${this.passed} ✅`);
        this.results.push(`失败: ${this.failed} ❌`);
        this.results.push(`通过率: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

        return this.results.join('\n');
    }

    testBasicCalculator() {
        this.section('基础计算器测试');
        const calc = new CalculatorEngine();

        // Test: Initial state
        this.assert(calc.currentOperand === '0', '初始状态显示 0');

        // Test: Single digit input
        calc.appendDigit('5');
        this.assert(calc.currentOperand === '5', '输入单个数字 5');

        // Test: Multi-digit input
        calc.appendDigit('3');
        this.assert(calc.currentOperand === '53', '输入多位数字 53');

        // Test: Zero prefix handling
        calc.clear();
        calc.appendDigit('0');
        calc.appendDigit('7');
        this.assert(calc.currentOperand === '7', '前导零处理 (07 → 7)');

        // Test: Decimal input
        calc.clear();
        calc.appendDigit('3');
        calc.appendDigit('.');
        calc.appendDigit('14');
        this.assert(calc.currentOperand === '3.14', '小数输入 3.14');

        // Test: Double decimal prevention
        calc.clear();
        calc.appendDigit('1');
        calc.appendDigit('.');
        calc.appendDigit('.');
        this.assert(calc.currentOperand === '1.', '防止重复小数点');

        // Test: Addition
        calc.clear();
        calc.appendDigit('2');
        calc.chooseOp('+');
        calc.appendDigit('3');
        calc.evaluate();
        this.assert(calc.currentOperand === '5', '加法: 2 + 3 = 5');

        // Test: Subtraction
        calc.clear();
        calc.appendDigit('10');
        calc.chooseOp('-');
        calc.appendDigit('4');
        calc.evaluate();
        this.assert(calc.currentOperand === '6', '减法: 10 - 4 = 6');

        // Test: Multiplication
        calc.clear();
        calc.appendDigit('7');
        calc.chooseOp('*');
        calc.appendDigit('8');
        calc.evaluate();
        this.assert(calc.currentOperand === '56', '乘法: 7 × 8 = 56');

        // Test: Division
        calc.clear();
        calc.appendDigit('15');
        calc.chooseOp('/');
        calc.appendDigit('3');
        calc.evaluate();
        this.assert(calc.currentOperand === '5', '除法: 15 / 3 = 5');

        // Test: Division by zero
        calc.clear();
        calc.appendDigit('1');
        calc.chooseOp('/');
        calc.appendDigit('0');
        calc.evaluate();
        this.assert(calc.currentOperand === 'Error', '除以零显示 Error');

        // Test: Toggle sign
        calc.clear();
        calc.appendDigit('5');
        calc.toggleSign();
        this.assert(calc.currentOperand === '-5', '正负号切换: 5 → -5');

        calc.toggleSign();
        this.assert(calc.currentOperand === '5', '正负号切换: -5 → 5');

        // Test: Percentage
        calc.clear();
        calc.appendDigit('50');
        calc.percent();
        this.assert(calc.currentOperand === '0.5', '百分比: 50% = 0.5');

        // Test: Chain operations
        calc.clear();
        calc.appendDigit('2');
        calc.chooseOp('+');
        calc.appendDigit('3');
        calc.chooseOp('*');
        calc.appendDigit('4');
        calc.evaluate();
        // 2+3=5, then 5*4=20
        const chainResult = parseFloat(calc.currentOperand);
        this.assert(chainResult === 20, '链式运算: 2+3×4 = 20');

        // Test: Format number with commas
        calc.clear();
        calc.appendDigit('1');
        for (let i = 0; i < 6; i++) calc.appendDigit('0');
        const formatted = calc.formatNumber(calc.currentOperand);
        this.assert(formatted === '1,000,000', '数字格式化: 1000000 → 1,000,000');

        // Test: Clear
        calc.clear();
        this.assert(calc.currentOperand === '0', 'AC 清零后显示 0');
        this.assert(calc.expression === '', 'AC 清除表达式');
    }

    testScientificCalculator() {
        this.section('科学计算器测试');
        const calc = new CalculatorEngine();

        // Test: Square
        calc.clear();
        calc.appendDigit('5');
        calc.scientificFn('square');
        this.assert(parseFloat(calc.currentOperand) === 25, '平方: 5² = 25');

        // Test: Cube
        calc.clear();
        calc.appendDigit('3');
        calc.scientificFn('cube');
        this.assert(parseFloat(calc.currentOperand) === 27, '立方: 3³ = 27');

        // Test: Square root
        calc.clear();
        calc.appendDigit('144');
        calc.scientificFn('sqrt');
        this.assert(parseFloat(calc.currentOperand) === 12, '平方根: √144 = 12');

        // Test: Cube root
        calc.clear();
        calc.appendDigit('27');
        calc.scientificFn('cbrt');
        this.assert(parseFloat(calc.currentOperand) === 3, '立方根: ³√27 = 3');

        // Test: Log10
        calc.clear();
        calc.appendDigit('100');
        calc.scientificFn('log');
        this.assert(Math.abs(parseFloat(calc.currentOperand) - 2) < 0.001, '常用对数: log(100) = 2');

        // Test: Natural log
        calc.clear();
        calc.appendDigit('1');
        calc.appendDigit('.');
        calc.scientificFn('ln'); // ln(1) = 0
        this.assert(Math.abs(parseFloat(calc.currentOperand)) < 0.001, '自然对数: ln(1) = 0');

        // Test: sin(0)
        calc.clear();
        calc.appendDigit('0');
        calc.scientificFn('sin');
        this.assert(Math.abs(parseFloat(calc.currentOperand)) < 0.001, '正弦: sin(0) = 0');

        // Test: cos(0)
        calc.clear();
        calc.appendDigit('0');
        calc.scientificFn('cos');
        this.assert(Math.abs(parseFloat(calc.currentOperand) - 1) < 0.001, '余弦: cos(0) = 1');

        // Test: tan(0)
        calc.clear();
        calc.appendDigit('0');
        calc.scientificFn('tan');
        this.assert(Math.abs(parseFloat(calc.currentOperand)) < 0.001, '正切: tan(0) = 0');

        // Test: Factorial
        calc.clear();
        calc.appendDigit('5');
        calc.scientificFn('fact');
        this.assert(parseFloat(calc.currentOperand) === 120, '阶乘: 5! = 120');

        // Test: Factorial 0!
        calc.clear();
        calc.scientificFn('fact'); // 0! = 1
        this.assert(parseFloat(calc.currentOperand) === 1, '阶乘: 0! = 1');

        // Test: Pi constant
        calc.clear();
        calc.scientificFn('pi');
        this.assert(Math.abs(parseFloat(calc.currentOperand) - Math.PI) < 0.001, 'π 常量');

        // Test: Euler's number
        calc.clear();
        calc.scientificFn('eulere');
        this.assert(Math.abs(parseFloat(calc.currentOperand) - Math.E) < 0.001, 'e 常量');

        // Test: Power (x^y)
        calc.clear();
        calc.appendDigit('2');
        calc.scientificFn('pow'); // sets up ** operation
        calc.appendDigit('10');
        calc.evaluate();
        this.assert(parseFloat(calc.currentOperand) === 1024, '幂运算: 2^10 = 1024');

        // Test: Negative square root (should error)
        calc.clear();
        calc.appendDigit('4');
        calc.toggleSign(); // -4
        calc.scientificFn('sqrt');
        this.assert(calc.currentOperand === 'Error', '负数平方根返回 Error');

        // Test: EXP (shift decimal)
        calc.clear();
        calc.appendDigit('5');
        calc.scientificFn('exp');
        this.assert(parseFloat(calc.currentOperand) === 50, 'EXP: 5 → 50');
    }

    testProgrammerCalculator() {
        this.section('程序员计算器测试');
        const prog = new ProgrammerEngine();

        // Test: Initial state
        this.assert(prog.value === 0, '初始值为 0');

        // Test: DEC input
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('4');
        prog.appendDigit('2');
        this.assert(prog.value === 42, 'DEC输入: 42');

        // Test: HEX conversion
        prog.setRadix('hex');
        const hex42 = prog.inputBuffer;
        this.assert(hex42 === '2A', `HEX显示: 42 → ${hex42}`);

        // Test: OCT conversion
        prog.setRadix('oct');
        const oct42 = prog.inputBuffer;
        this.assert(oct42 === '52', `OCT显示: 42 → ${oct42}`);

        // Test: BIN conversion
        prog.setRadix('bin');
        const bin42 = prog.getBitString();
        this.assert(bin42.endsWith('101010'), `BIN显示: 42 → ...${bin42.slice(-6)}`);

        // Test: HEX input
        prog.clear();
        prog.setRadix('hex');
        prog.appendDigit('F');
        this.assert(prog.value === 15, 'HEX输入: F = 15');

        prog.appendDigit('F');
        this.assert(prog.value === 255, 'HEX输入: FF = 255');

        // Test: OCT input
        prog.clear();
        prog.setRadix('oct');
        prog.appendDigit('7');
        this.assert(prog.value === 7, 'OCT输入: 7 = 7');

        // Test: BIN input
        prog.clear();
        prog.setRadix('bin');
        prog.appendDigit('1');
        prog.appendDigit('0');
        this.assert(prog.value === 2, 'BIN输入: 10 = 2');

        // Test: AND operation
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('1');
        prog.appendDigit('2'); // 12 = 0b1100
        prog.chooseOp('and');
        prog.appendDigit('1');
        prog.appendDigit('0'); // 10 = 0b1010
        prog.executeOp();
        this.assert(prog.value === 8, 'AND: 12 & 10 = 8');

        // Test: OR operation
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('8');  // 0b1000
        prog.chooseOp('or');
        prog.appendDigit('4');  // 0b0100
        prog.executeOp();
        this.assert(prog.value === 12, 'OR: 8 | 4 = 12');

        // Test: XOR operation
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('1');
        prog.appendDigit('2'); // 0b1100
        prog.chooseOp('xor');
        prog.appendDigit('5');  // 0b0101
        prog.executeOp();
        this.assert(prog.value === 9, 'XOR: 12 ^ 5 = 9');

        // Test: SHL (left shift)
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('1');
        prog.chooseOp('shl');
        prog.appendDigit('3');
        prog.executeOp();
        this.assert(prog.value === 8, 'SHL: 1 << 3 = 8');

        // Test: SHR (right shift)
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('1');
        prog.appendDigit('6'); // 0b10000
        prog.chooseOp('shr');
        prog.appendDigit('2');
        prog.executeOp();
        this.assert(prog.value === 4, 'SHR: 16 >> 2 = 4');

        // Test: NOT operation
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('0');
        prog.bitwiseNot();
        this.assert(prog.value === -1, 'NOT: ~0 = -1');

        // Test: Arithmetic in programmer mode
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('1');
        prog.appendDigit('0');
        prog.chooseOp('+');
        prog.appendDigit('5');
        prog.executeOp();
        this.assert(prog.value === 15, '加法: 10 + 5 = 15');

        // Test: Invalid digit rejection in BIN mode
        prog.clear();
        prog.setRadix('bin');
        prog.appendDigit('2'); // Should be rejected
        this.assert(prog.value === 0, 'BIN模式拒绝无效数字 2');

        // Test: All radix display consistency
        prog.clear();
        prog.setRadix('dec');
        prog.appendDigit('2');
        prog.appendDigit('5'); // value = 25
        const radixes = prog.getAllRadixes();
        this.assert(radixes.dec === '25', `DEC显示: 25`);
        this.assert(radixes.hex === '19', `HEX显示: 25 → 19`);
        this.assert(radixes.oct === '31', `OCT显示: 25 → 31`);
    }

    testUIFeatures() {
        this.section('UI 功能测试');

        // Test: File existence check (done via fs in Node)
        const fs = require('fs');
        this.assert(fs.existsSync('/Users/zouchunduan/code/calculator/index.html'), 'index.html 文件存在');
        this.assert(fs.existsSync('/Users/zouchunduan/code/calculator/styles.css'), 'styles.css 文件存在');
        this.assert(fs.existsSync('/Users/zouchunduan/code/calculator/calc.js'), 'calc.js 文件存在');

        // Test: HTML structure
        const html = fs.readFileSync('/Users/zouchunduan/code/calculator/index.html', 'utf8');
        this.assert(html.includes('data-tab="basic"'), 'HTML包含基础计算器标签');
        this.assert(html.includes('data-tab="scientific"'), 'HTML包含科学计算器标签');
        this.assert(html.includes('data-tab="programmer"'), 'HTML包含程序员计算器标签');
        this.assert(html.includes('panel-basic'), 'HTML包含基础计算器面板');
        this.assert(html.includes('panel-scientific'), 'HTML包含科学计算器面板');
        this.assert(html.includes('panel-programmer'), 'HTML包含程序员计算器面板');

        // Test: CSS structure
        const css = fs.readFileSync('/Users/zouchunduan/code/calculator/styles.css', 'utf8');
        this.assert(css.includes('.tabs'), 'CSS包含标签样式');
        this.assert(css.includes('.btn-grid'), 'CSS包含按钮网格样式');
        this.assert(css.includes('.display'), 'CSS包含显示区域样式');

        // Test: JS structure
        const js = fs.readFileSync('/Users/zouchunduan/code/calculator/calc.js', 'utf8');
        this.assert(js.includes('class CalculatorEngine'), 'JS包含计算器引擎类');
        this.assert(js.includes('class ProgrammerEngine'), 'JS包含程序员计算器引擎类');
        this.assert(js.includes('class CalculatorUI'), 'JS包含UI控制器类');
    }
}

// Run tests
const runner = new TestRunner();
runner.testBasicCalculator();
runner.testScientificCalculator();
runner.testProgrammerCalculator();
runner.testUIFeatures();

// Add summary
const total = runner.passed + runner.failed;
runner.results.push(`\n${'='.repeat(50)}`);
runner.results.push('测试结果汇总');
runner.results.push(`${'='.repeat(50)}`);
runner.results.push(`总计: ${total} 项测试`);
runner.results.push(`通过: ${runner.passed} ✅`);
runner.results.push(`失败: ${runner.failed} ❌`);
runner.results.push(`通过率: ${((runner.passed / total) * 100).toFixed(1)}%`);

console.log(runner.results.join('\n'));
