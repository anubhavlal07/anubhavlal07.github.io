// Message arrays for the 500 displayable message
const messages = [
  [
    "Whoops.", "Oops.", "Excuse me.", "Oh dear.", "Hm...", "This is awkward.",
    "Well, gosh!", "Yikes!", "Uh-oh.", "Blimey!"
  ],
  [
    "It appears", "Looks like", "Unfortunately,", "It just so happens that",
    "Sadly,", "Seemingly from nowhere,", "Against all odds,",
    "By some cosmic joke,", "As fate would have it,"
  ],
  [
    "there was an error.", "I goofed up.", "a bad thing happened.",
    "the code crashed.", "a bug appeared.", "the code threw a tantrum.", "the website had a bad day.",
    "my code pooped out.", "the electrons got confused.",
    "the server had a coffee break."
  ],
  [
    "Sorry.", "Apologies.", "My bad.", "Sad day.", "I am quite contrite.",
    "Beg pardon.", "Oopsie daisy.", "Please forgive me.",
    "I'll try harder next time.", "Let's pretend this didn't happen."
  ],
];

// Elements to populate, in the same order as messages array
const messageElements = [
  document.querySelector("#js-whoops"),
  document.querySelector("#js-appears"),
  document.querySelector("#js-error"),
  document.querySelector("#js-apology"),
];

// Element for width calculations
const widthElement = document.querySelector("#js-hidden");

let lastMessageType = -1;
const messageTimer = 3000;

// Initialize messages and set interval for swapping
document.addEventListener("DOMContentLoaded", () => {
  setupMessages();
  setInterval(swapMessage, messageTimer);
});

// Set initial messages for each element
function setupMessages() {
  messageElements.forEach((el, idx) => {
    const msg = getNewMessage(idx);
    el.innerText = msg;
    calculateWidth(el, msg);
  });
}

// Set width of element to match its text's width
function calculateWidth(element, message) {
  widthElement.innerText = message;
  const newWidth = widthElement.getBoundingClientRect().width;
  element.style.width = `${newWidth}px`;
}

// Swap a message for one of the message types
function swapMessage() {
  const idx = getNewSwapIndex();
  const el = messageElements[idx];
  const newMsg = getNewMessage(idx);

  el.style.lineHeight = "0";
  setTimeout(() => {
    ensureWidthSet(idx, el.innerText);
    el.innerText = newMsg;
    calculateWidth(el, newMsg);
  }, 200);
  setTimeout(() => {
    el.style.lineHeight = "1.2";
  }, 400);

  lastMessageType = idx;
}

// Ensure the element at the index has a width set for transitions
function ensureWidthSet(index, message) {
  const el = messageElements[index];
  if (!el.style.width) {
    el.style.width = `${el.clientWidth}px`;
  }
}

// Return a new index to swap message in, not the same as last swapped
function getNewSwapIndex() {
  let idx;
  do {
    idx = Math.floor(Math.random() * messages.length);
  } while (idx === lastMessageType);
  return idx;
}

// Get a new message for the message element, not the same as previous
function getNewMessage(idx) {
  const arr = messages[idx];
  const prev = messageElements[idx].innerText;
  let msg, i;
  do {
    i = Math.floor(Math.random() * arr.length);
    msg = arr[i];
  } while (msg === prev);
  return msg;
}

// Disable certain keyboard shortcuts and context menu
document.onkeydown = function (event) {
  if (
    event.keyCode === 123 || // F12
    (event.ctrlKey && event.shiftKey && [73, 67, 86, 117].includes(event.keyCode)) || // Ctrl+Shift+I/C/V/F6
    (event.ctrlKey && event.keyCode === 85) // Ctrl+U
  ) {
    return false;
  }
};

document.addEventListener("contextmenu", e => e.preventDefault());
