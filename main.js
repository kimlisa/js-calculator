const MAX_CHARS = 8;
const MAX_SM_CHARS = 25;
var infix = [];     // store expression as elements
var tempInput = ""; // used to join char digit inputs as one string value
var decimalUsed = false;
var equalUsed = false;
var maxDigitMet = false;
var dividingByZero = false;


// target display and store target into variable
var smScreen = document.getElementById('upper-screen');
var mainScreen = document.getElementById('main-screen');

// resets the screen and variable if not already cleared
function clearScreen() {
  // reassign font values, if changed
  mainScreen.style.fontSize = '230%';
  smScreen.style.fontSize = '60%';

  // reset screens to 0
  smScreen.firstChild.textContent = "0";
  mainScreen.firstChild.textContent = "0";

  // reset global variables
  maxDigitMet = false;
  decimalUsed = false;
  equalUsed = false;
  infix = [];
  tempInput = "";
}

function maxCharReached() {
  clearScreen();
  mainScreen.textContent = "0";
  smScreen.textContent = "MAX DIGIT MET";
  smScreen.style.fontSize = '100%';
  maxDigitMet = true;
}

function divideByZero() {
  clearScreen();
  mainScreen.textContent = "Division by Zero";
  smScreen.textContent = "Error";
  smScreen.style.fontSize = '100%';
  mainScreen.style.fontSize = '100%';
}
// assign and return a made up weight value for operator precedence
function operatorPrecedence(key) {
  if(key == "+" || key == "-") {
    return 0;
  }
  else {
    return 1;  // divide or multiply
  }
}

// convert infix expression to postfix and return postfix
function convertToPostFix() {
  var postfix = [];
  var stack = [];

  // while reading one element at a time
  for(var i = 0; i < infix.length; i++) {
    if(Number(infix[i]) == infix[i]) { // if operand (digit)
      postfix.push(infix[i]);   // append to postfix
    }
    else { // if operator
      while ((stack.length != 0)
      && (operatorPrecedence(infix[i])
        <= operatorPrecedence(stack[stack.length -1]))){
        // stack is LIFO, pops last element in array
        postfix.push(stack.pop());
      }
      stack.push(infix[i]);
    }
  }
  // append leftover in stack to postfix expression
  while(stack.length != 0) {
    postfix.push(stack.pop());
  }
  return postfix;
}

// sumTotal the expression in postfix and return it as a digit
function evaluatePostFix(postfix) {
  var stack = [];
  var sumTotal = 0;
  for(var i = 0; i < postfix.length; i++) {
    if(Number(postfix[i]) == postfix[i]) {
      stack.push(Number(postfix[i]));
    }
    else {  // operator
      switch(postfix[i]) {
        case "+":
          sumTotal = stack.pop() + stack.pop();
          break;
        case "-":
          var secondOperand = stack.pop();
          sumTotal = stack.pop() - secondOperand;
          break;
        case "*":
          sumTotal = stack.pop() * stack.pop();
          break;
        case "/":
          var secondOperand = stack.pop();
          if(secondOperand == "0") {
            dividingByZero = true;
          }
          else {
            sumTotal = stack.pop() / secondOperand;
          }
          break;
      }
      if(dividingByZero) { // break out of for loop
        break;
      }
      if(sumTotal % 1 != 0) {  // decimal
        var countDigit = sumTotal.toString().split('');
        var digitLength = countDigit.length - 1;

        // determine appropriate precision
        for(var i = digitLength; ; i--) {
          if(Number(sumTotal).toPrecision(i).length < 7) {
            sumTotal = Number(sumTotal).toPrecision(i);
            break;
          }
        }
      }
      stack.push(sumTotal);
    } // end of for if
  } // end of for loop
  return Number(sumTotal);
}

// calls convert, evaluate, and displays the sumTotal to mainScreen
function pressedEqual() {
  // check if last char in expression is a number else do nothing
  if(tempInput != "" && !equalUsed) {
    infix.push(tempInput.toString());
    equalUsed = true;
    if(infix.length > 1){
      var postfix = convertToPostFix()
      var sumTotal = evaluatePostFix(postfix);
    }
    else {
      sumTotal = infix.pop();  // only one element
    }

    // prevent overflowing of digits
    if(dividingByZero) {
      divideByZero();
    }
    else if(sumTotal.toString().length <= MAX_CHARS) {
      mainScreen.textContent = sumTotal;
    }
    else {
      maxCharReached();
    }
  }
}

