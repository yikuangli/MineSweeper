const gameContainer = document.getElementById("game-container");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const restartBtn = document.getElementById("restart-btn");
const mineCount = 20;
const rowCount = 15;
const colCount = 11;
const cells = [];

const inputHistory = [];

const timerElement = document.getElementById("time-count");
const minesRemainingElement = document.getElementById("mines-count");
let timerInterval;
let timeCount = 0;
let minesRemaining = mineCount;
let gameStarted = false;
let firstClick = true;

// Add this function to update the timer
function updateTimer() {
    timeCount++;
    timerElement.textContent = timeCount;
}

function resetTimer() {
    timerElement.textContent = 0;
}

// Add this function to update the mines remaining display
function updateMinesRemaining() {
    minesRemainingElement.textContent = minesRemaining;
}



// Add this function to show the modal with a message
function showModal(message) {
    clearInterval(timerInterval);
    modalTitle.innerHTML = message;
    modal.classList.remove("hidden");
}

// Add this function to restart the game
function restartGame() {
    clearInterval(timerInterval);
    // Clear the game container and cells array
    gameContainer.innerHTML = '';
    cells.length = 0;
    gameStarted = false;

    // Reset the game state
    gameOver = false;
    firstClick = true;
    resetTimer();
    // Restart the game
    startGame(rowCount, colCount, mineCount);

    // Hide the modal
    modal.classList.add("hidden");
}

restartBtn.addEventListener("click", restartGame);



// Add an event listener for the restart button

let gameOver = false;


function startTimer() {
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function startGame(rowCount, colCount, mineCount) {
    initializeGrid(rowCount, colCount);
    // placeMines(mineCount);
    attachEventListeners();
    timeCount = 0;
    minesRemaining = mineCount;
    updateMinesRemaining();
    // Update the timer every second
}

function initializeGrid(rowCount, colCount) {
    gameContainer.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
    gameContainer.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
    for (let i = 0; i < rowCount * colCount; i++) {
        const cell = document.createElement("button");
        cell.className = "cell";
        cell.dataset.state = "unrevealed";
        gameContainer.appendChild(cell);
        cells.push(cell);
    }
}

function createSeededRandom(seed) {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;

    let state = seed ? seed : Math.floor(Math.random() * (m - 1));

    return function () {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
}
function placeMines(mineCount, firstClickIndex) {
    const date = new Date();
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const seededRandom = createSeededRandom(seed);

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const index = Math.floor(seededRandom() * cells.length);
        if (!cells[index].dataset.mine && !getSurroundingIndices(firstClickIndex).includes(index) && index !== firstClickIndex) {
            cells[index].dataset.mine = "true";
            minesPlaced++;
        }
    }
}

function isMobileDevice() {
    return (
        typeof window.orientation !== "undefined" ||
        navigator.userAgent.indexOf("IEMobile") !== -1
    );
}

//Create a function to show the hover buttons around the touched grid
function showHoverButtons(index, revealCallback, flagCallback, revealSurroundingsCallback) {
    const cell = cells[index];
    if (cell.dataset.state === "revealed") {
        let unrevealed = hasUnrevealedSurrounding(index);
        if (!unrevealed) return;
        let flags = checkSurroundingFlags(index)
        let selfFlagNumber = parseInt(cell.textContent)
        if (isNaN(selfFlagNumber) || selfFlagNumber !== flags) return;
    }

    const hoverButtonsContainer = document.createElement("div");
    hoverButtonsContainer.className = "hover-buttons-container";
    hoverButtonsContainer.dataset.index = index;
    let revealButton
    if (cell.dataset.state !== "flagged") {
        revealButton = document.createElement("button");
        revealButton.className = "hover-button reveal";
        revealButton.textContent = "⛏️";
        revealButton.addEventListener("click", () => {
            if (cell.dataset.state === "revealed") {
                revealUnflaggedSurroundings(index)
            } else {
                reveal(index);
            }
            closeHoverButtons(hoverButtonsContainer);
        });
    }
    let flagButton
    if (cell.dataset.state !== "revealed") {
        flagButton = document.createElement("button");
        flagButton.className = "hover-button flag";
        flagButton.textContent = "🚩";
        flagButton.addEventListener("click", () => {
            toggleFlag(index);
            closeHoverButtons(hoverButtonsContainer);
        });
    }

    const closeButton = document.createElement("button");
    closeButton.className = "hover-button close";
    closeButton.textContent = "X";
    closeButton.addEventListener("click", () => {
        closeHoverButtons(hoverButtonsContainer);
    });

    if (revealButton) hoverButtonsContainer.appendChild(revealButton);
    if (flagButton) hoverButtonsContainer.appendChild(flagButton);
    hoverButtonsContainer.appendChild(closeButton);
    document.body.appendChild(hoverButtonsContainer);


    const cellRect = cell.getBoundingClientRect();
    
    hoverButtonsContainer.style.top = `${cellRect.top}px`;
    hoverButtonsContainer.style.left = `${cellRect.left}px`;
    hoverButtonsContainer.style.width = `${cellRect.width}px`;
    hoverButtonsContainer.style.height = `${cellRect.height}px`;
    hoverButtonsContainer.style.position = `fixed`;
}
function closeHoverButtons(hoverButtonsContainer) {
    document.body.removeChild(hoverButtonsContainer);
}


function isMobileDevice() {
    return (
        typeof window.orientation !== "undefined" ||
        navigator.userAgent.indexOf("IEMobile") !== -1
    );
}


function getSurroundingIndices(index) {
    const x = index % colCount;
    const y = Math.floor((index - x) / colCount);
    let surroundingMines = 0;
    let surroundingIndexes = []
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newX < colCount && newY >= 0 && newY < rowCount) {
                const neighborIndex = newY * colCount + newX;
                surroundingIndexes.push(neighborIndex)
            }
        }
    }
    return surroundingIndexes
}

