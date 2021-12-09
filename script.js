const correctCharacters = document.getElementById("correct-characters");
const wrongCharacters = document.getElementById("wrong-characters");
const wrongCharactersContainer = document.getElementById(
  "wrong-word-container"
);
const hangmanSvg = document.getElementById("hangmanSvg");
const notification = document.getElementById("notification-container");
const inputWorkaround = document.getElementById("inputWorkaround");

let currentWord = null;
let charactersGuessed = null;

//Words to choose from when game starts
const words = ["hello", "pankaj", "doing", "sitting"];

window.addEventListener("DOMContentLoaded", () => {
  startGame(); //Start the game when DOM content loaded is fired i.e. scripts are downloaded & executed
});

/**
 * User entered a valid character. This method will check if it was part of the
 * current word or a wrong character
 * @param {*} character Character input by User
 */
function userInput(character) {
  const charIndex = charactersGuessed.indexOf(character);
  if (charIndex === -1) {
    // Wrong character guessed
    wrongInput(character);
  } else {
    //Right character guessed
    const node = correctCharacters.children[charIndex];
    node.innerText = character;

    //Now again replace the guessed character with *
    charactersGuessed = charactersGuessed.replaceCharAt(charIndex, "*");
    if (charactersGuessed.charCount("*") === currentWord.length) {
      //User has guessed the entire word
      victory();
    }
  }
}

/**
 *
 * @param {*} isRight Whether the character is right or wrong
 */
function addCharacter(character, isRight = false) {
  if (isRight) {
    //The input character is correct
    const rCharacter = document.createElement("div");
    rCharacter.className = "char";
    rCharacter.innerText = character;
    correctCharacters.appendChild(rCharacter);
  } else {
    //The input character is incorrect
    if (!wrongCharactersContainer.classList.contains("show")) {
      wrongCharactersContainer.classList.add("show");
    }
    const wCharacter = document.createElement("span");
    wCharacter.innerText = character;
    wrongCharacters.appendChild(wCharacter);
  }
}

/**
 * Choose a word when game starts
 */
function chooseWord() {
  const randomIndex = Math.floor(Math.random() * words.length); //Generate a number
  //between 0 & length & pick its integer part
  if (randomIndex === words.length) {
    return words[0]; // If index is same as length, so we will return first element
  }
  return words[randomIndex];
}

/**
 * Populates placeholders for the current word so
 * that user can guess the word
 */
function populateUserInputPlaceholders() {
  let gussedSequence = "";
  currentWord.split("").forEach((char, index) => {
    if (index % 3 == 0 || index === 0) {
      addCharacter(char, true); //Adds actual character for hint
      gussedSequence += "*"; //Add * for already guessed characters
    } else {
      gussedSequence += char;
      addCharacter("", true); //Add an empty character
    }
  });
  charactersGuessed = gussedSequence; //Set guessed characters
}

/**
 * Starts a new game
 */
function startGame() {
  resetGame(); //Reset the game

  currentWord = chooseWord(); //Choose a new random word
  populateUserInputPlaceholders(); //Add placeholders

  //Add the event listener
  document.addEventListener("keydown", keydownEvent);
  if (!isDesktopViewport()) {
    inputWorkaround.classList.add("show");
    inputWorkaround.focus(); //Set focus so that on mobile, keyboard can popup
  }
}

/**
 * Resets the game to initial state
 */
function resetGame() {
  currentWord = null;
  correctCharacters.innerHTML = ""; //Empty the Characters
  wrongCharacters.innerHTML = ""; //Empty the Characters
  wrongCharactersContainer.classList.remove("show");
}

/**
 * Adds a utility in String to replace a single character at a given index
 */
String.prototype.replaceCharAt = function (index, charToReplace) {
  if (index <= 0 || index >= this.length) {
    return; //Invalid index
  }
  charToReplace = charToReplace[0]; //We only make 1 character replacement
  if (this.length === 1) {
    return charToReplace;
  } else if (index === 0) {
    return charToReplace + this.substring(1);
  } else {
    return this.substring(0, index) + charToReplace + this.substring(index + 1);
  }
};

/**
 * Counts the occurence of the given character in the current string
 * @param {*} characterToCount
 */
String.prototype.charCount = function (characterToCount) {
  let count = 0;
  const str = this;
  str.split("").forEach((char) => {
    if (char === characterToCount) {
      count++;
    }
  });
  return count;
};

/**
 * Defines set of operations to perform if the given input is incorrect
 * 1- Adds the character to Wrong input continer
 * 2- Sets the hangman parts to visible
 * 3- If all parts are visible, then displays game over popup
 * @param character The character user has input
 */
function wrongInput(character) {
  addCharacter(character, false); //Adds character to wrong inputs

  const hangmanParts = hangmanSvg.querySelectorAll(".figure-part:not(.show)");
  if (hangmanParts.length) {
    hangmanParts[0].classList.add("show"); //Show the first selected area
  }

  if (hangmanParts.length === 1) {
    //Only 1 part was remaining. Now entire hangman is visible
    gameOver();
  }
}

/**
 * Defines a set of operations to perfrom when game is over for a user
 */
function gameOver() {
  document.removeEventListener("keydown", keydownEvent);
  showNotification("Game Over! Try again");
}

/**
 * Defines a set of operations to perform when a user wins the game by
 * guessing the correct word
 */
function victory() {
  if (charactersGuessed.charCount("*") !== currentWord.length) {
    console.error("You haven't guessed the word yet");
    return;
  }
  window.removeEventListener("keydown", keydownEvent);
  showNotification("You have won the game");
}

/**
 * Keydown event call back function
 * @param {*} event DOM event
 */
function keydownEvent(event) {
  let keyValue = event.key.toUpperCase().charCodeAt(0);
  if (!isDesktopViewport()) {
    keyValue = event.target.value
      .charAt(event.target.selectionStart - 1 || 1)
      .toUpperCase()
      .charCodeAt(0);
  }

  if (keyValue >= 65 && keyValue <= 91) {
    userInput(String.fromCharCode(keyValue));
  }
}

/**
 * Shows a notification for some time and then hides itself
 * @param {*} message String message to be displayed in notification
 */
function showNotification(message) {
  if (typeof message !== "string") {
    throw new Error("Expected string but passed " + typeof message);
  }

  notification.classList.add("show");
  notification.querySelector("#message").innerText = message;

  setTimeout(() => {
    notification.classList.remove("show");
  }, 5000);
}

/**
 * Checks if the current viewport is mobile.
 * Returns true if yes, else false
 */
function isDesktopViewport() {
  return window.outerWidth >= 1024;
}
