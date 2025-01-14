// Updated script.js to integrate Supabase

let score = 0;
let colorChangeTime;
let clickTimes = [];
let currentIteration = 0;
let userAge, userGender;
let gameOver = false; // Flag to track if the game is over

// Supabase Configuration
const SUPABASE_URL = "https://zgpaebwhtyjyhsshmlwc.supabase.co"; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncGFlYndodHlqeWhzc2htbHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4Mjg4NjgsImV4cCI6MjA1MjQwNDg2OH0.jzPqBdqQnl9s_D9uGwZ7jTARkgBvL2sc8nc93d4s_Vg"; // Replace with your anon key

// Initialize Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const message = document.getElementById('message');
const userData = document.getElementById('userData');
const timesList = document.getElementById('timesList');
const averageTimeDisplay = document.getElementById('averageTime');
const inputArea = document.getElementById('inputArea');
const userForm = document.getElementById('userForm');
const ageInput = document.getElementById('age');
const genderInput = document.getElementById('gender');

function getRandomColor() {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD', '#1ABC9C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function startGame() {
    score = 0;
    clickTimes = [];
    currentIteration = 0;
    gameOver = false; // Reset game-over flag
    updateScore();
    message.textContent = "Wait for the color change!";
    changeColorRandomly();
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function changeColorRandomly() {
    const randomDelay = Math.random() * 8000; // Random interval between 0 and 8 seconds
    colorChangeTime = Date.now() + randomDelay;

    setTimeout(() => {
        if (currentIteration < 5 && !gameOver) { // Check if game is not over
            gameArea.style.backgroundColor = getRandomColor();
            message.textContent = "Tap now!";
            currentIteration++;
        }
        if (currentIteration < 5 && !gameOver) {
            changeColorRandomly(); // Repeat the color change
        }
    }, randomDelay);
}

gameArea.addEventListener('click', () => {
    if (gameOver) {
        return; // Prevent clicks after the game is over
    }

    if (currentIteration > 0 && currentIteration <= 5) {
        const timeToClick = Date.now() - colorChangeTime; // Time taken from color change to click

        // Ensure time is positive
        if (timeToClick >= 0) {
            clickTimes.push(timeToClick);
        }

        message.textContent = `Good job! Wait for the next color change.`;

        if (currentIteration === 5) {
            showResults();
            gameOver = true; // Set game-over flag after the 5th iteration
        }
    }
});

function recordDataToSupabase(data) {
    supabase
        .from('responses')
        .insert([data])
        .then(response => {
            if (response.error) {
                console.error("Error saving data to Supabase:", response.error.message);
            } else {
                console.log("Data saved to Supabase:", response.data);
            }
        })
        .catch(error => console.error("Unexpected error:", error));
}

function showResults() {
    // Display individual times with rounding
    let timesText = "Times to click (in milliseconds):\n";
    clickTimes.forEach((time, index) => {
        timesText += `Iteration ${index + 1}: ${Math.round(time)} ms\n`;
    });
    timesList.textContent = timesText;

    // Calculate and display average time with rounding
    const totalTime = clickTimes.reduce((acc, time) => acc + time, 0);
    const averageTime = totalTime / clickTimes.length;
    averageTimeDisplay.textContent = `Average time: ${Math.round(averageTime)} ms`;

    // Prepare data
    const data = {
        age: parseInt(userAge),
        gender: userGender,
        reaction_times: JSON.stringify(clickTimes),
        average_time: averageTime,
    };

    // Save data to Supabase
    recordDataToSupabase(data);
}

userForm.addEventListener('submit', function(event) {
    event.preventDefault();

    userAge = ageInput.value;
    userGender = genderInput.value;

    // Display the user's data and hide the input form
    userData.textContent = `User Data: Age - ${userAge}, Gender - ${userGender}`;
    inputArea.style.display = 'none';
    gameArea.style.display = 'flex';

    startGame();
});
