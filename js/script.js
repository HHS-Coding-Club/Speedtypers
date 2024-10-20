// Oct, 16, 2024 - Evan & Rishi. MIT License. Simplified code and comments added to make it easier to read for beginners, although this already is pretty easy.

// Imports
import { data } from "../assets/data.js";

// CONSTANTS
const quotes = data.quotes;
const customWords = data.customWords;
const DATA_KEY = "test7";
const keybinds = {
  enter: function () {
    NewParagraph();
  },
};

// VARIABLES
let paragraphText = document.getElementById("paragraph");
let accuracyText = $("#accuracy");
let dataLabel = $("#dataLabel");
let homeButton = document.getElementById("homeButton");
let timerText = $("#timer");
let rawWpmText = $("#rawwpm");
let correctCharacterText = $("#correctCharacters");
let wpmText = $("#wpm");
let timeLeft = $("#timeLeft");
let settingsButton = document.getElementById("settings");
let caret = document.getElementById("caret");
let dataMenu = false;

// DYNAMIC VARIABLES
let currentCharIndex = 0;
let savedCharIndexs = [];
let misses = 0;
let isTyping = false;
let currentQuote = "";
let timeStart = 0;
let timeEnd = 0;
let stillShowData = false;
let menuOpen = false;
let timeTestLength = 0;
let currentTimeTest = 0;

// Modes - RandomQuote
let mode = "RandomWords";
let totalWords = 15;
let timerInterval = null;
let hasStartedTimer = false;

// Base Data
let gameData = {
  testType: "RandomWords",
  testSeconds: 15,
  testWords: 15,
  testSentence: "None",
  puncCheckbox: false,
  numbersCheckbox: false,
};
let addedSpace = [];
let userData;
let helpMenu = false;
let customSentence;

// FUNCTIONS
function Start() {
  // Hide the menu.
  $(".menu").hide();

  // Try to get data.
  userData = localStorage.getItem(DATA_KEY);
  if (!userData) {
    LoadBaseData();
  } else {
    // Parse the data.
    userData = JSON.parse(userData);

    // Loop through game data values.
    for (const [key, value] of Object.entries(gameData)) {
      // Check if user doesn't have this value.
      if (userData[key] == null || userData[key] == undefined) {
        userData[key] = value;
        console.log(
          "User did not have " +
            key +
            " in their data. Added it to value of " +
            value
        );
      }
    }
  }

  console.log(userData);
  $("#puncCheckbox").prop("checked", userData.puncCheckbox);
  $("#numbersCheckbox").prop("checked", userData.numbersCheckbox);

  // New paragraph.
  NewParagraph();
}

function LoadBaseData() {
  // Set base data.
  localStorage.setItem(DATA_KEY, JSON.stringify(gameData));
  userData = gameData;
}

function MoveCarat() {
  // Get the current letter.
  let range = document.getElementById("currentLetter");

  if (!document.getElementById("currentLetter")) {
    // Get the first character position
    range = document.createRange();
    const textNode = paragraphText.firstChild;
    range.setStart(textNode, 0); // Position at first character
    range.setEnd(textNode, 1); // Length of 1 character
  }

  // Get the position of currentLetter element
  const rect = range.getBoundingClientRect();

  caret.style.left = `${rect.right - 16}px`; // Position to the right of the letter
  caret.style.top = `${rect.top - 1}px`; // Align it vertically
}

