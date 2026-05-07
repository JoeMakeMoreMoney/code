/**
 * Calculator Engine - handles expression parsing and evaluation
 */
class CalculatorEngine {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.expression = '';
    }

    /**
     * Append a digit to current operand
     */
    appendDigit(digit) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        // Limit length
        if (this.currentOperand.replace(/[^0-9]/g, '').length >= 15) return;

        if (this.currentOperand === '0' && digit !== '.') {
            this.currentOperand = digit;
        } else if (digit === '.' && this.currentOperand.includes('.')) {
            return;
        } else {
            this.currentOperand += digit;
        }
    }

    /**
     * Choose an operation (+, -, *, /)
     */
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

    /**
     * Compute the result
     */
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

        // Handle floating point precision
        return Math.round(result * 1e12) / 1e12;
    }

    /**
     * Evaluate and display result
     */
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

    /**
     * Clear all state
     */
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.expression = '';
    }

    /**
     * Toggle sign
     */
    toggleSign() {
        if (this.currentOperand === 'Error') return;
        const val = parseFloat(this.currentOperand);
        if (isNaN(val)) return;
        this.currentOperand = (-val).toString();
    }

    /**
     * Percentage
     */
    percent() {
        if (this.currentOperand === 'Error') return;
        const val = parseFloat(this.currentOperand);
        if (isNaN(val)) return;
        this.currentOperand = (val / 100).toString();
    }

    /**
     * Format number with commas
     */
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
        const symbols = { '+': '+', '-': '−', '*': '×', '/': '/', '**': '^', 'root': '√' };
        return symbols[op] || op;
    }

    /**
     * Scientific functions
     */
    scientificFn(fn) {
        if (this.currentOperand === 'Error') return;
        const val = parseFloat(this.currentOperand);
        if (isNaN(val)) { this.currentOperand = 'Error'; return; }

        let result;
        const exprLabel = {
            square: `sqr(${val})`, cube: `cube(${val})`, sqrt: `√(${val})`,
            cbrt: `³√(${val})`, log: `log(${val})`, ln: `ln(${val})`,
            sin: `sin(${val})`, cos: `cos(${val})`, tan: `tan(${val})`,
            fact: `${val}!`, pow: null, eulere: null, pi: null, exp: `EXP(${val})`,
            root: null
        };

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
            case 'pow':
                // Binary op: store base, wait for exponent
                this.chooseOp('**');
                return;
            case 'root':
                // Binary op: store base (radicand), wait for root index
                this.chooseOp('root');
                return;
            case 'eulere':
                result = Math.E;
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'exp': result = val * 10; break; // shift decimal
            default: return;
        }

        if (exprLabel[fn]) {
            this.expression = `${exprLabel[fn]} =`;
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

    /**
     * Handle power operation (for scientific mode)
     */
    computePower() {
        if (!this.operation || !this.previousOperand) return parseFloat(this.currentOperand);
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (this.operation === '**') {
            return Math.pow(prev, current);
        }
        if (this.operation === 'root') {
            return Math.pow(current, 1 / prev);
        }
        return this.compute();
    }
}

/**
 * Programmer Calculator Engine - handles radix conversion and bitwise ops
 */
class ProgrammerEngine {
    constructor() {
        this.value = 0;
        this.radix = 'dec'; // dec, hex, oct, bin
        this.inputBuffer = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldReset = false;
    }

    /**
     * Parse input based on current radix
     */
    parseInput(str) {
        if (!str || str === 'Error') return 0;
        switch (this.radix) {
            case 'hex': return parseInt(str, 16);
            case 'oct': return parseInt(str, 8);
            case 'bin': return parseInt(str, 2);
            default: return parseFloat(str);
        }
    }

    /**
     * Append digit/hex char to input buffer
     */
    appendDigit(digit) {
        if (this.shouldReset) {
            this.inputBuffer = '';
            this.shouldReset = false;
        }

        // Validate digit for current radix
        const validDigits = { dec: '0123456789', hex: '0123456789ABCDEF', oct: '01234567', bin: '01' };
        if (!validDigits[this.radix].includes(digit.toUpperCase())) return;

        // Limit length
        const clean = this.inputBuffer.replace(/[^0-9A-Fa-f]/g, '');
        if (clean.length > 16) return;

        if (this.inputBuffer === '0' && digit !== '.') {
            this.inputBuffer = digit;
        } else {
            this.inputBuffer += digit;
        }

        this.value = this.parseInput(this.inputBuffer);
    }

