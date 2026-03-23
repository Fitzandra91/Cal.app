/* ============================================================
   script.js – JavaScript Logic for the Calculator App (Cal.app)

   This file is responsible for all interactive behaviour:
     • Keeping track of what the user has typed (state management)
     • Updating the on-screen display in real time
     • Performing arithmetic when the user presses "="
     • Handling edge cases like division by zero or repeated "="

   The code is deliberately split into small, single-purpose
   functions so each one is easy to read and test in isolation.
   ============================================================ */

/* ------------------------------------------------------------------
   1. DOM References
   We grab references to the two display elements once here so we
   do not have to query the DOM repeatedly on every key press.
   querySelector returns the first matching element in the document.
   ------------------------------------------------------------------ */

/** The <span> that shows the previous expression (e.g. "8 + 3 =") */
const previousExpressionEl = document.querySelector('.previous-expression');

/** The <span> that shows the number currently being entered / the result */
const currentValueEl = document.querySelector('.current-value');

/* ------------------------------------------------------------------
   2. Application State
   These variables represent the complete state of the calculator.
   Keeping all state in one place makes it straightforward to reset
   or inspect the calculator at any point.
   ------------------------------------------------------------------ */

/** The number that was entered BEFORE pressing an operator */
let firstOperand = null;

/** The arithmetic operator the user chose (+, -, *, /) */
let operator = null;

/** The number currently displayed / being typed */
let currentInput = '0';

/** True once an operator has been pressed; the next digit starts a fresh number */
let shouldResetScreen = false;

/** The last complete expression shown above the current value */
let previousExpression = '';

/* ------------------------------------------------------------------
   3. updateDisplay()
   Writes the current application state to the two <span> elements
   in the HTML display area.
   Called after every state change so the UI always reflects reality.
   ------------------------------------------------------------------ */
function updateDisplay() {
  /* Show whatever is in the currentInput variable */
  currentValueEl.textContent = currentInput;

  /* Show the previous expression (empty string hides the line) */
  previousExpressionEl.textContent = previousExpression;
}

/* ------------------------------------------------------------------
   4. appendDigit(digit)
   Called when the user taps a digit button (0–9) or the decimal
   point button.
   @param {string} digit – the character on the pressed button
   ------------------------------------------------------------------ */
function appendDigit(digit) {
  /* If the last action was pressing an operator or "=", start fresh */
  if (shouldResetScreen) {
    currentInput = '';          /* clear the display for the new number */
    shouldResetScreen = false;  /* reset the flag so digits append normally */
  }

  /* Prevent more than one decimal point in a single number */
  if (digit === '.' && currentInput.includes('.')) {
    return; /* exit early – nothing to do */
  }

  /* Replace the initial placeholder '0' with the real digit UNLESS
     the user is adding a decimal (e.g. "0.5" is valid) */
  if (currentInput === '0' && digit !== '.') {
    currentInput = digit; /* overwrite the leading zero */
  } else {
    currentInput += digit; /* append the digit to the existing string */
  }

  /* Refresh the display to show the updated number */
  updateDisplay();
}

/* ------------------------------------------------------------------
   5. setOperator(op)
   Called when the user presses an operator button (+, −, ×, ÷).
   Saves the current number as the first operand and records which
   operator was chosen.
   @param {string} op – the operator symbol (+, -, *, /)
   ------------------------------------------------------------------ */
function setOperator(op) {
  /* If we already have both operands queued, calculate before chaining
     (e.g. "3 + 5 ×" should calculate "3 + 5 = 8" first) */
  if (firstOperand !== null && !shouldResetScreen) {
    calculate(); /* compute the pending operation */
  }

  /* Save the displayed number as the first operand (convert string → number) */
  firstOperand = parseFloat(currentInput);

  /* Remember which operator the user chose */
  operator = op;

  /* Show the pending expression above the current value */
  previousExpression = `${firstOperand} ${operatorSymbol(op)}`;

  /* The next digit press should clear the screen for the second operand */
  shouldResetScreen = true;

  /* Update the display to reflect the pending expression */
  updateDisplay();
}

/* ------------------------------------------------------------------
   6. operatorSymbol(op)
   Returns a human-readable symbol for the internal operator string.
   Used solely for constructing the previousExpression display string.
   @param {string} op – internal operator (+, -, *, /)
   @returns {string}  – display symbol (+, −, ×, ÷)
   ------------------------------------------------------------------ */
function operatorSymbol(op) {
  const symbols = {
    '+': '+',  /* addition: same symbol */
    '-': '−',  /* subtraction: proper minus sign U+2212 (matches &minus; in HTML) */
    '*': '×',  /* multiplication: use × (U+00D7) */
    '/': '÷',  /* division: use ÷ (U+00F7) */
  };
  return symbols[op] || op; /* fall back to the raw character if not found */
}

/* ------------------------------------------------------------------
   7. calculate()
   Performs the pending arithmetic operation and writes the result
   back to currentInput so it appears on the display.
   Called when the user presses "=" or chains operators.
   ------------------------------------------------------------------ */