function NewParagraph() {
  // Reset all the data.
  currentCharIndex = 0;
  savedCharIndexs = [];
  misses = 0;
  timeStart = 0;
  timeEnd = 0;
  addedSpace = [];

  // Set type.
  mode = userData.testType;
  timeTestLength = userData.testSeconds;
  totalWords = userData.testWords;

  // End timer
  if (hasStartedTimer == true) {
    clearInterval(timerInterval);
  }
  hasStartedTimer = false;

  // Fade in and out objects
  $(".menu").fadeOut();
  $(".paragraphBox").fadeIn();

  // Set random quote.
  currentQuote = ReturnRandomQuote();
  paragraphText.innerHTML = currentQuote;

  // Scroll to element.
  paragraphText.scrollIntoView();
  MoveCarat();

  $("#caret").fadeIn();

  // Start scroll
  if (mode == "TimeTest") {
    // Set text.
    timeLeft.text(timeTestLength + " s");

    // Show time test
    timeLeft.fadeIn();
  } else {
    timeLeft.hide();
  }

  // Get ready for typing.
  isTyping = true;

  // Get rid of menus.
  $("#settingsMenu").fadeOut();
  $("#dataMenu").fadeOut();
  $("#helpMenu").fadeOut();
  $("#buttonsList").fadeOut();
  menuOpen = false;
}

function ReturnRandomQuote() {
  // Find the mode.
  if (mode == "RandomQuotes") {
    return quotes[Math.floor(Math.random() * quotes.length)].text;
  } else if (mode == "RandomWords") {
    // Get random quote.
    let quote = "";
    let lastItem = "";
    let shouldCapital = false;
    let lastWordHasPunc = false;
    let lastWordHasSpace = false;
    for (let i = 0; i < totalWords; i++) {
      // Add space at the end.
      let addedSpace = "";
      if (i != totalWords - 1) {
        addedSpace = " ";
      }

      // Check for finding words.
      let found = false;
      let chosenWord;
      while (found == false) {
        chosenWord =
          customWords[Math.floor(Math.random() * customWords.length)];
        if (lastItem != chosenWord) {
          lastItem = chosenWord;
          found = true;
          break;
        }
      }
      let addedPuncuation = false;
      if ($("#puncCheckbox").prop("checked")) {
        // Should capital?
        if (shouldCapital) {
          shouldCapital = false;

          if (Math.random() * 10 > 8) {
            chosenWord =
              ". " + chosenWord.charAt(0).toUpperCase() + chosenWord.slice(1);
          } else {
            if (i < totalWords - 2) {
              addedPuncuation = true;
              chosenWord = " " + chosenWord + ",";
            }
          }
        }

        // Check if puncuation.
        if (
          Math.floor(Math.random() * 10) > 7 &&
          i < totalWords - 2 &&
          !addedPuncuation
        ) {
          shouldCapital = true;
          addedSpace = "";
        }
        if (i == totalWords - 3) {
          addedSpace = " ";
        }

        if (i == 0) {
          shouldCapital = false;
          chosenWord = chosenWord.charAt(0).toUpperCase() + chosenWord.slice(1);
          addedSpace = " ";
        }

        if (i == totalWords - 1) {
          chosenWord = chosenWord + ".";
        }
      }
      if (addedSpace == " ") {
        lastWordHasSpace = true;
      } else {
        lastWordHasSpace = false;
      }

      // Allow numbers.
      if ($("#numbersCheckbox").prop("checked") && Math.random() * 10 > 8.5) {
        let addedSpace = "";
        if (quote[quote.length - 1] != " " && quote.length > 1) {
          console.log("added spaec");
          addedSpace = " ";
        }
        let number = Math.floor(Math.random(0) * 9999 + 1);
        chosenWord = addedSpace + number.toString();
      }

      // Add random quote.
      quote += chosenWord + addedSpace;
    }
    return quote;
  } else if (mode == "TimeTest") {
    // Get random quote.
    let quote = "";
    let lastItem = null;
    let shouldCapital = false;
    let lastWordHasPunc = false;
    let lastWordHasSpace = false;
    for (let i = 0; i < 100; i++) {
      // Add space at the end.
      let addedSpace = "";
      if (i != 100 - 1) {
        addedSpace = " ";
      }
      let chosenWord;

      // Add random quote.
      if (lastItem != null) {
        let found = false;

        // While random is false.
        while (found == false) {
          // Get rnadom word.
          chosenWord =
            customWords[Math.floor(Math.random() * customWords.length)];

          // If the last one was not this one.
          if (lastItem != chosenWord) {
            // Let it through.
            lastItem = chosenWord;
            found = true;
          }
        }
      } else {
        // Get random word.
        chosenWord =
          customWords[Math.floor(Math.random() * customWords.length)];
      }

      let addedPuncuation = false;
      if ($("#puncCheckbox").prop("checked")) {
        // Should capital?
        if (shouldCapital) {
          shouldCapital = false;

          if (Math.random() * 10 > 8) {
            chosenWord =
              ". " + chosenWord.charAt(0).toUpperCase() + chosenWord.slice(1);
          } else {
            if (i < totalWords - 2) {
              addedPuncuation = true;
              chosenWord = " " + chosenWord + ",";
            }
          }
        }

        // Check if puncuation.
        if (
          Math.floor(Math.random() * 10) > 7 &&
          i < totalWords - 2 &&
          !addedPuncuation
        ) {
          shouldCapital = true;
          addedSpace = "";
        }
        if (i == totalWords - 3) {
          addedSpace = " ";
        }

        if (i == 0) {
          shouldCapital = false;
          chosenWord = chosenWord.charAt(0).toUpperCase() + chosenWord.slice(1);
          addedSpace = " ";
        }

        if (i == totalWords - 1) {
          chosenWord = chosenWord + ".";
        }
      }
      if (addedSpace == " ") {
        lastWordHasSpace = true;
      } else {
        lastWordHasSpace = false;
      }

      // Allow numbers.
      if ($("#numbersCheckbox").prop("checked") && Math.random() * 10 > 8.5) {
        let addedSpace = "";
        if (quote[quote.length - 1] != " " && quote.length > 1) {
          console.log("added spaec");
          addedSpace = " ";
        }
        let number = Math.floor(Math.random(0) * 9999 + 1);
        chosenWord = addedSpace + number.toString();
      }

      // Add it on.
      quote += chosenWord + addedSpace;
    }
    return quote;
  } else if (mode == "CustomSentence") {
    if (!userData.testSentence) {
      alert(
        "Sentence could not be loaded, please go to settings and input new one."
      );
    } else {
      return userData.testSentence;
    }
  }
}

