"use strict";

// Module
// This is the game itself. It contains all the game settings/data.
// Keeps track of how many players, if a player is ai, who is the current player, etc
const Game = (function()
{
    // DOM references
    /** @type {HTMLDivElement} */
    const startMenu = document.querySelector('.startMenu');
    /** @type {HTMLDivElement} */
    const startButton = document.querySelector('.startButton');
    /** @type {HTMLDivElement} */
    const winnerMenu = document.querySelector('.winnerMenu');
    /** @type {HTMLDivElement} */
    const winnerName = document.querySelector('.winnerName');
    /** @type {HTMLDivElement} */
    const text1 = document.querySelector('.text1');
    /** @type {HTMLDivElement} */
    const playAgainButton = document.querySelector('.playAgainButton');

    // Game variables
    let gameStart = false; //Bool flag to check if the game is in progress or started.

    // Player variables
    let player1 = Player("John", 'X');
    let player2 = Player("Jane", 'O');
    let currentPlayer = player1;

    // This method handles all starting initilization for the game.
    function init()
    {
        // Check player names
        console.log("Player1: " + player1.getName());
        console.log("Player2: " + player2.getName());

        setBindings();

        winnerMenu.style.display = 'none';
    }

    // This method handles binding elements with event listeners
    function setBindings() 
    {
        startButton.addEventListener('click', startGame, 'false');
        playAgainButton.addEventListener('click', restartGame, 'false');
    }

    // This method handles the start of the game and getting the round ready for play.
    // We have to choose players, then we start the game by activating the board.
    function startGame()
    {
        console.log("Starting game");
        startMenu.style.display = 'none';
        Board.toggleActive();
    }

    // This method returns the current player
    function getCurrentPlayer()
    {
        return currentPlayer;
    }

    //The method handles switching the current player from player 1 to player 2
    // and vise-versa. Player 2 will either be a player or an AI(if implemented).
    function switchCurrentPlayer()
    {
        console.log("Switching player");
        if(currentPlayer === player1)
        {
            currentPlayer = player2;
            Board.setBoardColor('player2');
        }
        else if(currentPlayer === player2)
        {
            currentPlayer = player1;
            Board.setBoardColor('player1');
        }
    }

    // This method handles telling the user of the winner and doing the final-
    // closing tasks to clean up the game for the next game.
    function declareWinner()
    {
        // Declare the current player as the winner and do all the display-
        // magic to tell the users that the game is ended and if they want to try again.
        console.log(currentPlayer.getName() + " is the winner!");
        Board.toggleActive();
        winnerName.textContent = currentPlayer.getName();
        winnerMenu.style.display = 'grid';
    }

    // This method handles the scenerio when the match is a tie
    function declareTie()
    {
        Board.toggleActive();
        winnerName.textContent = "Match is a tie!"
        text1.textContent = "";
        winnerMenu.style.display = 'grid';
    }

    // This method handles resetting the game to the default settings-
    // This includes resetting the board, players.
    function restartGame()
    {
        console.log("Restarting game...");
        Board.restartBoard();
        winnerMenu.style.display = 'none';
        startMenu.style.display = 'grid';
        currentPlayer = player1;
    }

    init();

    return {
                getCurrentPlayer: getCurrentPlayer, 
                declareWinner: declareWinner, 
                switchCurrentPlayer: switchCurrentPlayer,
                declareTie: declareTie
           };
})();

