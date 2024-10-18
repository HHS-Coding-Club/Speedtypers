// Oct, 16, 2024 - Evan & Rishi. MIT License. Simplified code and comments added to make it easier to read for beginners, although this already is pretty easy.

// CONSTANTS
const quotes = [
    "The sunflower blossomed brightly in the summer garden.",
    "Lemonade is the perfect drink for a sunny day at the beach.",
    "The sun shines brightly in the clear blue sky.",
    "Farmers work hard to harvest fresh produce for their community.",
    "The cat chased the mouse around the house.",
    "The sky was painted in shades of pink and orange as the sun set behind the mountains."];

const customWords = [
    "the", "and", "a", "key", "jump", "over", "fast", "new", "left", "start", "bring", 
    "school", "watch", "close", "down", "find", "time", "home", "early", "water", "money", 
    "work", "right", "good", "world", "open", "play", "back", "next", "help", "small", 
    "big", "long", "read", "write", "send", "stop", "call", "phone", "game", "store", 
    "food", "day", "week", "month", "year", "night", "city", "drive", "park", "move", 
    "clean", "test", "room", "line", "wait", "start", "finish", "talk", "speak", "walk", 
    "run", "jump", "high", "low", "easy", "hard", "light", "dark", "wind", "road", 
    "clear", "story", "word", "sound", "song", "part", "list", "group", "class", "rest", 
    "fun", "fast", "slow", "look", "see", "meet", "learn", "grow", "plant", "green", 
    "blue", "black", "white", "red", "stop", "turn", "bring", "set", "buy", "sell", 
    "ride", "train", "bus", "car", "is", "on", "be", "but", "he", "she", "then", "last",
    ];
const keybinds = {
    "enter": function()
    {
        NewParagraph();
    }
}




// VARIABLES
let paragraphText = document.getElementById("paragraph");
let accuracyText = $("#accuracy");
let homeButton = document.getElementById("homeButton");
let timerText = $("#timer");
let rawWpmText = $("#rawwpm");
let correctCharacterText = $("#correctCharacters");
let wpmText = $("#wpm");

// DYNAMIC VARIABLES
let currentCharIndex = 0;
let savedCharIndexs = [];
let misses = 0;
let isTyping = false;
let currentQuote = "";
let timeStart = 0;
let timeEnd = 0;
let stillShowData = false;

// Modes - RandomQuote
let mode = "RandomWords";
let totalWords = 15;

// FUNCTIONS
function Start()
{
    // Hide the menu.
    $(".menu").hide();
    
    // New paragraph.
    NewParagraph();
}

