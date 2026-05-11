'use strict';

class Calculator {
  constructor() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.shouldResetScreen = false;
    this.expression = '';

    this.resultEl = document.getElementById('result');
    this.expressionEl = document.getElementById('expression');

    this.init();
  }

  init() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.createRipple(e, btn);
        this.handleButton(btn);
      });
    });

    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  createRipple(e, btn) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = `${e.clientX - rect.left - 40}px`;
    ripple.style.top = `${e.clientY - rect.top - 40}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }

  handleButton(btn) {
    const type = btn.dataset.type;
    const value = btn.dataset.value;

    switch (type) {
      case 'number':   this.inputNumber(value); break;
      case 'decimal':  this.inputDecimal(); break;
      case 'operator': this.inputOperator(value); break;
      case 'equals':   this.calculate(); break;
      case 'clear':    this.clear(); break;
      case 'toggle':   this.toggleSign(); break;
      case 'percent':  this.percent(); break;
      case 'backspace': this.backspace(); break;
    }
  }

  handleKeyboard(e) {
    if (e.key >= '0' && e.key <= '9') this.inputNumber(e.key);
    else if (e.key === '.') this.inputDecimal();
    else if (e.key === '+') this.inputOperator('+');
    else if (e.key === '-') this.inputOperator('−');
    else if (e.key === '*') this.inputOperator('×');
    else if (e.key === '/') { e.preventDefault(); this.inputOperator('÷'); }
    else if (e.key === 'Enter' || e.key === '=') this.calculate();
    else if (e.key === 'Escape') this.clear();
    else if (e.key === 'Backspace') this.backspace();
    else if (e.key === '%') this.percent();
  }

  inputNumber(num) {
    if (this.shouldResetScreen) {
      this.currentValue = num;
      this.shouldResetScreen = false;
    } else {
      this.currentValue = this.currentValue === '0'
        ? num
        : this.currentValue + num;
    }
    if (this.currentValue.length > 12) return;
    this.updateDisplay();
  }

  inputDecimal() {
    if (this.shouldResetScreen) {
      this.currentValue = '0.';
      this.shouldResetScreen = false;
      this.updateDisplay();
      return;
    }
    if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
      this.updateDisplay();
    }
  }

  inputOperator(op) {
    if (this.operator && !this.shouldResetScreen) {
      this.calculate(true);
    }

    this.previousValue = this.currentValue;
    this.operator = op;
    this.shouldResetScreen = true;
    this.expression = `${this.formatDisplay(this.previousValue)} ${op}`;
    this.updateDisplay();
  }

  calculate(chaining = false) {
    if (!this.operator || !this.previousValue) return;

    const prev = parseFloat(this.previousValue);
    const curr = parseFloat(this.currentValue);
    let result;

    switch (this.operator) {
      case '+': result = prev + curr; break;
      case '−': result = prev - curr; break;
      case '×': result = prev * curr; break;
      case '÷':
        if (curr === 0) {
          this.showError('Divisão por zero');
          return;
        }
        result = prev / curr;
        break;
      default: return;
    }

    if (!chaining) {
      this.expression = `${this.formatDisplay(prev)} ${this.operator} ${this.formatDisplay(curr)} =`;
    }

    this.currentValue = this.formatResult(result);
    this.operator = null;
    this.previousValue = '';
    this.shouldResetScreen = !chaining;
    this.updateDisplay();
  }

  formatResult(num) {
    if (isNaN(num) || !isFinite(num)) return 'Erro';
    const str = num.toPrecision(10).replace(/\.?0+$/, '');
    return str.length > 12 ? num.toExponential(4) : str;
  }

  formatDisplay(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('pt-BR', { maximumFractionDigits: 10 });
  }

  clear() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.shouldResetScreen = false;
    this.expression = '';
    this.resultEl.classList.remove('error');
    this.updateDisplay();
  }

  backspace() {
    if (this.shouldResetScreen) return;
    this.currentValue = this.currentValue.length > 1
      ? this.currentValue.slice(0, -1)
      : '0';
    this.updateDisplay();
  }

  toggleSign() {
    if (this.currentValue === '0') return;
    this.currentValue = this.currentValue.startsWith('-')
      ? this.currentValue.slice(1)
      : '-' + this.currentValue;
    this.updateDisplay();
  }

  percent() {
    const val = parseFloat(this.currentValue);
    this.currentValue = this.formatResult(
      this.previousValue && this.operator
        ? (parseFloat(this.previousValue) * val) / 100
        : val / 100
    );
    this.updateDisplay();
  }

  showError(msg) {
    this.resultEl.textContent = msg;
    this.resultEl.classList.add('error');
    this.resultEl.classList.remove('has-value');
    this.expressionEl.textContent = '';
    setTimeout(() => this.clear(), 2000);
  }

  updateDisplay() {
    this.expressionEl.textContent = this.expression;

    const display = this.currentValue;
    this.resultEl.textContent = display;
    this.resultEl.classList.remove('error');
    this.resultEl.classList.toggle('has-value', display !== '0' && !this.shouldResetScreen);

    // Shrink font for long numbers
    const len = display.replace('-', '').replace('.', '').length;
    this.resultEl.style.fontSize = len > 9 ? '26px' : len > 7 ? '32px' : '';
  }
}

document.addEventListener('DOMContentLoaded', () => new Calculator());