    /**
     * Format value to target radix string (compact, for internal buffer)
     */
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

    /**
     * Format value for display (padded BIN)
     */
    formatDisplay(val, radix) {
        if (radix === 'bin') {
            let v = Math.trunc(val);
            if (v < 0) v = v >>> 0;
            return v.toString(2).padStart(32, '0');
        }
        return this.formatValue(val, radix);
    }

    /**
     * Get all radix representations (display-ready)
     */
    getAllRadixes() {
        return {
            dec: this.formatDisplay(this.value, 'dec'),
            hex: this.formatDisplay(this.value, 'hex'),
            oct: this.formatDisplay(this.value, 'oct'),
            bin: this.formatDisplay(this.value, 'bin')
        };
    }

    /**
     * Get 32-bit binary string for bit display
     */
    getBitString() {
        let val = Math.trunc(this.value);
        if (val < 0) val = val >>> 0; // unsigned for display
        return val.toString(2).padStart(32, '0');
    }

    /**
     * Choose operation
     */
    chooseOp(op) {
        if (this.operation && !this.shouldReset) {
            this.executeOp();
        }
        this.previousValue = this.value;
        this.operation = op;
        this.shouldReset = true;
    }

    /**
     * Execute operation
     */
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

    /**
     * Bitwise NOT
     */
    bitwiseNot() {
        this.value = ~Math.trunc(this.value);
        this.inputBuffer = this.formatValue(this.value, this.radix);
    }

    /**
     * Clear
     */
    clear() {
        this.value = 0;
        this.inputBuffer = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldReset = false;
    }

    /**
     * Set radix and update display buffer
     */
    setRadix(radix) {
        this.radix = radix;
        this.inputBuffer = this.formatValue(this.value, radix);
    }

    /**
     * Handle decimal point (hide in programmer mode for integer-only)
     */
    decimal() {
        // No-op in programmer mode (integer only)
    }

    /**
     * Toggle sign (negate)
     */
    toggleSign() {
        this.value = -this.value;
        this.inputBuffer = this.formatValue(this.value, this.radix);
    }

    /**
     * Percentage (no-op in programmer mode)
     */
    percent() {
        // No-op
    }
}

/**
 * UI Controller - handles all DOM interactions
 */
class CalculatorUI {
    constructor() {
        this.basicEngine = new CalculatorEngine();
        this.programmerEngine = new ProgrammerEngine();
        this.currentTab = 'basic';

        this.resultEl = document.getElementById('result');
        this.expressionEl = document.getElementById('expression');

        this.initTabs();
        this.initButtons();
        this.initKeyboard();
        this.updateDisplay();
    }

