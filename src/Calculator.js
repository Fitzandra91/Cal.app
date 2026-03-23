import React, { useState } from 'react';
import './Calculator.css';

const BUTTONS = [
  { label: 'AC',  type: 'action',   action: 'clear'   },
  { label: '+/-', type: 'action',   action: 'toggle'  },
  { label: '%',   type: 'action',   action: 'percent' },
  { label: '÷',   type: 'operator', value: '/'        },
  { label: '7',   type: 'digit',    value: '7'        },
  { label: '8',   type: 'digit',    value: '8'        },
  { label: '9',   type: 'digit',    value: '9'        },
  { label: '×',   type: 'operator', value: '*'        },
  { label: '4',   type: 'digit',    value: '4'        },
  { label: '5',   type: 'digit',    value: '5'        },
  { label: '6',   type: 'digit',    value: '6'        },
  { label: '−',   type: 'operator', value: '-'        },
  { label: '1',   type: 'digit',    value: '1'        },
  { label: '2',   type: 'digit',    value: '2'        },
  { label: '3',   type: 'digit',    value: '3'        },
  { label: '+',   type: 'operator', value: '+'        },
  { label: '0',   type: 'digit',    value: '0', wide: true },
  { label: '.',   type: 'digit',    value: '.'        },
  { label: '=',   type: 'equals'                      },
];

function applyOperator(a, op, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  switch (op) {
    case '+': return numA + numB;
    case '-': return numA - numB;
    case '*': return numA * numB;
    case '/': return numB !== 0 ? numA / numB : 'Error';
    default:  return numB;
  }
}

function formatResult(value) {
  if (value === 'Error') return 'Error';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return parseFloat(num.toPrecision(10)).toString();
}

export default function Calculator() {
  const [display, setDisplay]               = useState('0');
  const [firstOperand, setFirstOperand]     = useState(null);
  const [operator, setOperator]             = useState(null);
  const [waitingForNext, setWaitingForNext] = useState(false);

  function handleDigit(digit) {
    if (waitingForNext) {
      setDisplay(digit === '.' ? '0.' : digit);
      setWaitingForNext(false);
      return;
    }
    if (digit === '.' && display.includes('.')) return;
    const raw = display.replace('-', '').replace('.', '');
    if (raw.length >= 9) return;
    setDisplay(display === '0' && digit !== '.' ? digit : display + digit);
  }

  function handleOperator(op) {
    const current = parseFloat(display);
    if (firstOperand !== null && !waitingForNext) {
      const result = applyOperator(firstOperand, operator, current);
      const str = formatResult(result.toString());
      setDisplay(str);
      setFirstOperand(result === 'Error' ? null : result);
    } else {
      setFirstOperand(current);
    }
    setOperator(op);
    setWaitingForNext(true);
  }

  function handleEquals() {
    if (firstOperand === null || operator === null) return;
    const result = applyOperator(firstOperand, operator, parseFloat(display));
    setDisplay(formatResult(result.toString()));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForNext(true);
  }

  function handleClear() {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForNext(false);
  }

  function handleToggle() {
    if (display === 'Error') return;
    setDisplay((parseFloat(display) * -1).toString());
  }

  function handlePercent() {
    if (display === 'Error') return;
    setDisplay((parseFloat(display) / 100).toString());
  }

  function onButton(btn) {
    if (btn.type === 'digit')         handleDigit(btn.value);
    else if (btn.type === 'operator') handleOperator(btn.value);
    else if (btn.type === 'equals')   handleEquals();
    else if (btn.action === 'clear')   handleClear();
    else if (btn.action === 'toggle')  handleToggle();
    else if (btn.action === 'percent') handlePercent();
  }

  return (
    <div className="calculator" role="application" aria-label="Calculator">
      <div className="display">
        <span className="display-value" data-testid="display">{display}</span>
      </div>
      <div className="buttons">
        {BUTTONS.map((btn) => (
          <button
            key={btn.label}
            aria-label={btn.label}
            className={[
              'btn',
              btn.type === 'operator' ? 'btn-operator' : '',
              btn.type === 'equals'   ? 'btn-equals'   : '',
              btn.type === 'action'   ? 'btn-action'   : '',
              btn.wide                ? 'btn-wide'      : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onButton(btn)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