function attachEventListeners() {
    cells.forEach((cell, index) => {

        if (isMobileDevice()) {
            cell.addEventListener("touchend", (event) => {
                event.preventDefault();
                const existingHoverButtons = document.querySelector(".hover-buttons-container");
                if (existingHoverButtons) {
                    closeHoverButtons(existingHoverButtons);
                }
                const revealSurroundingsCallback =
                    cell.dataset.state === "revealed" &&
                        checkSurroundingFlags(index) &&
                        hasUnrevealedSurrounding(index)
                        ? revealUnflaggedSurroundings
                        : null;

                showHoverButtons(
                    index,
                    reveal,
                    toggleFlag,
                    revealSurroundingsCallback,
                    closeHoverButtons
                );
            });
        } else {
            cell.addEventListener("click", () => {
                reveal(index);
            });

            cell.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                toggleFlag(index);
            });

            cell.addEventListener("mousedown", (event) => {
                if (event.buttons === 3) {
                    revealUnflaggedSurroundings(index);
                }
            });
        }

    });
}

function checkSurroundingFlags(index) {
    let neighborIndexs = getSurroundingIndices(index);
    let flag = 0;
    neighborIndexs.forEach(v => {
        if (cells[v].dataset.state === "flagged") flag++;
    });
    return flag;

}
function hasUnrevealedSurrounding(index) {
    let neighborIndexs = getSurroundingIndices(index);
    let unrevealed = 0;
    neighborIndexs.forEach(v => {
        if (cells[v].dataset.state === "unrevealed") unrevealed++;
    });
    return unrevealed;
}

function toggleFlag(index) {
    const cell = cells[index];

    if (cell.dataset.state === "unrevealed") {
        cell.dataset.state = "flagged";
        cell.textContent = "🚩";
        minesRemaining--;
    } else if (cell.dataset.state === "flagged") {
        cell.dataset.state = "unrevealed";
        cell.textContent = "";
        minesRemaining++;
    }

    updateMinesRemaining();
}

function checkGameCompletion() {
    let unrevealedNonMines = 0;
    for (const cell of cells) {
        if (cell.dataset.state === "unrevealed" && !cell.dataset.mine) {
            unrevealedNonMines++;
        }
    }

    if (unrevealedNonMines === 0) {
        winGame()
    }
}

