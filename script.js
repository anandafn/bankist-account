'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2022-02-18T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // else {
  //   const day = `${date.getDate()}`.padStart(2, '0');
  //   const month = `${date.getMonth() + 1}`.padStart(2, '0');
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCurrencyLocale = function (value, locale, currency) {
  // Formatted currency based on locale
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // To sort the movements, we need the slice method so the original array will NOT mutated
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov < 0 ? 'withdrawal' : 'deposit';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // Formatted currency based on locale
    const formattedMov = formatCurrencyLocale(mov, acc.locale, acc.currency);

    // const formattedMov = new Intl.NumberFormat(acc.locale, {
    //   style: 'currency',
    //   currency: acc.currency,
    // }).format(mov);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type.toUpperCase()}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((accu, current) => accu + current, 0);
  const formattedBalance = formatCurrencyLocale(
    acc.balance,
    acc.locale,
    acc.currency
  );
  labelBalance.textContent = `${formattedBalance}`;
};

const calcDisplaySummary = function (acc) {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((accu, current) => accu + current, 0);
  const formattedIncome = formatCurrencyLocale(
    income,
    acc.locale,
    acc.currency
  );
  labelSumIn.textContent = `${formattedIncome}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((accu, current) => accu + current, 0);
  const formattedOut = formatCurrencyLocale(
    Math.abs(out),
    acc.locale,
    acc.currency
  );
  labelSumOut.textContent = `${formattedOut}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((accu, current) => accu + current, 0);
  const formattedInterest = formatCurrencyLocale(
    interest,
    acc.locale,
    acc.currency
  );
  labelSumInterest.textContent = `${formattedInterest}`;
};

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);

const updateUiAmount = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Make a timer, and log out automatically once the timer reached 0
const startLogOutTimer = function () {
  const tick = function () {
    const minute = String(Math.trunc(time / 60)).padStart(2, 0);
    const second = String(time % 60).padStart(2, 0);

    // In each callback call, print the remaining time to the UI
    labelTimer.textContent = `${minute}:${second}`;

    // When reached 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease every 1 second
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call the tick function immediately
  tick();

  // Call the timer every second
  const timer = setInterval(tick, 1000);
  return timer;
};

// Event handler
let currentAccount, timer;

// FAKE LOGGED IN
// currentAccount = account1;
// updateUiAmount(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display the UI
    containerApp.style.opacity = 100;

    // DATE
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth() + 1}`.padStart(2, '0'); // Remember that month using 0 index so it needs to be plus 1
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, '0');
    // const minute = `${now.getMinutes()}`.padStart(2, '0');
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;

    // Internationalizing current date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // To navigate what language the user use
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // Clear input user and PIN fields
    // inputLoginUsername.value = '';
    // inputLoginPin.value = '';
    // Those things above could be written like this
    inputLoginUsername.value = inputLoginPin.value = '';

    // To remove the cursor blinking in input field after clicking enter
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer); // If there is already timer (there is user login and then the user log out) will then clear the timer. After clearing the timer, the timer will then starting again (the timer function below)
    timer = startLogOutTimer();

    updateUiAmount(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  // Prevent the browser refresh, after the form got submitted
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // On the sender account
    currentAccount.movements.push(-amount);

    // On the receiver account
    receiverAcc.movements.push(amount);

    // Date of transfering the money (On sender account)
    currentAccount.movementsDates.push(new Date().toISOString());

    // Date of receiving the money (On receiver account)
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update the UI amount
    updateUiAmount(currentAccount);

    // Clear input transfer to and amount fields
    inputTransferTo.value = inputTransferAmount.value = '';

    // Reset the timer after transferring
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // The requested loan will added to the movements after 3 seconds by using setTimeOut function
    setTimeout(function () {
      // Add the movement
      currentAccount.movements.push(amount);

      // Fix the date UI
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update the UI
      updateUiAmount(currentAccount);
    }, 3000);
  }

  inputLoanAmount.value = '';

  // Reset the timer after hit the loan submit button
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const deleteIndex = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Delete account
    accounts.splice(deleteIndex, 1);

    // Hide the UI once the account has been deleted
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted);

  // Menunjukkan keadaan movements saat ini, baik itu sorted (true) atau unsorted (false)
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Making a function that will generates random number between min and max
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 30));

// setTimeOut (Schedules a function to run after a certain amount of time and the callback only run ONCE)
const ings = ['Tomato', 'Spinach', 'Mushrooms', 'Cheese'];

const pizzaMaking = setTimeout(
  function (...ings) {
    console.log(`Here is your pizza with ${ings.join(', ').toLowerCase()}.`);
  },
  3000,
  ...ings
);

// setInterval (run the function EVERYTIME based on certain amount of time)
// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 2000);
