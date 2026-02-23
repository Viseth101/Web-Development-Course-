// script.js
document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const scoreDisplay = document.getElementById('score');
    const flipsDisplay = document.getElementById('flips');
    const remainingDisplay = document.getElementById('remaining');
    const hardModeCounter = document.getElementById('hardModeCounter');
    const hintBtn = document.getElementById('hintBtn');
    const resetBtn = document.getElementById('resetBtn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    
    const cardsArray = [
        '🎨', '🎨', '🎮', '🎮', '🎪', '🎪', '🎭', '🎭',
        '🎸', '🎸', '🎺', '🎺', '🎻', '🎻', '🎯', '🎯'
    ];

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let score = 0;
    let flips = 0;
    let gameMode = 'normal';
    let maxFlips = Infinity;
    let matchedCards = 0;

    function createCard(value) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = value;
        card.addEventListener('click', flipCard);
        return card;
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

        // Check if game over in hard mode
        if (gameMode === 'hard' && flips >= maxFlips) {
            showGameOver(false);
            return;
        }

        this.classList.add('flipped');
        
        setTimeout(() => {
            this.textContent = this.dataset.value;
        }, 300);
        
        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        lockBoard = true;
        flips++;
        updateFlipsDisplay();

        checkForMatch();
    }

    function checkForMatch() {
        if (firstCard.dataset.value === secondCard.dataset.value) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        score++;
        matchedCards += 2;
        updateScoreDisplay();

        if (matchedCards === 16) {
            setTimeout(() => showGameOver(true), 500);
        } else {
            resetBoard();
        }
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.add('unflipping');
            secondCard.classList.add('unflipping');
            
            setTimeout(() => {
                firstCard.classList.remove('flipped', 'unflipping');
                secondCard.classList.remove('flipped', 'unflipping');
                firstCard.textContent = '';
                secondCard.textContent = '';
                resetBoard();
            }, 600);
        }, 1000);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }

    function updateFlipsDisplay() {
        flipsDisplay.textContent = flips;
        if (gameMode === 'hard') {
            const remaining = maxFlips - flips;
            remainingDisplay.textContent = Math.max(0, remaining);
            
            if (remaining <= 0) {
                hintBtn.disabled = true;
                lockBoard = true;
            }
        }
    }

    function showHint() {
        if (lockBoard || firstCard) return;

        const unflippedCards = Array.from(gameBoard.querySelectorAll('.card:not(.flipped):not(.matched)'));
        
        if (unflippedCards.length === 0) return;

        const hintCard = unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
        hintCard.style.opacity = '0.5';
        
        setTimeout(() => {
            hintCard.textContent = hintCard.dataset.value;
        }, 300);

        hintBtn.disabled = true;

        setTimeout(() => {
            hintCard.textContent = '';
            hintCard.style.opacity = '1';
            hintBtn.disabled = false;
        }, 2000);
    }

    function initGame() {
        gameBoard.innerHTML = '';
        score = 0;
        flips = 0;
        matchedCards = 0;
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        hintBtn.disabled = false;
        
        updateScoreDisplay();
        updateFlipsDisplay();

        shuffle(cardsArray);
        cardsArray.forEach(value => {
            const card = createCard(value);
            gameBoard.appendChild(card);
        });
    }

    function showGameOver(isWin) {
        lockBoard = true;
        
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay);

        const gameOverDiv = document.createElement('div');
        gameOverDiv.classList.add('game-over');
        
        if (isWin) {
            gameOverDiv.innerHTML = `
                <h2>🎉 You Won! 🎉</h2>
                <p>Score: ${score}</p>
                <p>Flips: ${flips}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Play Again</button>
            `;
        } else {
            gameOverDiv.innerHTML = `
                <h2>Game Over! 😅</h2>
                <p>You ran out of flips in Hard Mode!</p>
                <p>Score: ${score}</p>
                <p>Flips Used: ${flips}/${maxFlips}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Try Again</button>
            `;
        }
        
        document.body.appendChild(gameOverDiv);
    }

    // Mode selection
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameMode = btn.dataset.mode;
            maxFlips = gameMode === 'hard' ? 20 : Infinity;
            hardModeCounter.style.display = gameMode === 'hard' ? 'flex' : 'none';
            initGame();
        });
    });

    // Hint button
    hintBtn.addEventListener('click', showHint);

    // Reset button
    resetBtn.addEventListener('click', initGame);

    initGame();
});