function calculate() {
  /* Guard: do nothing if we do not have everything we need */
  if (operator === null || firstOperand === null) {
    return; /* exit early – nothing to calculate */
  }

  /* Convert the currently displayed string to a floating-point number */
  const secondOperand = parseFloat(currentInput);

  /* Build the expression string shown in the previous-expression line */
  previousExpression = `${firstOperand} ${operatorSymbol(operator)} ${secondOperand} =`;

  /* Perform the chosen arithmetic operation */
  let result;
  if (operator === '+') {
    result = firstOperand + secondOperand; /* addition */
  } else if (operator === '-') {
    result = firstOperand - secondOperand; /* subtraction */
  } else if (operator === '*') {
    result = firstOperand * secondOperand; /* multiplication */
  } else if (operator === '/') {
    /* Guard against dividing by zero, which is mathematically undefined */
    if (secondOperand === 0) {
      result = 'Error';  /* display a user-friendly error message */
    } else {
      result = firstOperand / secondOperand; /* division */
    }
  }

  /* Round floating-point results to avoid long trailing decimals
     caused by binary floating-point representation (e.g. 0.1 + 0.2) */
  if (typeof result === 'number') {
    /* toFixed(10) rounds to 10 decimal places; parseFloat trims trailing zeros */
    result = parseFloat(result.toFixed(10));
  }

  /* Write the result to the display */
  currentInput = String(result);

  /* Clear the operator so accidental second presses of "=" do nothing */
  operator = null;
  firstOperand = null;

  /* The next digit press should start a brand new number */
  shouldResetScreen = true;

  /* Refresh the display */
  updateDisplay();
}

/* ------------------------------------------------------------------
   8. allClear()
   Resets the entire calculator to its initial state.
   Equivalent to switching the calculator off and back on.
   ------------------------------------------------------------------ */
function allClear() {
  currentInput = '0';         /* reset display to zero */
  firstOperand = null;        /* discard any pending first operand */
  operator = null;            /* clear the operator */
  previousExpression = '';    /* clear the expression history line */
  shouldResetScreen = false;  /* reset the "start fresh" flag */
  updateDisplay();            /* refresh the UI */
}

/* ------------------------------------------------------------------
   9. toggleSign()
   Flips the sign of the currently displayed number between positive
   and negative (equivalent to multiplying by −1).
   ------------------------------------------------------------------ */
function toggleSign() {
  /* parseFloat converts the string to a number so we can negate it */
  currentInput = String(parseFloat(currentInput) * -1);
  updateDisplay(); /* refresh the display with the new sign */
}

/* ------------------------------------------------------------------
   10. applyPercentage()
   Converts the current display value to a percentage by dividing
   by 100. Useful for calculations like "15% of 80".
   ------------------------------------------------------------------ */
function applyPercentage() {
  /* Divide the current number by 100 and convert back to a string */
  currentInput = String(parseFloat(currentInput) / 100);
  updateDisplay(); /* refresh the display */
}

/* ------------------------------------------------------------------
   11. Keyboard Support
   Listening to the 'keydown' event on the document lets users
   operate the calculator with their physical keyboard, which is
   faster and more accessible than clicking buttons.
   ------------------------------------------------------------------ */
document.addEventListener('keydown', function (event) {
  /* event.key is the string representation of the key that was pressed */
  const key = event.key;

  /* Handle digit keys 0–9 */
  if (key >= '0' && key <= '9') {
    appendDigit(key); /* treat it the same as clicking a digit button */
  }

  /* Handle the decimal point key */
  else if (key === '.') {
    appendDigit('.'); /* append a decimal point */
  }

  /* Handle arithmetic operator keys */
  else if (key === '+' || key === '-' || key === '*' || key === '/') {
    /* Prevent '/' from triggering the browser's quick-find toolbar */
    event.preventDefault();
    setOperator(key); /* set the chosen operator */
  }

  /* Handle the Enter key (same as pressing "=") */
  else if (key === 'Enter' || key === '=') {
    calculate(); /* compute the result */
  }

  /* Handle the Backspace key to delete the last character */
  else if (key === 'Backspace') {
    deleteLast(); /* remove the most recently typed digit */
  }

  /* Handle Escape as "All Clear" */
  else if (key === 'Escape') {
    allClear(); /* reset the calculator */
  }

  /* Handle the percent key */
  else if (key === '%') {
    applyPercentage(); /* convert to percentage */
  }
});

/* ------------------------------------------------------------------
   12. deleteLast()
   Removes the last character from the current input string.
   If only one character remains, replace it with '0' so the display
   always shows at least a zero.
   ------------------------------------------------------------------ */
function deleteLast() {
  /* If we just computed a result, clear entirely on backspace */
  if (shouldResetScreen) {
    allClear(); /* treat backspace after "=" as a full reset */
    return;
  }

  /* Slice off the last character */
  currentInput = currentInput.slice(0, -1);

  /* If the string is now empty (or was a single character), show '0' */
  if (currentInput === '' || currentInput === '-') {
    currentInput = '0'; /* fall back to zero placeholder */
  }

  updateDisplay(); /* refresh the display */
}

/* ------------------------------------------------------------------
   13. Initial Display Update
   Run updateDisplay once when the page first loads so the display
   shows "0" rather than being blank.
   ------------------------------------------------------------------ */
updateDisplay();