function AddSpaceBetweenCapitals(str) {
  return str.replace(/([A-Z])/g, " $1").trim();
}

function LoadMenu(showData) {
  // Turn off stuff.
  isTyping = false;

  // Fade in and out objects
  $(".menu").fadeIn();
  $(".paragraphBox").fadeOut();
  $("#buttonsList").fadeIn();
  $("#caret").fadeOut();

  timeLeft.fadeOut();

  // Set data text.
  if (showData) {
    // Calculate WPM
    const WPM = CalculateWPM();
    const RawWPM = (GetTotalWords() / ((timeEnd - timeStart) / 60)).toFixed(1);

    let switchedToTimeTestMode = false;
    let switchedToWordsMode = false;

    // Set seconds mode.
    if (mode == "TimeTest")
    {
        switchedToTimeTestMode = true;
        mode = "TimeTest-" + timeTestLength;
    }

    // Set seconds mode.
    if (mode == "RandomWords")
        {
            switchedToWordsMode = true;
            mode = "RandomWords-" + userData.testWords;
        }

    // Allow different test types.
    if (!userData[mode + "-highestWPM"]) {
      userData[mode + "-highestWPM"] = 0;
      console.log("Created new wpm data for test type " + mode);
    }

    // Allow different test types.
    if (!userData[mode + "-highestRawWPM"]) {
      userData[mode + "-highestRawWPM"] = 0;
      console.log("Created new raw wpm data for test type " + mode);
    }

    // Set text
    dataLabel.fadeIn();
    wpmText.text(
      "Wpm: " +
        WPM +
        (parseFloat(WPM) > parseFloat(userData[mode + "-highestWPM"])
          ? "👑"
          : "")
    );
    accuracyText.text(
      "Accuracy: " + ((1 - misses / currentQuote.length) * 100).toFixed() + "%"
    );
    timerText.text("Time: " + (timeEnd - timeStart).toFixed(3) + " s");
    correctCharacterText.text(
      "Characters: " + (currentQuote.length - misses) + "/" + misses
    );
    rawWpmText.text(
      "Raw Wpm: " +
        RawWPM +
        (parseFloat(RawWPM) > parseFloat(userData[mode + "-highestRawWPM"])
          ? "👑"
          : "")
    );
    $("#testType").text(
      "Test Type: " +
        (mode == "TimeTest" || switchedToTimeTestMode
          ? AddSpaceBetweenCapitals(mode) + "s"
          : AddSpaceBetweenCapitals(mode) + (switchedToWordsMode ? " Words" : " "))
    );

    // Check if beat scores.
    if (parseFloat(WPM) > parseFloat(userData[mode + "-highestWPM"])) {
      // Set  the value.
      userData[mode + "-highestWPM"] = WPM;
    }

    // Check if beat scores.
    if (parseFloat(RawWPM) > parseFloat(userData[mode + "-highestRawWPM"])) {
      // Set  the value.
      userData[mode + "-highestRawWPM"] = RawWPM;
    }
    wpmText.tooltipster('content',"Highest Ever: " + userData[mode + "-highestWPM"] + " Words Per Minute");
    rawWpmText.tooltipster('content', "Highest Ever: " + userData[mode + "-highestRawWPM"] + " Raw Words Per Minute");
  

    if (switchedToTimeTestMode)
        {
            mode = "TimeTest";
        }
    if (switchedToWordsMode)
    {
        mode = "RandomWords";
    }
  }
}

