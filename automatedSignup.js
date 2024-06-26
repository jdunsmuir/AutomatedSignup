let seatOrderPreference = [];

class HomePage {
  constructor() {
    this.maxPages = 3;
    this.arrows = {
      left: document.getElementsByClassName('IconWidget---large')[0],
      right: document.getElementsByClassName('IconWidget---large')[1],
    };
    this.updateActiveSignupButtons();
  }
  getSignupButtons() {
    let buttons = document.getElementsByTagName('button');
    let signupButtons = [];
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].innerText == 'SIGN UP') signupButtons.push(buttons[i]);
    }
    return signupButtons;
  }
  pressRightArrow() {
    this.arrows.right.click();
  }
  updateActiveSignupButtons() {
    this.activeSignupButtons = this.getSignupButtons();
  }
  pageHasSignUpButtons() {
    return this.activeSignupButtons.length > 0;
  }
  pressSignUpButton() {
    for (let i = 0; i < this.activeSignupButtons.length; i++) {
      let button = this.activeSignupButtons[i];
      let buttonText = button.innerText;
      if (buttonText == 'SIGN UP') button.click();
    }
  }
}

class SignUpPage {
  constructor(seatOrderPreference) {
    this.updateGridControls();
    this.availableSeats = [];
    this.seatOrderPreference = seatOrderPreference;
  }

  updateGridControls() {
    let numberOfPagingControls = document.getElementsByClassName('GridFooter---inGridPagingControl').length;

    let firstElementIndex = numberOfPagingControls == 4 ? 0 : null;
    let firstElement = firstElementIndex == null ? undefined : document.getElementsByClassName('GridFooter---inGridPagingControl')[firstElementIndex];

    let previousElementIndex = numberOfPagingControls == 4 ? 1 : numberOfPagingControls == 2 ? 0 : null;
    let previousElement = previousElementIndex == null ? undefined : document.getElementsByClassName('GridFooter---inGridPagingControl')[previousElementIndex];

    let nextElementIndex = numberOfPagingControls == 4 ? 2 : numberOfPagingControls == 2 ? 1 : null;
    let nextElement = nextElementIndex == null ? undefined : document.getElementsByClassName('GridFooter---inGridPagingControl')[nextElementIndex];

    let lastElementIndex = numberOfPagingControls == 4 ? 3 : null;
    let lastElement = lastElementIndex == null ? undefined : document.getElementsByClassName('GridFooter---inGridPagingControl')[lastElementIndex];

    this.gridControls = {
      first: {
        element: firstElement == undefined ? null : firstElement,
        isActive: firstElement != undefined && firstElement.ariaDisabled == 'false' ? true : false,
      },
      previous: {
        element: previousElement == undefined ? null : previousElement,
        isActive: previousElement != undefined && previousElement.ariaDisabled == 'false' ? true : false,
      },
      next: {
        element: nextElement == undefined ? null : nextElement,
        isActive: nextElement != undefined && nextElement.ariaDisabled == 'false' ? true : false,
      },
      last: {
        element: lastElement == undefined ? null : lastElement,
        isActive: lastElement != undefined && lastElement.ariaDisabled == 'false' ? true : false,
      },
    };
  }

  async getTableData() {
    do {
      this.updateGridControls();
      let tableData = document.getElementsByTagName('td');
      for (let i = 0; i < tableData.length; i++) {
        this.availableSeats.push(tableData[i].innerText);
      }
      if (this.gridControls.next.isActive) await this.pressTableNextButton();
    } while (this.gridControls.next.isActive == true);
  }

  pickSeat() {
    for (let i = 0; i < this.seatOrderPreference.length; i++) {
      const preference = this.seatOrderPreference[i];
      if (this.availableSeats.includes(preference)) return preference;
    }
    return null;
  }

  async selectTheChosenSeat(chosenSeat) {
    this.updateGridControls();
    if (this.gridControls.first.isActive == true) {
      await this.pressTableFirstButton();
    } else if (this.gridControls.previous.isActive) {
      await this.pressTablePreviousButton();
    }
    do {
      this.updateGridControls();
      let tableData = document.getElementsByTagName('td');
      for (let i = 0; i < tableData.length; i++) {
        if (tableData[i].innerText == chosenSeat) {
          tableData[i].click();
          return true;
        }
      }
      await this.pressTableNextButton();
    } while (this.gridControls.next.isActive == true);
    return false;
  }

  async pressTableFirstButton() {
    await this.pressPagingControls('first');
  }
  async pressTablePreviousButton() {
    await this.pressPagingControls('previous');
  }
  async pressTableNextButton() {
    await this.pressPagingControls('next');
  }
  async pressTableLastButton() {
    await this.pressPagingControls('last');
  }

  async pressPagingControls(button) {
    this.gridControls[button].element.click();
    await waitForAllRequestedResolved();
  }

  async clickPeriodMenu(dropdownMenu) {
    dropdownMenu.click();
    await waitForAllRequestedResolved(1000);
  }

  async pressReserveButton() {
    let buttons = document.getElementsByTagName('button');
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].innerText == 'RESERVE') {
        buttons[i].click();
        await waitForAllRequestedResolved();
        return;
      }
    }
  }
}

const arePendingRequests = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(false); // No pending requests
        } else {
          resolve(true); // Pending requests
        }
      }
    };

    xhr.open('GET', '/');
    xhr.send();
  });
};

