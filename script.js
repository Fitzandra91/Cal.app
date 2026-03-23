/* ============================================================
   script.js – Calculator Logic for Cal.app
   Handles number input, operators, and result computation.
   ============================================================ */

/* ----------------------------------------------------------
   1. STATE
   These variables track everything the calculator needs to
   remember between button clicks.
   ---------------------------------------------------------- */

/** The number currently being entered or the latest result */
let currentValue = '0';

/** The first operand stored before an operator is pressed */
let previousValue = '';

/** The operator that was last pressed (÷, ×, −, +) */
let currentOperator = null;

/** True when the next digit press should start a fresh number */
let shouldResetDisplay = false;

/**
 * Maximum number of significant digits shown in the result.
 * 10 is chosen to avoid floating-point artefacts (e.g. 0.1+0.2)
 * while keeping the display clean for typical calculator use.
 */
const RESULT_PRECISION = 10;

/* ----------------------------------------------------------
   2. DOM REFERENCES
   Cache the display elements so we don't query the DOM
   on every button click.
   ---------------------------------------------------------- */

/** Shows the running expression (e.g. "12 +") */
const expressionEl = document.getElementById('expression');

/** Shows the current input or computed result */
const resultEl = document.getElementById('result');

/* ----------------------------------------------------------
   3. DISPLAY UPDATE HELPER
   Syncs the DOM with the current state variables.
   ---------------------------------------------------------- */

/**
 * Updates both display rows.
 * @param {string} result     - Value shown in the large row.
 * @param {string} [expr='']  - Value shown in the small row.
 */
function updateDisplay(result, expr = '') {
  /* Write the current number/result to the display */
  resultEl.textContent = result;

  /* Write the running expression (can be empty) */
  expressionEl.textContent = expr;
}

/* ----------------------------------------------------------
   4. NUMBER INPUT HANDLER
   Appends a digit to the current value, or starts a fresh
   number if the previous action was an operator or equals.
   ---------------------------------------------------------- */

/**
 * Handles a digit (0-9) being pressed.
 * @param {string} digit - The digit character pressed.
 */
function handleNumber(digit) {
  if (shouldResetDisplay) {
    /* Begin a new number after operator/equals */
    currentValue = digit;
    shouldResetDisplay = false;
  } else if (currentValue === '0' && digit !== '.') {
    /* Replace the leading zero unless appending a decimal */
    currentValue = digit;
  } else {
    /* Append the digit (limit to 12 characters to fit the display) */
    if (currentValue.length < 12) {
      currentValue += digit;
    }
  }

  /* Refresh the display */
  updateDisplay(currentValue, buildExpression());
}

/* ----------------------------------------------------------
   5. DECIMAL INPUT HANDLER
   Adds a decimal point only if one is not already present.
   ---------------------------------------------------------- */

/**
 * Handles the "." button being pressed.
 */
function handleDecimal() {
  if (shouldResetDisplay) {
    /* Start "0." when decimal is pressed after an operator */
    currentValue = '0.';
    shouldResetDisplay = false;
  } else if (!currentValue.includes('.')) {
    /* Append decimal only when not already present */
    currentValue += '.';
  }

  updateDisplay(currentValue, buildExpression());
}

/* ----------------------------------------------------------
   6. OPERATOR HANDLER
   Stores the current value and the chosen operator, then
   waits for the second operand.
   ---------------------------------------------------------- */

/**
 * Handles an operator button (÷ × − +) being pressed.
 * @param {string} operator - The operator symbol pressed.
 */
function handleOperator(operator) {
  /* If we already have both operands, compute before chaining */
  if (previousValue !== '' && !shouldResetDisplay) {
    calculate();
  }

  /* Store the current value as the first operand */
  previousValue = currentValue;

  /* Remember which operator was chosen */
  currentOperator = operator;

  /* Next digit press should start a new number */
  shouldResetDisplay = true;

  /* Highlight the active operator button */
  highlightOperator(operator);

  /* Show the stored value and operator in the expression row */
  updateDisplay(currentValue, buildExpression());
}

/* ----------------------------------------------------------
   7. CALCULATE (EQUALS)
   Computes the result of previousValue <operator> currentValue
   and shows it on the display.
   ---------------------------------------------------------- */

/**
 * Performs the arithmetic and updates the display with the result.
 */
function calculate() {
  /* Guard: need both operands and an operator to proceed */
  if (previousValue === '' || currentOperator === null) return;

  /* Parse both operands as floating-point numbers */
  const prev = parseFloat(previousValue);
  const curr = parseFloat(currentValue);

  /* Build the expression string for the secondary display row */
  const expr = `${previousValue} ${currentOperator} ${currentValue} =`;

  let result;

  /* Perform the correct arithmetic operation */
  switch (currentOperator) {
    case '+':
      result = prev + curr;
      break;
    case '−':
      result = prev - curr;
      break;
    case '×':
      result = prev * curr;
      break;
    case '÷':
      /* Guard against division by zero */
      result = curr === 0 ? 'Error' : prev / curr;
      break;
    default:
      return;
  }

  /* Round to avoid floating-point display artefacts (e.g. 0.1 + 0.2) */
  if (typeof result === 'number') {
    result = parseFloat(result.toPrecision(RESULT_PRECISION)).toString();
  }

  /* Update state: result becomes the new current value */
  currentValue = result.toString();
  previousValue = '';
  currentOperator = null;
  shouldResetDisplay = true;

  /* Clear the active-operator highlight */
  clearOperatorHighlight();

  /* Update the display: large row = result, small row = expression */
  updateDisplay(currentValue, expr);
}