function GetTotalWords() {
  return currentQuote.split(" ").length;
}

function GetCorrectWords() {
  let words = currentQuote.split(" "); // Split the quote into words
  let incorrectWords = []; // Initialize an array to store incorrect words

  // Loop through savedCharIndexs to find incorrect characters
  for (let i = 0; i < savedCharIndexs.length; i++) {
    // If the character is incorrect
    if (!savedCharIndexs[i]) {
      let charIndex = 0; // Index to track character position
      let wordIndex = 0; // Index of the current word

      // Find the word that contains the incorrect character
      for (let j = 0; j < words.length; j++) {
        // Update charIndex to include the length of the current word and space
        charIndex += words[j].length + (j > 0 ? 1 : 0); // +1 for the space

        // If the charIndex exceeds the current index, this is the incorrect word
        if (charIndex > i) {
          wordIndex = j;

          break;
        }
      }

      // Add the incorrect word to the array if it's not already included
      if (!incorrectWords.includes(words[wordIndex])) {
        incorrectWords.push(words[wordIndex]);
      }
    }
  }

  // Calculate the total number of correct words
  let totalWordsGot = words.length - incorrectWords.length;

  // Debugging output
  console.log(
    `Total Words: ${words.length}, Incorrect Words: ${incorrectWords.length}, Total Correct Words: ${totalWordsGot}`
  );

  // Return the total number of correct words
  return totalWordsGot;
}

function GetWordsTyped() {
  let words = currentQuote.split(" "); // Split the quote into words
  let totalCorrectWords = 0; // Initialize count of correct words
  let currentIndex = 0; // Track the index of characters processed

  // Loop through each word
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let isWordCorrect = true; // Assume the word is correct unless proven otherwise

    // Check each character of the word
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      // Check the global index for savedCharIndexs
      if (currentIndex < savedCharIndexs.length) {
        if (savedCharIndexs[currentIndex] !== true) {
          isWordCorrect = false; // If any character is incorrect, mark the word as incorrect
          break; // No need to check further characters
        }
      } else {
        // If we run out of saved indices, we consider it incorrect
        isWordCorrect = false;
        break;
      }
      currentIndex++; // Move to the next character in savedCharIndexs
    }

    // If the word was typed correctly, increment the count
    if (isWordCorrect) {
      totalCorrectWords++;
    }

    // Move past the space character to the next word
    currentIndex++; // Move past the space (if not the last word)
  }

  // Debugging output
  console.log(
    `Total Words: ${words.length}, Total Correct Words: ${totalCorrectWords}`
  );

  // Return the total number of correct words
  return totalCorrectWords;
}