function winGame() {
    gameOver = true;
    const stats = loadGameStats();
    stats.gamesPlayed++;
    stats.gamesWon++;

    const timeUsed = parseFloat(timerElement.textContent);
    if (stats.bestTime === null || timeUsed < stats.bestTime) {
        stats.bestTime = timeUsed;
    }
    saveGameStats(stats);
    cells.forEach((cell) => {
        if (cell.dataset.state === "hidden" || cell.dataset.state === "flagged") {
            cell.classList.add("beat-game");
        }
    });
    showModal("Congratulations! You won the game!");
}

function loseGame(cell, index) {
    const stats = loadGameStats();
    stats.gamesPlayed++;
    saveGameStats(stats);
    cell.dataset.state = "exploded";
    cell.style.backgroundColor = "black";
    cells[index].classList.add("touched-mine");
    gameOver = true;
    showModal("Game Over! You hit a mine.");

}

function reveal(index) {
    if (firstClick) {
        placeMines(mineCount, index);
        firstClick = false;
    }
    const cell = cells[index];

    if (cell.dataset.state !== "unrevealed" || gameOver) {
        return;
    }

    startTimer();
    inputHistory.push({ action: "reveal", index });
    if (cell.dataset.mine) {
        loseGame(cell, index)
        return;
    }

    const x = index % colCount;
    const y = Math.floor((index - x) / colCount);
    let surroundingMines = 0;

    let surroundingIndexes = getSurroundingIndices(index)
    surroundingIndexes.forEach(neighborIndex => {
        if (cells[neighborIndex].dataset.mine) {
            surroundingMines++;
        }
    })
    cell.dataset.state = "revealed";
    cell.classList.add("revealed");
    // cell.style.backgroundColor = "#eee";
    cell.dataset.number = surroundingMines || "";
    cell.textContent = surroundingMines || "";
    checkGameCompletion();

    if (surroundingMines === 0) {
        revealSurroundings(index);
    }
}

function revealUnflaggedSurroundings(index) {
    const cell = cells[index];

    if (cell.dataset.state !== "revealed") {
        return;
    }
    let surroundingFlags = 0;
    let surroundingIndexes = getSurroundingIndices(index)
    surroundingIndexes.forEach(neighborIndex => {
        if (cells[neighborIndex].dataset.state === "flagged") {
            surroundingFlags++;
        }
    })
    if (parseInt(cell.textContent) === surroundingFlags) {
        revealSurroundings(index);
    }
}

function revealSurroundings(index) {
    const x = index % colCount;
    const y = Math.floor((index - x) / colCount);
    let surroundingIndexes = getSurroundingIndices(index)
    surroundingIndexes.forEach(neighborIndex => {
        reveal(neighborIndex);
    })
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function applyTheme(theme) {
    const body = document.body;
    body.className = theme;
    saveThemePreference(theme);
}

function loadThemePreference() {
    const theme = localStorage.getItem("theme");
    applyTheme(theme);
}

function saveThemePreference(theme) {
    localStorage.setItem("theme", theme);
}


applyTheme("theme-dark");
loadThemePreference();

const gameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    // Add more stats as needed
};

function saveGameStats() {
    localStorage.setItem("gameStats", JSON.stringify(gameStats));
}

function loadGameStats() {
    const savedStats = localStorage.getItem("gameStats");
    if (savedStats) {
        Object.assign(gameStats, JSON.parse(savedStats));
    }
    console.log(savedStats)
}

function saveGameStats(stats) {
    localStorage.setItem("gameStats", JSON.stringify(stats));
}

function loadGameStats() {
    const savedStats = localStorage.getItem("gameStats");
    return savedStats ? JSON.parse(savedStats) : {
        gamesPlayed: 0,
        gamesWon: 0,
        bestTime: null,
    };
}

function showStatsModal() {
    const stats = loadGameStats();
    const bestTime = stats.bestTime ? `${(stats.bestTime).toFixed(2)} seconds` : "N/A";

    const content = `
      <p>Games Played: ${stats.gamesPlayed}</p>
      <p>Games Won: ${stats.gamesWon}</p>
      <p>Best Time: ${bestTime}</p>
    `;

    showModal(content);
}

function toggleDropdown() {
    const menu = document.getElementById("menu");
    menu.classList.toggle("menu-dropdown-open");
}

startGame(rowCount, colCount, mineCount); // 10x15 grid with 20 mines