// concatenates input to infix array
function keyPress(key) {

  var skip = false;
  if(maxDigitMet || dividingByZero) {
    clearScreen();
    dividingByZero = false;
  }
  else if(equalUsed) {
    if(Number.isInteger(Number(key))) {  // reset everything, start over
      clearScreen();
    }
    else if(key != "decimal") {  // continue concatenating from sumTotal
      smScreen.firstChild.nodeValue = mainScreen.firstChild.nodeValue;
      infix = [];
      tempInput = [];
      tempInput = (mainScreen.firstChild.nodeValue).toString();
    }
    else {
      skip = true;
    }
    if(!skip){
      equalUsed = false;  // reset
    }
  }

  // begin concatenating process
  if(!skip){
    var lenOfExpression = infix.length;
    var lenMainScreen = mainScreen.firstChild.nodeValue.length;
    var lenSmScreen = smScreen.firstChild.nodeValue.length;

    if(lenSmScreen < MAX_SM_CHARS) {
      var lastValue = tempInput[tempInput.length - 1];
      // if passed in key is a digit
      if(Number.isInteger(key)){
        var maxReached = false;
        // first value
        if(Number.isInteger(key) && lenOfExpression == 0
          && lastValue == undefined){
          //update displays
          mainScreen.firstChild.nodeValue = key;
          smScreen.firstChild.nodeValue = "";
        }
        else if(lastValue == "."){
          // replace the main screen display with the digit
          mainScreen.firstChild.nodeValue += key;
        }
        else if(Number(lastValue) != lastValue) {	// lastvalue is an operator
          mainScreen.firstChild.nodeValue = key;
        }
        else if(lenMainScreen < MAX_CHARS) { // append the digit to the last value digit or decimal
          mainScreen.textContent += key;
        }
        else {
          maxCharReached();
          maxReached = true;
        }

        // update small screen and concat digit
        if(!maxReached) {
          smScreen.textContent += key;
          tempInput += key;
        }
      }
      else {  // passed in key is an operator or a decimal
        var infixLastValue = infix[lenOfExpression - 1];
        if(key == "decimal") {
          if(!decimalUsed) {
            decimalUsed = true;
            tempInput += "."; // append decimal to expression

            //update displays
            if(lenOfExpression == 0) {
              smScreen.textContent += ".";
              mainScreen.textContent += ".";
            }
            else {
              smScreen.textContent += 0 +  ".";
              mainScreen.textContent = 0 + ".";
            }
          }
          // else do nothing
        }
        else if((Number(infixLastValue) == infixLastValue)
          || (tempInput != "" && (Number(tempInput) == tempInput))) {  // load operator
          if(lenSmScreen < MAX_SM_CHARS) {
            infix.push(tempInput.toString());
            var displayOperator;
            switch(key) {
              case "divide":
                infix.push("/");
                displayOperator = "/";
                break;
              case "multiply":
                infix.push("*");
                displayOperator = "*";
                break;
              case "plus":
                infix.push("+");
                displayOperator = "+";
                break;
              case "minus":
                infix.push("-");
                displayOperator = "-";
                break;
            }
            // update screen
            mainScreen.firstChild.nodeValue = displayOperator;
            smScreen.textContent += " " + displayOperator + " ";
            tempInput = ""; // clear temp
            decimalUsed = false;
          }
          else {
            maxCharReached();
          }
        }
        // else do nothing
      } // end of inner else
    } // end of outer if
    else {
      maxCharReached();
    }
  }
}

// determine what keys or buttons pressed
function determineKeys(e) {
  // e is the event object
  // every time an event is fired, an event object is created
  // and contains helpful data about the event
  // e.target gets the element that the user clicked on
  // e.target.firstChild grabs the text node
  // nodeValue returns the value of the text node
  var target;
  if(e.key === undefined) {  // for click events
    target = e.target.firstChild.nodeValue;
  }
  else {					  // for keypress events
    target = e.key;
  }

  switch(target) {
    case "0":
      keyPress(0);
      break;
    case "1":
      keyPress(1);
      break;
    case "2":
      keyPress(2);
      break;
    case "3":
      keyPress(3);
      break;
    case "4":
      keyPress(4);
      break;
    case "5":
      keyPress(5);
      break;
    case "6":
      keyPress(6);
      break;
    case "7":
      keyPress(7);
      break;
    case "8":
      keyPress(8);
      break;
    case "9":
      keyPress(9);
      break;
    case ".":
      keyPress("decimal");
      break;
    case "/":
      keyPress("divide");
      break;
    case "x":
      keyPress("multiply");
      break;
    case "*":
      keyPress("multiply");
      break;
    case "-":
      keyPress("minus");
      break;
    case "+":
      keyPress("plus");
      break;
    case "AC":
      clearScreen();
      break;
    case "Escape":
      clearScreen();
      break;
    case "Backspace":
      clearScreen();
      break;
    case "=":
      pressedEqual();
      break;
    case "Enter":
      pressedEqual();
      break;
  } // end of switch
}

// Event listener for pressing buttons
// Uses event delegation that uses ONE event listener
//  on the container "buttons" that contains all buttons
// Too many event listeners can use a lot of memory and
//  slow down performance
var el = document.getElementById('buttons');
el.addEventListener('click', function(e) {
  determineKeys(e);
});

// // event listener for pressed keys
// document.addEventListener('keypress',function(e) {      // does not recognize esc or delete keys
// 	determineKeys(e);
// });

// event listener for buttons
document.addEventListener('keyup', function(e) {
  determineKeys(e);
});