function CalculateWPM() {
  // Get words.
  let totalWordsGot = GetCorrectWords();
  if (mode == "TimeTest") {
    totalWordsGot = GetWordsTyped();
    currentQuote = currentQuote.substring(0, currentCharIndex);
    console.log(currentQuote);
  }

  // Calculate time taken.
  let totalTime = timeEnd - timeStart;

  let totalMinutes = totalTime / 60;
  console.log("Words Correct: " + totalWordsGot);

  // Calculate wpm.
  let WPM = totalWordsGot / totalMinutes;

  return WPM.toFixed(1);
}

function UpdateParagraph(currentString) {
  // Loop through each index and check if it's correct.
  const updatedHTML = currentString
    .split("")
    .map((char, index) => {
      // Check if it's right or wrong.
      let isCorrect = savedCharIndexs[index]
        ? "correctCharacter"
        : savedCharIndexs[index] == null || savedCharIndexs[index] == undefined
        ? ""
        : "incorrectCharacter";
      let extraID = "";

      // Then check if it's the current item.
      if (currentCharIndex == index) {
        extraID = "currentLetter";
      }

      // Create span.
      return `<span class="${isCorrect}" id="${extraID}">${char}</span>`;
    })
    .join("");

  // Set the innerHTML of the paragraph text
  paragraphText.innerHTML = updatedHTML;

  // Scroll to element.
  if (document.getElementById("currentLetter"))
    document.getElementById("currentLetter").scrollIntoView();
  MoveCarat();
}

function Keybinds(event) {
  // Get key
  let key = event.key.toLowerCase();

  // Check for keybinds
  if (keybinds[key]) {
    keybinds[key]();
  }
}

function KeyPressed(event) {
  if (!isTyping || menuOpen) return;

  // Get key we pressed.
  let keyCode = event.key;
  let isBackspace = false;

  // We don't want to listen for shifts.
  if (data.badKeys[keyCode]) return;

  // We do want to check for an backspace
  if (keyCode == "Backspace") {
    // Go back 2 spaces since we are in index form.
    isBackspace = true;
    currentCharIndex -= 1;

    // Check if was a miss
    if (savedCharIndexs[currentCharIndex] == false) {
      // Take away the miss.
      if (misses > 0) {
        misses--;
      }
    }

    // Remove from list
    savedCharIndexs[currentCharIndex] = undefined;

    // Reset the text.
    UpdateParagraph(paragraphText.innerText);

    // Also reset the text.
    return;
  }

  // Get the key we need to press next.
  let currentText = paragraphText.innerText[currentCharIndex];
  let currentString = paragraphText.innerText;

  // Increase character index.
  currentCharIndex += 1;

  // Start the watch.
  if (currentCharIndex == 1) {
    console.log("Start");
    timeStart = new Date().getTime() / 1000;
  }

  // Check if timetset.
  if (mode == "TimeTest") {
    // Add more words.
    if (currentText == " " && !addedSpace[currentCharIndex]) {
      // Show that we added a word.
      addedSpace[currentCharIndex] = true;
      let chosenWord =
        customWords[Math.floor(Math.random() * customWords.length)];

      // Allow numbers.
      if ($("#numbersCheckbox").prop("checked") && Math.random() * 10 > 8.5) {
        let addedSpace = "";
        if (
          currentQuote[currentQuote.length - 1] != " " &&
          currentQuote.length > 1
        ) {
          console.log("added spaec");
          addedSpace = " ";
        }
        let number = Math.floor(Math.random(0) * 9999 + 1);
        chosenWord = addedSpace + number.toString();
      }

      currentString += " " + chosenWord;

      currentQuote = currentString;
    }
  }

  // Check if we pressed right key.
  if (keyCode == currentText) {
    savedCharIndexs[currentCharIndex - 1] = true;
  } else {
    misses++;
    savedCharIndexs[currentCharIndex - 1] = false;
  }

  // Update the paragraph.
  UpdateParagraph(currentString);

  // Start the test
  if (hasStartedTimer == false && mode == "TimeTest") {
    // Star the time test.
    console.log("Starting time test of " + timeTestLength);
    hasStartedTimer = true;
    currentTimeTest = new Date().getTime() / 1000;

    // Set interval
    let timePassed = 0;
    timerInterval = setInterval(() => {
      // Increase variable as one.
      timePassed++;
      timeLeft.text(timeTestLength - timePassed + " s");

      // Wait for test to end.
      if (timePassed >= timeTestLength) {
        // End the test.
        isTyping = false;
        hasStartedTimer = false;
        console.log("Time test end");

        // Clear interval and show menu.
        clearInterval(timerInterval);
        currentTimeTest = 0;
        timerInterval = null;

        // Reset data.
        stillShowData = true;
        timeStart = 0;
        timeEnd = timeTestLength;
        timeLeft.fadeOut();
        LoadMenu(true);
      }
    }, 1000);
  }

  // Check if we finished
  if (currentCharIndex >= currentString.length) {
    // End
    timeEnd = new Date().getTime() / 1000;
    stillShowData = true;
    console.log("End");

    // Load the menu.
    isTyping = false;
    LoadMenu(true);
  }
}