// Module
// Main board of the game. It contains all the board properties and keeps-
// track of whats on the board.
const Board = (function()
{
    // DOM References \\
    /** @type {HTMLDivElement} */
    const board = document.querySelector('.board');
    const boardCells = document.querySelector('.board').querySelectorAll('.boardCell');

    //  Variables \\
    // This array will hold all the values of the board. 
    // It keeps track on where X/O is present on the board.
    const boardCellsArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // This keeps track of how many empty cells are left. This helps with
    // finding out if the match was a tie or not.
    let openCellCount = 9;

    // This method handles all creation initilization of the board.
    function init()
    {
        bindCells();
        setBoardColor('player1');
        openCellCount = 9;
    }

    // This method handles assigning the correct value to each cell on the board-
    // by binding the array elements to the click event.
    function bindCells()
    {
        for (let i = 0; i < boardCellsArray.length; i++) 
        {
            // we go ahead and have each button listen to clicks-
            // that will do the same thing by assigning the array element to the cell.
            boardCells[i].addEventListener('click', applyCellBinding.bind(boardCells[i], i), false);
        }
    }

    // This method applies the value of the array element to the board cell element.
    // We also make sure to call the function that checks if there is a winnder. This should-
    // only happen when a player clicks on the board. No need to check each frame.
    // This is super important. Everything depends on the button click which makes sense
    // because that's how the game can progress. Tie everything in a event listener to continue on
    // with the game.
    function applyCellBinding(i)
    {
        // Update display cell and cell element in array with the correct value.
        console.log("Value Changed");
        boardCells[i].textContent = boardCellsArray[i] = Game.getCurrentPlayer().getValue();
        
        // Disable cell button after pressed to make sure it doesn't get pressed again.
        boardCells[i].disabled = true; // This lets you disable a button
        
        // Subtract from openCellCount to make sure we keep track of avaliable spots left.
        openCellCount--;

        // Check for winner
        checkForWinner();

        //Check for tie
        checkForTie();
        
        // If a button was clicked, that means the player has picked their cell
        // and we can go ahead and switch to the next player.
        Game.switchCurrentPlayer();
    }

    // This method handles checking to see if there is a winner.
    // It checks to see if there are 3 of the same value in a row/column/diagonal on the board.
    // If it's true then we want to go ahead and tell the Game module that there is a winner and -
    // to declare it from their end.
    function checkForWinner()
    {
        // Check cell algorithm. If true then declare winner.
        // We check each row, column, then diagonal. There is only 8 sets.
        // Row checks
        checkIfCellsEqual(0, 1, 2) ? Game.declareWinner() : null;
        checkIfCellsEqual(3, 4, 5) ? Game.declareWinner() : null;
        checkIfCellsEqual(6, 7, 8) ? Game.declareWinner() : null;
        
        //Column Checks
        checkIfCellsEqual(0, 3, 6) ? Game.declareWinner() : null;
        checkIfCellsEqual(1, 4, 7) ? Game.declareWinner() : null;
        checkIfCellsEqual(2, 5, 8) ? Game.declareWinner() : null;
        
        // Diagonal checks
        checkIfCellsEqual(0, 4, 8) ? Game.declareWinner() : null;
        checkIfCellsEqual(2, 4, 6) ? Game.declareWinner() : null;
    }

    function checkForTie()
    {
        if(openCellCount <= 0)
        {
            console.log("Tie Match");
            Game.declareTie();
        }
    }

    // Check to see if arguments are equal.
    // We use this function to compare cells. We check rows, columns, then diagonals.
    function checkIfCellsEqual(a, b, c)
    {
        let len = arguments.length;
        for (let i = 1; i < len; i++) 
        {
            if(boardCellsArray[a] !== boardCellsArray[arguments[i]])
            {
                return false;
            }
        }

        return true;
    }

    // This method handles setting the board active. This means the board will be clickable.
    // This is used so we can disable the board before the game starts.
    function toggleActive()
    {
        board.classList.contains('disableClick') ? board.classList.remove('disableClick') : board.classList.add('disableClick');
    }

    // This method changes the color of the board to fit the current player's turn color.
    function setBoardColor(currentPlayer)
    {
        console.log(currentPlayer);

         if(currentPlayer === 'player1')
         {
            board.classList.remove('player2Turn');
            board.classList.add('player1Turn');
         }
         else if(currentPlayer === 'player2')
         {
            board.classList.remove('player1Turn');
            board.classList.add('player2Turn');
         }
    }

    // This method handles resetting the board back to default values.
    function restartBoard()
    {
        console.log("Restarting board...");

        // Resets all the cell buttons on the board to enabled for the next game.
        boardCells.forEach(cellButton => 
        {
            console.log("Resetting cell");
            cellButton.disabled = false;
            cellButton.textContent = ''; 
        });    

        // Resets all the cell elements in array to numbers from 0 to 9.
        for (let i = 0; i < boardCellsArray.length; i++) 
        {
            boardCellsArray[i] = i;
        }

        // set default board color which is player1 by default.
        setBoardColor('player1');

        // Reset openCellCount so we have the correct number of avaliable open cells
        openCellCount = 9;
    }

    // We initilize the board before returning.
    init();

    return { 
        restartBoard: restartBoard,
        toggleActive: toggleActive,
        setBoardColor: setBoardColor
    };
})();

function Player(newName, newValue)
{
    let name = newName;
    let value = newValue;

    function getName()
    {
        return name;
    }

    function getValue()
    {
        return value;
    }

    return{ getName: getName, getValue: getValue};
}