    /**
     * Tab switching
     */
    initTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                this.switchTab(target);
            });
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${tabName}`).classList.add('active');

        // Reset engines on tab switch
        if (tabName === 'basic' || tabName === 'scientific') {
            this.basicEngine.clear();
        } else if (tabName === 'programmer') {
            this.programmerEngine.clear();
        }

        this.updateDisplay();
    }

    /**
     * Button event delegation
     */
    initButtons() {
        document.querySelectorAll('.panel').forEach(panel => {
            panel.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn');
                if (!btn) return;

                this.handleButton(btn);
            });
        });
    }

    handleButton(btn) {
        if (this.currentTab === 'programmer') {
            this.handleProgrammerButton(btn);
        } else if (this.currentTab === 'scientific') {
            this.handleScientificButton(btn);
        } else {
            this.handleBasicButton(btn);
        }
        this.updateDisplay();
    }

    /**
     * Basic calculator button handler
     */
    handleBasicButton(btn) {
        const num = btn.dataset.num;
        const op = btn.dataset.op;
        const action = btn.dataset.action;

        if (num !== undefined) {
            this.basicEngine.appendDigit(num);
        } else if (op) {
            this.basicEngine.chooseOp(op);
        } else if (action) {
            switch (action) {
                case 'clear': this.basicEngine.clear(); break;
                case 'sign': this.basicEngine.toggleSign(); break;
                case 'percent': this.basicEngine.percent(); break;
                case 'decimal': this.basicEngine.appendDigit('.'); break;
                case 'equals': this.basicEngine.evaluate(); break;
            }
        }
    }

    /**
     * Scientific calculator button handler
     */
    handleScientificButton(btn) {
        const num = btn.dataset.num;
        const op = btn.dataset.op;
        const action = btn.dataset.action;
        const sci = btn.dataset.sci;

        if (num !== undefined) {
            this.basicEngine.appendDigit(num);
        } else if (op) {
            this.basicEngine.chooseOp(op);
        } else if (action) {
            switch (action) {
                case 'clear': this.basicEngine.clear(); break;
                case 'sign': this.basicEngine.toggleSign(); break;
                case 'percent': this.basicEngine.percent(); break;
                case 'decimal': this.basicEngine.appendDigit('.'); break;
                case 'equals': this.basicEngine.evaluate(); break;
            }
        } else if (sci) {
            this.basicEngine.scientificFn(sci);
        }
    }

    /**
     * Programmer calculator button handler
     */
    handleProgrammerButton(btn) {
        const num = btn.dataset.num;
        const op = btn.dataset.op;
        const action = btn.dataset.action;
        const prog = btn.dataset.prog;
        const radix = btn.dataset.radix;
        const hex = btn.dataset.hex;

        if (radix) {
            this.programmerEngine.setRadix(radix);
            this.updateProgrammerGrid();
        } else if (num !== undefined) {
            this.programmerEngine.appendDigit(num);
        } else if (hex !== undefined) {
            this.programmerEngine.appendDigit(hex);
        } else if (op) {
            this.programmerEngine.chooseOp(op);
        } else if (prog) {
            switch (prog) {
                case 'and': this.programmerEngine.chooseOp('and'); break;
                case 'or': this.programmerEngine.chooseOp('or'); break;
                case 'xor': this.programmerEngine.chooseOp('xor'); break;
                case 'shl': this.programmerEngine.chooseOp('shl'); break;
                case 'shr': this.programmerEngine.chooseOp('shr'); break;
            }
        } else if (action) {
            switch (action) {
                case 'clear': this.programmerEngine.clear(); break;
                case 'sign': this.programmerEngine.bitwiseNot(); break;
                case 'percent': this.programmerEngine.percent(); break;
                case 'decimal': this.programmerEngine.decimal(); break;
                case 'equals': this.programmerEngine.executeOp(); break;
            }
        }
    }

    /**
     * Update programmer grid based on radix mode
     */
    updateProgrammerGrid() {
        const grid = document.querySelector('.programmer-grid');
        const radix = this.programmerEngine.radix;

        // Toggle hex mode for A-F keys
        if (radix === 'hex') {
            grid.classList.add('hex-mode');
            grid.classList.remove('int-mode');
        } else {
            grid.classList.remove('hex-mode');
            if (radix !== 'dec') {
                grid.classList.add('int-mode');
            } else {
                grid.classList.remove('int-mode');
            }
        }

        // Update radix button states
        document.querySelectorAll('.radix-btn').forEach(b => {
            b.classList.toggle('active-radix', b.dataset.radix === radix);
        });

        // Update active radix line in display
        document.querySelectorAll('.radix-line').forEach(line => {
            const id = line.id.replace('-line', '');
            line.classList.toggle('active-radix', id === radix);
        });
    }

    /**
     * Update display based on current tab
     */
    updateDisplay() {
        if (this.currentTab === 'programmer') {
            this.updateProgrammerDisplay();
        } else {
            this.updateBasicDisplay();
        }
    }

    updateBasicDisplay() {
        const formatted = this.basicEngine.formatNumber(this.basicEngine.currentOperand);
        this.resultEl.textContent = formatted;
        this.expressionEl.textContent = this.basicEngine.expression;

        // Adjust font size for long numbers
        const len = formatted.length;
        this.resultEl.classList.toggle('small', len > 12);

        // Update operator button highlight
        document.querySelectorAll('.btn.operator').forEach(btn => {
            const opMap = { '/': '/', '*': '*', '-': '-', '+': '+' };
            const op = opMap[btn.textContent] || btn.dataset.op;
            btn.classList.toggle('active-op', this.basicEngine.operation === op && this.basicEngine.shouldResetScreen);
        });
    }

    updateProgrammerDisplay() {
        const radixes = this.programmerEngine.getAllRadixes();

        document.getElementById('dec-value').textContent = radixes.dec;
        document.getElementById('hex-value').textContent = radixes.hex;
        document.getElementById('oct-value').textContent = radixes.oct;

        // BIN display - full 32-bit
        const binStr = this.programmerEngine.getBitString();
        document.getElementById('bin-value').textContent = binStr;

        // Update bit display
        const bitDisplay = document.getElementById('bit-display');
        const bits = binStr.split('');
        let html = '';
        bits.forEach((bit, i) => {
            if (i > 0 && i % 4 === 0) html += '<span class="bit-space"></span>';
            html += `<span class="bit${bit === '1' ? ' on' : ''}">${bit}</span>`;
        });
        bitDisplay.innerHTML = html;

        // Main result shows current radix value
        this.resultEl.textContent = this.programmerEngine.inputBuffer;
        this.expressionEl.textContent = '';

        // Update font size
        const len = this.programmerEngine.inputBuffer.length;
        this.resultEl.classList.toggle('small', len > 12);

        // Update radix line highlights
        document.querySelectorAll('.radix-line').forEach(line => {
            const id = line.id.replace('-line', '');
            line.classList.toggle('active-radix', id === this.programmerEngine.radix);
        });

        // Update operator button highlight
        document.querySelectorAll('.btn.operator').forEach(btn => {
            const opMap = { '/': '/', '*': '*', '-': '-', '+': '+' };
            const op = opMap[btn.textContent] || btn.dataset.op;
            btn.classList.toggle('active-op', this.programmerEngine.operation === op && this.programmerEngine.shouldReset);
        });

        // Update bitwise operator highlight
        document.querySelectorAll('.btn.prog').forEach(btn => {
            const progMap = { 'AND': 'and', 'OR': 'or', 'XOR': 'xor', 'SHL': 'shl', 'SHR': 'shr' };
            const prog = progMap[btn.textContent] || btn.dataset.prog;
            if (prog && ['and', 'or', 'xor', 'shl', 'shr'].includes(prog)) {
                btn.classList.toggle('active-op', this.programmerEngine.operation === prog && this.programmerEngine.shouldReset);
            }
        });

        // Update radix buttons
        document.querySelectorAll('.radix-btn').forEach(b => {
            b.classList.toggle('active-radix', b.dataset.radix === this.programmerEngine.radix);
        });
    }

    /**
     * Keyboard support
     */
    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (this.currentTab === 'programmer') return; // No keyboard for programmer mode

            const key = e.key;
            if (key >= '0' && key <= '9') {
                this.basicEngine.appendDigit(key);
            } else if (key === '.') {
                this.basicEngine.appendDigit('.');
            } else if (key === '+') {
                this.basicEngine.chooseOp('+');
            } else if (key === '-') {
                this.basicEngine.chooseOp('-');
            } else if (key === '*') {
                this.basicEngine.chooseOp('*');
            } else if (key === '/') {
                e.preventDefault();
                this.basicEngine.chooseOp('/');
            } else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                this.basicEngine.evaluate();
            } else if (key === 'Escape' || key === 'Delete') {
                this.basicEngine.clear();
            } else if (key === '%') {
                this.basicEngine.percent();
            } else if (key === 'Backspace') {
                this.backspace();
            } else {
                return;
            }

            this.updateDisplay();
        });
    }

    /**
     * Backspace - remove last digit
     */
    backspace() {
        if (this.basicEngine.currentOperand.length > 1) {
            this.basicEngine.currentOperand = this.basicEngine.currentOperand.slice(0, -1);
        } else {
            this.basicEngine.currentOperand = '0';
        }
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new CalculatorUI();
});