function OpenSettings() {
  // Check if is typing.
  if (isTyping) return;

  // Reset menu.
  menuOpen = !menuOpen;

  // Show the menu.
  if (menuOpen) $("#settingsMenu").fadeIn();
  else $("#settingsMenu").fadeOut();
  $("#dataMenu").fadeOut();
  helpMenu = false;
  dataMenu = false;
  $("#helpMenu").fadeOut();
}

function OpenHelp() {
  // Check if is typing.
  if (isTyping) return;
  helpMenu = !helpMenu;

  if (helpMenu) $("#helpMenu").fadeIn();
  else $("#helpMenu").fadeOut();
  $("#dataMenu").fadeOut();
  $("#settingsMenu").fadeOut();
  dataMenu = false;
  menuOpen = false;
}

function transformStringWithRawWPM(str) {
  // Split the string by the dash character
  let parts = str.split('-');

  // SHandle capitalization and adding spaces between camel case words
  for (let i = 0; i < parts.length; i++) {
      parts[i] = parts[i].replace(/([a-z])([A-Z])/g, '$1 $2')
                         .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
  }

  
  // Join the parts back with spaces around the dashes
  parts[2] = "";
  let wasQuote = false;

  // Join the quotes together.
  if (parts[0][0] == "R" && parts[0][7] != "Q")
  {
    parts[1] += " Words";
  }
  else if (parts[0][7] == "Q")
  {
    wasQuote = true;
    parts[1] = "";
  } else if (parts[0][0] == "C")
  {
    wasQuote = true;
    parts[1] = "";
  }
  else
  {
    parts[1] += "s";
  }
  let transformedString = parts.join(' - ');
  if (wasQuote)
  {
    transformedString = parts.join(" ");
  }


  // Check if the string contains "highestWPM" and get values
  if (str.includes("highestWPM")) {
      // Create the "highestRawWPM" key by replacing "highestWPM" with "highestRawWPM"
      let rawWPMKey = str.replace("highestWPM", "highestRawWPM");

      // Get the WPM and RAW WPM values from the userData dictionary
      let highestWPM = userData[str];
      let highestRawWPM = userData[rawWPMKey];


      // If both WPM and Raw WPM exist, append them in the correct format
    if (wasQuote)
    {
      transformedString += `- Highest WPM/RAW: ${highestWPM}/${highestRawWPM}`;
    }
    else
    {
      transformedString += `Highest WPM/RAW: ${highestWPM}/${highestRawWPM}`;
    }
      
      return transformedString;
  }
  else
  {
    return 0;
  }

  
}


