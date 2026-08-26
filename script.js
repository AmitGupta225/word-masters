const grid = document.querySelectorAll(".letter");
const resultBox = document.querySelector(".result");
const button = document.querySelector(".btn");
const keyboard = document.querySelector(".keyboard");
let correctWord;
let userWord;
let row;
let column;
let gameWon;
init();

document.addEventListener("keyup", (e) => {
  if (!gameWon) {
    if (
      e.key.length == 1 &&
      e.key.toLowerCase() >= "a" &&
      e.key.toLowerCase() <= "z" &&
      column !== 4
    )
      inputLetter(e.key.toLowerCase());
    else if (e.key === "Backspace" && userWord.length >= 1) removeLetter();
    else if (e.key === "Enter" && userWord.length === 5) nextWord();
  }
});

keyboard.addEventListener("click", (e) => {
  if (!gameWon) {
    if (e.target.innerText.length == 1 && column !== 4)
      inputLetter(e.target.innerText.toLowerCase());
    else if (e.target.innerText === "Backspace" && userWord.length >= 1)
      removeLetter();
    else if (e.target.innerText === "Enter" && userWord.length === 5)
      nextWord();
  }
});

button.addEventListener("click", init);

function init() {
  gameWon = false;
  userWord = "";
  getWord();
  row = 0;
  column = -1;
  button.classList.add("hidden");
  resultBox.innerText = "";
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      grid[i * 5 + j].classList.remove(
        "correct-position",
        "incorrect-position",
        "not-present",
      );
      grid[i * 5 + j].innerText = "";
    }
  }
}

function inputLetter(c) {
  column++;
  userWord += c;
  grid[row * 5 + column].innerText = c;
}

function removeLetter() {
  grid[row * 5 + column].innerText = "";
  userWord = userWord.substring(0, userWord.length - 1);
  column--;
}

async function nextWord() {
  let isValid = await validateWord(userWord);
  if (isValid) {
    highlighter(correctWord);
    if (row !== 5) {
      row++;
      column = -1;
      userWord = "";
    }
  } else invalidWord();
}

function highlighter(correctWord) {
  let correctLetters = 0;
  for (let i = 0; i < 5; i++)
    if (userWord[i] === correctWord[i]) {
      grid[row * 5 + i].classList.add("correct-position");
      correctLetters++;
      userWord = userWord.substring(0, i) + "1" + userWord.substring(i + 1);
      correctWord =
        correctWord.substring(0, i) + "1" + correctWord.substring(i + 1);
    }
  for (let i = 0; i < 5; i++) {
    if (userWord[i] !== "1") {
      for (let j = 0; j < 5; j++) {
        if (correctWord[j] != "1" && userWord[i] === correctWord[j]) {
          grid[row * 5 + i].classList.add("incorrect-position");
          userWord = userWord.substring(0, i) + "1" + userWord.substring(i + 1);
          correctWord =
            correctWord.substring(0, j) + "1" + correctWord.substring(j + 1);
          break;
        }
      }
    }
  }
  for (let i = 0; i < 5; i++) {
    if (userWord[i] !== "1") {
      grid[row * 5 + i].classList.add("not-present");
    }
  }
  if (correctLetters === 5) win();
  else if (row === 5 && correctLetters !== 5) lose();
}

function win() {
  resultBox.innerText = "You Win!";
  button.classList.remove("hidden");
  gameWon = true;
}

function lose() {
  resultBox.innerText = `You Lose! The correct word was ${correctWord.toUpperCase()}`;
  button.classList.remove("hidden");
}

async function getWord() {
    const promise = await fetch(
        "https://amitgupta.xyz/word-masters/api/get-word",
    );
    const processedPromise = await promise.json();
    correctWord = processedPromise.word;
}

async function validateWord(word) {
    const promise = await fetch(
        "https://amitgupta.xyz/word-masters/api/validate-word",
        {
            method: "post",
	        headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "word": word }),
        },
    );
    const processedPromise = await promise.json();
    return processedPromise.validWord;
}

function invalidWord() {
  for (let i = 0; i < 5; i++) {
    grid[row * 5 + i].classList.add("wrong");
    setTimeout(() => {
      grid[row * 5 + i].classList.remove("wrong");
    }, 1000);
  }
}