const isLoadingBarShowing = () => {
  let loadingBar = document.getElementById('appian-nprogress');
  if (loadingBar == undefined) return false;
  let loadingBarChildren = loadingBar.children;
  if (loadingBarChildren == undefined) return false;
  return loadingBarChildren[0].offsetHeight > 0;
};

const waitForAllRequestedResolved = async () => {
  await delay(3000);
  let loadingBarShowing = isLoadingBarShowing();
  let hasPendingRequests = await arePendingRequests();
  while (hasPendingRequests == true || loadingBarShowing == true) {
    await delay(1000);
    hasPendingRequests = await arePendingRequests();
    loadingBarShowing = isLoadingBarShowing();
  }
  return;
};

const delay = (ms = 10000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const signupProcess = async () => {
  let signupPage = new SignUpPage(seatOrderPreference);
  await signupPage.getTableData();
  let chosenSeat = signupPage.pickSeat();
  let selectionSuccessful = await signupPage.selectTheChosenSeat(chosenSeat);
  if (selectionSuccessful == true) return true;
  return false;
};

const getDates = () => {
  const getMonthNumber = (code) => {
    switch (code) {
      case 'Jan':
        return 1;
      case 'Feb':
        return 2;
      case 'Mar':
        return 3;
      case 'Apr':
        return 4;
      case 'May':
        return 5;
      case 'Jun':
        return 6;
      case 'Jul':
        return 7;
      case 'Aug':
        return 8;
      case 'Sep':
        return 9;
      case 'Oct':
        return 10;
      case 'Nov':
        return 11;
      case 'Dev':
        return 12;
      default:
        break;
    }
  };
  let weekDateTexts = [];
  for (let i = 0; i < document.getElementsByClassName('SizedText---medium SizedText---predefined').length; i++) {
    let text = document.getElementsByClassName('SizedText---medium SizedText---predefined')[i].innerText;
    const datePattern = /^(Mon|Tue|Wed|Thu|Fri)/;
    if (datePattern.test(text) == true) weekDateTexts.push(text);
  }
  let dates = [];
  for (let i = 0; i < weekDateTexts.length; i++) {
    let text = weekDateTexts[i];
    let dayNumber = text.match(/\d+/g)[0];
    let month = text.slice(-3);
    let monthNumber = getMonthNumber(month);
    let year = 2024;
    let date = new Date(`${year}-${monthNumber}-${dayNumber}`);
    dates.push(date);
  }
  return dates;
};

const firstWantedDateButtonIndex = () => {};

const stepOne = async () => {
  document.title = 'Processing...';
  let homepage = new HomePage();
  await waitForAllRequestedResolved();
  for (let i = 0; i < homepage.maxPages; i++) {
    let dates = getDates();

    homepage.updateActiveSignupButtons();
    if (homepage.pageHasSignUpButtons() == true) {
      /* TODO - Determine which are the appropriate sign-up buttons */
      homepage.pressSignUpButton();
      await waitForAllRequestedResolved();
      await signupProcess();
      document.title = 'Waiting for user...';
      return; // Has to end as the dropdown menu cannot be pressed
    } else {
      homepage.pressRightArrow();
      await waitForAllRequestedResolved();
    }
  }
  document.title = 'Close tab';
};

const proceed = async () => {
  document.title = 'Processing...';
  let signupPage = new SignUpPage(seatOrderPreference);
  await signupPage.pressReserveButton();
  stepOne();
};

fetch('https://raw.githubusercontent.com/jdunsmuir/AutomatedSignup/main/seatingPreferences.json')
  .then((response) => response.text())
  .then((text) => {
    let jsonValue = JSON.parse(text)
    seatOrderPreference = jsonValue[user]
    stepOne();
  })
  .catch((error) => console.error('There was a problem with the fetch operation:', error));

  // .catch((e) => console.error(e));



// TODO - Get the date of the booking.
// t.parentElement.parentElement.parentElement.children[0].getElementsByClassName('FieldLayout---input_below')[0].innerText

/**
    fetch('/endpoint')
    .then(response => response.text())
    .then(jsCode => {
        // Execute the received JavaScript code
        eval(jsCode);
    })
    .catch(error => console.error('Error fetching JavaScript:', error));
*/

// Below clicks the dropdown
// document.getElementsByClassName('DropdownWidget---dropdown')[1].children[0].click()
// document.getElementById('645284c74862a4f6a9d6fe7273e24041_value').click()
// // document.getElementsByClassName('MenuWidget---listbox')[0].children[3]
// var keyboardEvent = document.createEvent('KeyboardEvent');
// var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? 'initKeyboardEvent' : 'initKeyEvent';

// keyboardEvent[initMethod](
//   'keypress', // event type: keydown, keyup, keypress
//   true, // bubbles
//   true, // cancelable
//   window, // view: should be window
//   false, // ctrlKey
//   false, // altKey
//   false, // shiftKey
//   false, // metaKey
//   40, // keyCode: unsigned long - the virtual key code, else 0
//   0, // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
// );
// document.dispatchEvent(keyboardEvent);

// Once the new tab is loaded, execute JavaScript code within it
// newTab.onload = function() {
//     stepOne()
//     //   newTab.console.log("Hello from the new tab!");
// };

// NOTE : Below is the new code to be developed. May need multiple scripts.

// JavaScript code to be executed in the new tab

// Actions to do
// 1. Record all the dates
// 2. Based on those dates, open a new tab for each date
// 3. Close the current tab
// 4. Each page should only select the best seat for one date
// 5. The user will need to go through and manually press the dropdown menu because grrrrr Appian