function OpenData()
{
  if (isTyping) return;
  dataMenu = !dataMenu;
  if (dataMenu) $("#dataMenu").fadeIn();
  else $("#dataMenu").fadeOut();
  $("#settingsMenu").fadeOut();
  $("#helpMenu").fadeOut();
  helpMenu = false;
  menuOpen = false;

  if (dataMenu)
  {
    let dataList =$("#dataList");
    dataList.html("<h2 class='bigLabels'>DATA</h2><hr> <br>");
    let amount = 0;

    for (const [key, value] of Object.entries(userData)) 
    { 
      if (key.includes("highest"))
      {
        let finalString = transformStringWithRawWPM(key);
        if (finalString)
        {
          dataList.append("<h2 class='bigLabels2'>" + finalString+ "</h2><br>");
          amount++;
        }
       
     
      }
    }
    if (amount == 0)
    {
      dataList.append("<p>Try again, or make sure you have taken a test to get some data.</p>");
    }
  }
}

// CONNECTIONS
window.addEventListener("keydown", KeyPressed);
window.addEventListener("keydown", Keybinds);
homeButton.addEventListener("click", () => {
  LoadMenu(false);
});
settingsButton.addEventListener("click", OpenSettings);
document.getElementById("help").addEventListener("click", OpenHelp);
document.getElementById("data").addEventListener("click", OpenData);
document.getElementById("RandomQuote").addEventListener("click", () => {
  userData.testType = "RandomQuotes";
  $("#settingsMenu").fadeOut();
});

document.getElementById("RandomWords").addEventListener("click", () => {
  let words = prompt("How many words would you like?");

  // Check if word is good.
  if (words.length > 0 && words != null && words != undefined) {
    let numberForm = parseInt(words);
    if (numberForm > 0 && numberForm != null && numberForm != undefined) {
      // Set total words correctly.
      $("#settingsMenu").fadeOut();
      userData.testWords = Math.round(numberForm);
      userData.testType = "RandomWords";
      return;
    } else {
      // Alert user
      alert("Please enter a number above 0.");
      return;
    }
  }

  // Alert user
  alert("Please enter a real number.");
});
document.getElementById("TimeTest15").addEventListener("click", () => {
  // Set mode and cloes
  userData.testSeconds = 15;
  userData.testType = "TimeTest";
  $("#settingsMenu").fadeOut();
});

document.getElementById("TimeTestCustom").addEventListener("click", () => {
  let words = prompt("How many seconds?");

  // Check if word is good.
  if (words.length > 0 && words != null && words != undefined) {
    let numberForm = parseInt(words);
    if (numberForm > 0 && numberForm != null && numberForm != undefined) {
      // Set total words correctly.
      $("#settingsMenu").fadeOut();
      userData.testSeconds = Math.round(numberForm);
      userData.testType = "TimeTest";

      console.log(timeTestLength);
      return;
    } else {
      // Alert user
      alert("Please enter a number above 0.");
      return;
    }
  }

  // Alert user
  alert("Please enter a real number.");
});

window.addEventListener("resize", () => {
  MoveCarat();
});

document.getElementById("CustomSentence").addEventListener("click", () => {
  let words = prompt("Please enter a sentence.");

  // Check sentence.
  if (words.length < 10000 && words != null && words != undefined) {
    userData.testType = "CustomSentence";
    userData.testSentence = words;
    $("#settingsMenu").fadeOut();

    return;
  }

  // Alert
  alert(
    "Please enter a sentence under 10,000 characters and make sure it's a real sentence."
  );
});
document.getElementById("ResetData").addEventListener("click", () => {
  localStorage.setItem(DATA_KEY, JSON.stringify(gameData));
  userData = gameData;
  $("#puncCheckbox").prop("checked", userData.puncCheckbox);
  $("#numbersCheckbox").prop("checked", userData.numbersCheckbox);
  alert("Successfully reset data.");
  $("#settingsMenu").fadeOut();
});
window.onbeforeunload = function () {
  userData.puncCheckbox = $("#puncCheckbox").prop("checked");
  userData.numbersCheckbox = $("#numbersCheckbox").prop("checked");
  localStorage.setItem(DATA_KEY, JSON.stringify(userData));
};

// INITIALIZATION
$(document).ready(function () {
  $(".tooltip").tooltipster();
  Start();
});