/* ----------------------------------------------------------
   8. CLEAR (AC) HANDLER
   Resets all state back to the initial zero condition.
   ---------------------------------------------------------- */

/**
 * Resets the calculator to its initial state.
 */
function handleClear() {
  /* Reset all state variables */
  currentValue      = '0';
  previousValue     = '';
  currentOperator   = null;
  shouldResetDisplay = false;

  /* Clear any active-operator highlight */
  clearOperatorHighlight();

  /* Show "0" in the display */
  updateDisplay('0', '');
}

/* ----------------------------------------------------------
   9. SIGN TOGGLE (+/−) HANDLER
   Flips the sign of the currently displayed number.
   ---------------------------------------------------------- */

/**
 * Toggles the positive/negative sign of the current value.
 */
function handleSign() {
  /* Avoid toggling zero or an error state */
  if (currentValue === '0' || currentValue === 'Error') return;

  /* Flip the sign by multiplying by -1 */
  currentValue = (parseFloat(currentValue) * -1).toString();

  updateDisplay(currentValue, buildExpression());
}

/* ----------------------------------------------------------
   10. PERCENT (%) HANDLER
   Converts the current value to its percentage equivalent.
   ---------------------------------------------------------- */

/**
 * Divides the current value by 100.
 */
function handlePercent() {
  if (currentValue === 'Error') return;

  /* Divide by 100 and limit decimal places */
  currentValue = (parseFloat(currentValue) / 100).toString();

  updateDisplay(currentValue, buildExpression());
}

/* ----------------------------------------------------------
   11. EXPRESSION BUILDER HELPER
   Builds the small "expression" string shown above the
   main result (e.g. "12 +").
   ---------------------------------------------------------- */

/**
 * Returns a string representing the in-progress expression.
 * @returns {string}
 */
function buildExpression() {
  if (currentOperator === null) return '';
  return `${previousValue} ${currentOperator}`;
}

/* ----------------------------------------------------------
   12. OPERATOR BUTTON HIGHLIGHT HELPERS
   Gives the active operator button a purple outline ring
   (via the CSS class "is-active") so users can see which
   operator is queued.
   ---------------------------------------------------------- */

/**
 * Adds the "is-active" class to the operator button matching
 * the given operator symbol.
 * @param {string} operator - The operator symbol to highlight.
 */
function highlightOperator(operator) {
  /* First clear any existing highlight */
  clearOperatorHighlight();

  /* Find the matching operator button and mark it active */
  document.querySelectorAll('.btn--operator').forEach(btn => {
    if (btn.dataset.value === operator) {
      btn.classList.add('is-active');
    }
  });
}

/**
 * Removes the "is-active" class from all operator buttons.
 */
function clearOperatorHighlight() {
  document.querySelectorAll('.btn--operator').forEach(btn => {
    btn.classList.remove('is-active');
  });
}

/* ----------------------------------------------------------
   13. EVENT LISTENER
   A single delegated click listener on the button grid
   dispatches each button press to the correct handler.
   ---------------------------------------------------------- */

/**
 * Master click handler attached to the button grid.
 * Uses event delegation so only one listener is needed.
 */
document.querySelector('.button-grid').addEventListener('click', function (e) {
  /* Find the closest button element (handles clicks on child nodes) */
  const btn = e.target.closest('.btn');
  if (!btn) return; /* Ignore clicks outside buttons */

  /* Read the action type and optional value from data attributes */
  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  /* Dispatch to the appropriate handler */
  switch (action) {
    case 'number':
      handleNumber(value);
      break;
    case 'decimal':
      handleDecimal();
      break;
    case 'operator':
      handleOperator(value);
      break;
    case 'equals':
      calculate();
      break;
    case 'clear':
      handleClear();
      break;
    case 'sign':
      handleSign();
      break;
    case 'percent':
      handlePercent();
      break;
  }
});

/* ----------------------------------------------------------
   14. KEYBOARD SUPPORT
   Maps keyboard keys to their corresponding calculator
   actions so the app can be used without a mouse.
   ---------------------------------------------------------- */

/**
 * Handles keyboard input for calculator operations.
 */
document.addEventListener('keydown', function (e) {
  /* Digits 0-9 */
  if (e.key >= '0' && e.key <= '9') {
    handleNumber(e.key);
  }
  /* Decimal point */
  else if (e.key === '.') {
    handleDecimal();
  }
  /* Addition */
  else if (e.key === '+') {
    handleOperator('+');
  }
  /* Subtraction */
  else if (e.key === '-') {
    handleOperator('−');
  }
  /* Multiplication (asterisk on keyboard) */
  else if (e.key === '*') {
    handleOperator('×');
  }
  /* Division (forward slash on keyboard) */
  else if (e.key === '/') {
    e.preventDefault(); /* Prevent browser's quick-find */
    handleOperator('÷');
  }
  /* Equals or Enter key triggers calculation */
  else if (e.key === 'Enter' || e.key === '=') {
    calculate();
  }
  /* Escape or Delete clears the calculator */
  else if (e.key === 'Escape' || e.key === 'Delete') {
    handleClear();
  }
  /* Backspace removes the last character */
  else if (e.key === 'Backspace') {
    if (currentValue.length > 1 && currentValue !== 'Error') {
      currentValue = currentValue.slice(0, -1);
    } else {
      currentValue = '0';
    }
    updateDisplay(currentValue, buildExpression());
  }
  /* Percent key */
  else if (e.key === '%') {
    handlePercent();
  }
});