function NewParagraph()
{
    // Reset all the data.
    currentCharIndex = 0;
    savedCharIndexs = [];
    misses = 0;
    timeStart = 0;
    timeEnd = 0;
    
    // Fade in and out objects
    $(".menu").fadeOut();
    $(".paragraphBox").fadeIn();
    
    // Set random quote.
    currentQuote = ReturnRandomQuote();
    paragraphText.innerHTML = currentQuote;
    
    // Get ready for typing.
    isTyping = true;
}

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function ReturnRandomQuote()
{
    if (mode == "RandomQuote")
    {
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
    else if (mode == "RandomWords")
    {
        // Get random quote.
        let quote = "";
        for (let i = 0; i < totalWords; i++)
        {
            // Add space at the end.
            let addedSpace = "";
            if (i != totalWords - 1)
            {
                addedSpace = " ";
            }
            
            // Add random quote.
            quote += customWords[Math.floor(Math.random() * customWords.length)] + addedSpace;
        }
        return quote;
    }
}

function LoadMenu(showData)
{
    // Fade in and out objects
    $(".menu").fadeIn();
    $(".paragraphBox").fadeOut();
    
    
    // Set data text.
    if (showData)
    {
        wpmText.text("Wpm: " + CalculateWPM());
        accuracyText.text("Accuracy: " + ((1 - (misses / currentQuote.length)) * 100).toFixed() + "%");
        timerText.text("Time: "+(timeEnd-timeStart).toFixed(3) + " s");
        correctCharacterText.text("Characters: " + (currentQuote.length - misses) + "/" + misses);
        rawWpmText.text("Raw Wpm: " + ((GetTotalWords())/((timeEnd-timeStart) / 60)).toFixed(1));
        
    }
}

function GetTotalWords()
{
    return currentQuote.split(" ").length;
}

function GetCorrectWords()
{
    // Get word array. Current quote is the quote we need.
    let words = currentQuote.split(" ");

    
   // Initialize an array to store incorrect words.
    let incorrectWords = [];
    
    // Loop through savedCharIndexs to find incorrect characters
    for (let i = 0; i < savedCharIndexs.length; i++) {
        if (!savedCharIndexs[i]) {
            // Make variables.
            let charIndex = 0;
            let wordIndex = 0;
    
            // Find the index of the character in the words array
            for (let j = 0; j < words.length; j++) {
                if (charIndex + words[j].length + (j > 0 ? 1 : 0) > i) {
                    wordIndex = j;
                    break;
                }
                charIndex += words[j].length + (j > 0 ? 1 : 0); // +1 for the spaces in the string.
            }
    
            // Add the incorrect word to the array if it's not already included
            if (!incorrectWords.includes(words[wordIndex])) {
                incorrectWords.push(words[wordIndex]);
            }
        }
    }
    
    let totalWordsGot = words.length - incorrectWords.length;
    return totalWordsGot;
}

function CalculateWPM()
{

    let totalWordsGot = GetCorrectWords();

    // Calculate time taken.
    let totalTime = timeEnd - timeStart;
    let totalMinutes = totalTime / 60;
    
    // Calculate wpm.
    let WPM = totalWordsGot / totalMinutes;
    
    return WPM.toFixed(1);
}

function UpdateParagraph(currentString)
{
    // Reset text.
    paragraphText.innerHTML = "";
    
     // Loop through and set colors.
    for (let i = 0; i < currentString.length; i++)
    {
        // Create variable.
        let spanType;
            
        // Get correct span type.
        if (i < currentCharIndex)
        {
            // Check if the key pressed was correct.
            if (savedCharIndexs[i] == true)
            {
                spanType = "<span class='correctCharacter'>";  
            }
            else if (savedCharIndexs[i] == null || savedCharIndexs[i] == undefined || savedCharIndexs[i] == false)
            {
                spanType = "<span class='incorrectCharacter'>";  
            }
        }
        else
        {
            spanType = "";
        }
            
        // Set span.
        paragraphText.innerHTML += spanType + currentString[i] + "</span>";
    }
}

function Keybinds(event)
{
    // Get key
    let key = (event.key).toLowerCase();
    
    // Check for keybinds
    if (keybinds[key])
    {
        keybinds[key]();
    }
}

function KeyPressed(event)
{
    if (!isTyping) return;
    
    // Get key we pressed.
    let keyCode = event.key;
    let isBackspace = false;

    // We don't want to listen for shifts.
    if (keyCode == "Shift" || keyCode == "LeftShift" || keyCode == "Enter") return;
    
    // We do want to check for an backspace
    if (keyCode == "Backspace")
    {
        // Go back 2 spaces since we are in index form.
        isBackspace = true;
        currentCharIndex -= 1;
        
        // Check if was a miss
        if (savedCharIndexs[currentCharIndex] == false)
        {
            // Take away the miss.
            if (misses > 0)
            {
                misses--;
            }
        }
        
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
    if (currentCharIndex == 1)
    {
        console.log("Start");
        timeStart = new Date().getTime() / 1000;
    }
    
    // Check if we pressed right key.
    if (keyCode == currentText)
    {
        savedCharIndexs[currentCharIndex - 1] = true;
    }
    else
    {
        misses++;
        savedCharIndexs[currentCharIndex - 1] = false;
    }
        
    // Update the paragraph.
    UpdateParagraph(currentString);
    
    // Check if we finished
    if (currentCharIndex >= currentString.length)
    {
        // End
        timeEnd = new Date().getTime() / 1000;
        stillShowData = true;
        console.log("End");
        
        // Load the menu.
        isTyping = false;
        LoadMenu(true);
    }
}

// CONNECTIONS
window.addEventListener('keydown', KeyPressed);
window.addEventListener('keydown', Keybinds);
homeButton.addEventListener('click', () => {
    LoadMenu(false);
});

// INITIALIZATION
Start();