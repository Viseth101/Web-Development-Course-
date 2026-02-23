// script.js - Complete Memory Card Game with All Features
document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM ELEMENTS =====
    const gameBoard = document.getElementById('gameBoard');
    const scoreDisplay = document.getElementById('score');
    const flipsDisplay = document.getElementById('flips');
    const comboDisplay = document.getElementById('combo');
    const remainingDisplay = document.getElementById('remaining');
    const hardModeCounter = document.getElementById('hardModeCounter');
    const timerDisplay = document.getElementById('timer');
    const speedrunTimeDisplay = document.getElementById('speedrunTime');
    const speedrunTimerContainer = document.getElementById('speedrunTimer');
    const playerDisplay = document.getElementById('currentPlayer');
    const playerTurnContainer = document.getElementById('playerTurn');
    const hintBtn = document.getElementById('hintBtn');
    const undoBtn = document.getElementById('undoBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const soundToggle = document.getElementById('soundToggle');
    const musicToggle = document.getElementById('musicToggle');
    const statsBtn = document.getElementById('statsBtn');
    const instructionsBtn = document.getElementById('instructionsBtn');
    const gameModeButtons = document.querySelectorAll('.game-mode-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const gridBtns = document.querySelectorAll('.grid-btn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const instructionsModal = document.getElementById('instructionsModal');
    const statsModal = document.getElementById('statsModal');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const resumeBtn = document.getElementById('resumeBtn');
    const achievementPopup = document.getElementById('achievementPopup');
    const achievementsList = document.getElementById('achievementsList');
    const highScoresList = document.getElementById('highScores');
    const powerupsDisplay = document.getElementById('powerupsDisplay');
    const confettiCanvas = document.getElementById('confetti');
    const confettiCtx = confettiCanvas.getContext('2d');

    // Close buttons for modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // ===== SETTINGS MODAL =====
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
        });
    }

    // ===== THEME DEFINITIONS =====
    const themes = {
        arts: ['🎨', '🎮', '🎪', '🎭', '🎸', '🎺', '🎻', '🎯'],
        animals: ['🐶', '🐱', '🐻', '🐼', '🦁', '🐯', '🦊', '🐭'],
        food: ['🍕', '🍔', '🍟', '🌭', '🍗', '🍖', '🌮', '🌯'],
        sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥊']
    };

    // ===== ACHIEVEMENTS DEFINITIONS =====
    const achievements = [
        { id: 'first_win', emoji: '🎉', name: 'First Win', desc: 'Win your first game', condition: () => stats.totalGames === 1 },
        { id: 'speed_demon', emoji: '⚡', name: 'Speed Demon', desc: 'Win in under 30 flips', condition: () => flips < 30 && matchedCards === gridSize * gridSize },
        { id: 'perfect_combo', emoji: '🔥', name: 'Perfect Combo', desc: 'Get 8+ combo', condition: () => combo >= 8 },
        { id: 'insane_master', emoji: '💀', name: 'Insane Master', desc: 'Win Insane Mode', condition: () => gameMode === 'insane' && matchedCards === gridSize * gridSize },
        { id: 'collector', emoji: '🏆', name: 'Collector', desc: 'Win 10 games', condition: () => stats.totalGames >= 10 },
        { id: 'memory_pro', emoji: '🧠', name: 'Memory Pro', desc: 'Win with 95%+ accuracy', condition: () => {
            const accuracy = (matchedCards / (gridSize * gridSize)) / (flips / 2);
            return accuracy > 0.95 && matchedCards === gridSize * gridSize;
        }},
        { id: 'daily_champion', emoji: '📅', name: 'Daily Champion', desc: 'Win Daily Challenge', condition: () => gameMode === 'daily' && matchedCards === gridSize * gridSize },
        { id: 'speedrun_champion', emoji: '🏃', name: 'Speed Runner', desc: 'Complete Speed Run', condition: () => gameMode === 'speedrun' && matchedCards === gridSize * gridSize }
    ];

    // ===== GAME STATE =====
    let gameMode = 'classic';
    let currentGameMode = 'classic';
    let difficulty = 'normal';
    let gridSize = 4;
    let cardsArray = [];
    let currentTheme = 'arts';
    let soundEnabled = true;
    let musicEnabled = false;
    let darkModeEnabled = false;

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let score = 0;
    let combo = 0;
    let flips = 0;
    let maxFlips = Infinity;
    let matchedCards = 0;
    let gameRunning = true;
    let gamePaused = false;
    let gameStartTime = 0;
    let speedrunTime = 0;
    let speedrunInterval = null;
    let difficultyTimer = null;
    let timeRemaining = 60;
    let multiplayerMode = false;
    let currentPlayer = 1;
    let player1Score = 0;
    let player2Score = 0;

    let stats = JSON.parse(localStorage.getItem('gameStats')) || {
        totalGames: 0,
        wins: 0,
        losses: 0,
        totalFlips: 0,
        bestScore: 0,
        achievements: []
    };

    let dailyChallengeCards = null;

    // ===== INITIALIZATION =====
    function init() {
        loadDarkMode();
        displayAchievements();
        displayHighScores();
        updateStats();
        initGameBoard();
    }

    // ===== DARK MODE =====
    function loadDarkMode() {
        darkModeEnabled = localStorage.getItem('darkMode') === 'true';
        if (darkModeEnabled) {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️ Light Mode';
        }
    }

    darkModeToggle.addEventListener('click', () => {
        darkModeEnabled = !darkModeEnabled;
        localStorage.setItem('darkMode', darkModeEnabled);
        document.body.classList.toggle('dark-mode');
        darkModeToggle.textContent = darkModeEnabled ? '☀️ Light Mode' : '🌙 Dark Mode';
    });

    // ===== SOUND SYSTEM =====
    function playSound(type) {
        if (!soundEnabled) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            const sounds = {
                flip: { freq: 400, duration: 0.1 },
                match: { freq: 600, duration: 0.2 },
                win: { freq: 800, duration: 0.3 }
            };

            if (sounds[type]) {
                oscillator.frequency.value = sounds[type].freq;
                gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sounds[type].duration);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + sounds[type].duration);
            }
        } catch (e) {
            // Audio context not available, silently fail
        }
    }

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? '🔊 Sound' : '🔇 Sound';
    });

    musicToggle.addEventListener('click', () => {
        musicEnabled = !musicEnabled;
        musicToggle.textContent = musicEnabled ? '🎵 Music On' : '🎵 Music Off';
    });

    // ===== POWER-UPS SYSTEM =====
    const powerups = [
        { id: 'freeze', emoji: '❄️', name: 'Freeze', desc: 'Pause time for 5s', uses: 1 },
        { id: 'reveal', emoji: '👁️', name: 'Reveal All', desc: 'See all cards for 2s', uses: 1 },
        { id: 'double', emoji: '2️⃣', name: 'Double Points', desc: '+2x points for 30s', uses: 1 }
    ];

    let activePowerups = [];

    function generateRandomPowerups() {
        if (Math.random() < 0.3) { // 30% chance to get a powerup
            const randomPowerup = { ...powerups[Math.floor(Math.random() * powerups.length)] };
            activePowerups.push(randomPowerup);
            displayPowerups();
        }
    }

    function displayPowerups() {
        powerupsDisplay.innerHTML = activePowerups.map(p => 
            `<div class="powerup-item" onclick="usePowerup('${p.id}')">${p.emoji} ${p.name}</div>`
        ).join('');
    }

    window.usePowerup = function(id) {
        const powerup = activePowerups.find(p => p.id === id);
        if (!powerup) return;

        playSound('match');
        if (id === 'freeze') {
            lockBoard = true;
            setTimeout(() => { lockBoard = false; }, 5000);
        } else if (id === 'reveal') {
            document.querySelectorAll('.card').forEach(c => c.style.opacity = '0.5');
            document.querySelectorAll('.card:not(.matched)').forEach(c => c.textContent = c.dataset.value);
            setTimeout(() => {
                document.querySelectorAll('.card').forEach(c => c.style.opacity = '1');
                document.querySelectorAll('.card:not(.flipped):not(.matched)').forEach(c => c.textContent = '');
            }, 2000);
        } else if (id === 'double') {
            const originalScore = score;
            setTimeout(() => {
                // Double points effect ends
            }, 30000);
        }

        activePowerups = activePowerups.filter(p => p.id !== id);
        displayPowerups();
    };

    // ===== DAILY CHALLENGE =====
    function generateDailyChallenge() {
        const today = new Date().toDateString();
        const storedDaily = JSON.parse(localStorage.getItem('dailyChallenge')) || {};

        if (storedDaily.date === today) {
            dailyChallengeCards = storedDaily.cards;
        } else {
            dailyChallengeCards = generateRandomCardSequence();
            localStorage.setItem('dailyChallenge', JSON.stringify({
                date: today,
                cards: dailyChallengeCards
            }));
        }
    }

    function generateRandomCardSequence() {
        const base = [];
        for (let i = 0; i < gridSize * gridSize / 2; i++) {
            base.push(i);
        }
        return [...base, ...base].sort(() => Math.random() - 0.5);
    }

    // ===== ACHIEVEMENTS =====
    function displayAchievements() {
        achievementsList.innerHTML = achievements.map(ach => {
            const unlocked = stats.achievements.includes(ach.id);
            return `
                <div class="achievement-badge ${unlocked ? 'unlocked' : ''}" title="${ach.desc}">
                    <div class="achievement-icon">${ach.emoji}</div>
                    <div class="achievement-name">${ach.name}</div>
                </div>
            `;
        }).join('');
    }

    function checkAchievements() {
        achievements.forEach(ach => {
            if (!stats.achievements.includes(ach.id) && ach.condition()) {
                unlockAchievement(ach.id, ach.name, ach.emoji);
            }
        });
    }

    function unlockAchievement(id, name, emoji) {
        if (!stats.achievements.includes(id)) {
            stats.achievements.push(id);
            saveStats();
            showAchievementPopup(name, emoji);
            displayAchievements();
        }
    }

    function showAchievementPopup(name, emoji) {
        document.getElementById('achievementTitle').textContent = `${emoji} ${name} Unlocked!`;
        document.getElementById('achievementDesc').textContent = 'Great job!';
        achievementPopup.style.display = 'block';
        setTimeout(() => {
            achievementPopup.style.display = 'none';
        }, 3000);
    }

    // ===== STATISTICS =====
    function updateStats() {
        const totalGames = stats.totalGames;
        const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
        const avgFlips = totalGames > 0 ? Math.round(stats.totalFlips / totalGames) : 0;

        document.getElementById('totalGames').textContent = totalGames;
        document.getElementById('winRate').textContent = winRate + '%';
        document.getElementById('bestScore').textContent = stats.bestScore;
        document.getElementById('avgFlips').textContent = avgFlips;
    }

    function saveStats() {
        localStorage.setItem('gameStats', JSON.stringify(stats));
    }

    statsBtn.addEventListener('click', () => {
        updateStats();
        statsModal.style.display = 'block';
    });

    // ===== GRID SYSTEM =====
    gridBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gridBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gridSize = parseInt(btn.dataset.grid);
            gameBoard.className = `game-board grid-${gridSize}`;
            initGameBoard();
        });
    });

    // ===== GAME MODE SELECTION =====
    gameModeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            gameModeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGameMode = btn.dataset.mode;
            
            hardModeCounter.style.display = 'none';
            speedrunTimerContainer.style.display = 'none';
            playerTurnContainer.style.display = 'none';

            if (currentGameMode === 'speedrun') {
                speedrunTimerContainer.style.display = 'flex';
                speedrunTime = 0;
            } else if (currentGameMode === 'daily') {
                generateDailyChallenge();
            } else if (currentGameMode === 'multiplayer') {
                playerTurnContainer.style.display = 'flex';
                multiplayerMode = true;
                currentPlayer = 1;
                player1Score = 0;
                player2Score = 0;
            }

            initGameBoard();
        });
    });

    // ===== DIFFICULTY SELECTION =====
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.mode;

            hardModeCounter.style.display = 'none';
            if (difficulty === 'normal') {
                maxFlips = Infinity;
            } else if (difficulty === 'easy') {
                maxFlips = 30;
                hardModeCounter.style.display = 'flex';
            } else if (difficulty === 'hard') {
                maxFlips = 20;
                hardModeCounter.style.display = 'flex';
            } else if (difficulty === 'insane') {
                maxFlips = 10;
                hardModeCounter.style.display = 'flex';
            }

            initGameBoard();
        });
    });

    // ===== THEME SELECTION =====
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTheme = btn.dataset.theme;
            initGameBoard();
        });
    });

    // ===== CARD MANAGEMENT =====
    function createCardArray() {
        let base = [];
        const themeEmojis = themes[currentTheme];
        const pairsNeeded = (gridSize * gridSize) / 2;
        
        for (let i = 0; i < pairsNeeded; i++) {
            base.push(themeEmojis[i % themeEmojis.length]);
        }
        
        cardsArray = [...base, ...base].sort(() => Math.random() - 0.5);
    }

    function createCard(value, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = value;
        card.dataset.index = index;
        card.textContent = '?';
        card.addEventListener('click', flipCard);
        return card;
    }

    function flipCard() {
        if (lockBoard || !gameRunning || gamePaused || this.classList.contains('matched')) return;
        if (this === firstCard) return;
        if (this.classList.contains('flipped')) return;

        if (difficulty !== 'normal' && flips >= maxFlips) {
            showGameOver(false, 'Out of flips!');
            return;
        }

        undoStack.push({
            firstCard: firstCard ? { index: firstCard.dataset.index, flipped: true } : null,
            secondCard: secondCard ? { index: secondCard.dataset.index, flipped: true } : null,
            flips: flips,
            score: score,
            combo: combo
        });

        this.classList.add('flipped');
        playSound('flip');
        
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
            combo = 0;
            comboDisplay.textContent = combo;
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        score++;
        combo++;
        matchedCards += 2;
        playSound('match');
        updateScoreDisplay();
        updateComboDisplay();

        if (multiplayerMode) {
            if (currentPlayer === 1) {
                player1Score++;
            } else {
                player2Score++;
            }
        }

        if (matchedCards === gridSize * gridSize) {
            endGame(true);
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
                firstCard.textContent = '?';
                secondCard.textContent = '?';
                resetBoard();
            }, 600);
        }, 1000);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
        
        if (multiplayerMode) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            playerDisplay.textContent = currentPlayer;
        }
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }

    function updateComboDisplay() {
        comboDisplay.textContent = combo;
    }

    function updateFlipsDisplay() {
        flipsDisplay.textContent = flips;
        if (difficulty !== 'normal') {
            const remaining = maxFlips - flips;
            remainingDisplay.textContent = Math.max(0, remaining);
            
            if (remaining <= 0) {
                hintBtn.disabled = true;
                lockBoard = true;
                gameRunning = false;
            }
        }
    }

    // ===== HINT SYSTEM =====
    function showHint() {
        if (lockBoard || firstCard || !gameRunning || gamePaused) return;

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

    hintBtn.addEventListener('click', showHint);

    // ===== UNDO SYSTEM =====
    function undo() {
        if (undoStack.length === 0) return;
        const previousState = undoStack.pop();
        // Undo logic would go here
        undoBtn.disabled = undoStack.length === 0;
    }

    undoBtn.addEventListener('click', undo);

    // ===== PAUSE SYSTEM =====
    function togglePause() {
        gamePaused = !gamePaused;
        pauseOverlay.style.display = gamePaused ? 'flex' : 'none';
        pauseBtn.textContent = gamePaused ? '▶ Resume' : '⏸ Pause';
        
        if (speedrunInterval) {
            if (gamePaused) clearInterval(speedrunInterval);
            else startSpeedrunTimer();
        }
    }

    pauseBtn.addEventListener('click', togglePause);
    resumeBtn.addEventListener('click', togglePause);

    // ===== SPEEDRUN SYSTEM =====
    function startSpeedrunTimer() {
        if (currentGameMode !== 'speedrun') return;
        speedrunInterval = setInterval(() => {
            if (!gamePaused && gameRunning) {
                speedrunTime++;
                speedrunTimeDisplay.textContent = speedrunTime;
            }
        }, 1000);
    }

    // ===== CONFETTI =====
    function createConfetti() {
        const particles = [];
        const particleCount = 50;

        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                size: Math.random() * 5 + 2,
                speedX: Math.random() * 8 - 4,
                speedY: Math.random() * 5 + 5,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }

        function animate() {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

            particles.forEach((p, index) => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.speedY += 0.2;

                confettiCtx.fillStyle = p.color;
                confettiCtx.fillRect(p.x, p.y, p.size, p.size);

                if (p.y > confettiCanvas.height) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length > 0) {
                requestAnimationFrame(animate);
            }
        }

        animate();
    }

    // ===== HIGH SCORES =====
    function saveHighScore() {
        const key = `highScore_${difficulty}_${gridSize}x${gridSize}`;
        const scores = JSON.parse(localStorage.getItem(key) || '[]');
        scores.push({ score, flips, combo, date: new Date().toLocaleDateString() });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10);
        localStorage.setItem(key, JSON.stringify(scores));
    }

    function displayHighScores() {
        const key = `highScore_${difficulty}_${gridSize}x${gridSize}`;
        const scores = JSON.parse(localStorage.getItem(key) || '[]');
        
        highScoresList.innerHTML = '';
        if (scores.length === 0) {
            highScoresList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No scores yet!</p>';
            return;
        }

        scores.forEach((scoreData, index) => {
            const item = document.createElement('div');
            item.className = 'score-item';
            item.innerHTML = `
                <span class="score-rank">#${index + 1}</span>
                <span class="score-info">${scoreData.flips} flips</span>
                <span class="score-points">${scoreData.score} pairs</span>
            `;
            highScoresList.appendChild(item);
        });
    }

    // ===== GAME CONTROL =====
    function initGameBoard() {
        gameBoard.innerHTML = '';
        score = 0;
        combo = 0;
        flips = 0;
        matchedCards = 0;
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        gameRunning = true;
        gamePaused = false;
        undoStack = [];
        activePowerups = [];
        hintBtn.disabled = false;
        undoBtn.disabled = true;
        pauseOverlay.style.display = 'none';
        pauseBtn.textContent = '⏸ Pause';
        confettiCanvas.style.display = 'none';
        
        if (difficultyTimer) clearInterval(difficultyTimer);
        if (speedrunInterval) clearInterval(speedrunInterval);

        updateScoreDisplay();
        updateComboDisplay();
        updateFlipsDisplay();
        displayHighScores();

        createCardArray();
        gameBoard.className = `game-board grid-${gridSize}`;

        cardsArray.forEach((value, index) => {
            const card = createCard(value, index);
            gameBoard.appendChild(card);
        });

        gameStartTime = Date.now();
        
        if (currentGameMode === 'speedrun') {
            speedrunTime = 0;
            startSpeedrunTimer();
        }
    }

    function endGame(isWin) {
        gameRunning = false;
        if (speedrunInterval) clearInterval(speedrunInterval);

        if (isWin) {
            playSound('win');
            createConfetti();
            
            stats.totalGames++;
            stats.wins++;
            stats.totalFlips += flips;
            if (score > stats.bestScore) {
                stats.bestScore = score;
            }
            saveStats();
            saveHighScore();
            checkAchievements();
            
            showGameOver(true);
        } else {
            stats.totalGames++;
            stats.losses++;
            stats.totalFlips += flips;
            saveStats();
            showGameOver(false, 'Out of flips!');
        }
    }

    function showGameOver(isWin, message = '') {
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay);

        const gameOverDiv = document.createElement('div');
        gameOverDiv.classList.add('game-over');
        
        if (isWin) {
            gameOverDiv.innerHTML = `
                <h2>🎉 You Won! 🎉</h2>
                ${multiplayerMode ? `<p>Player 1: ${player1Score} | Player 2: ${player2Score}</p>` : `<p>Score: ${score} pairs</p>`}
                <p>Combo: ${combo}</p>
                <p>Flips: ${flips}${difficulty !== 'normal' ? '/' + maxFlips : ''}</p>
                ${currentGameMode === 'speedrun' ? `<p>Time: ${speedrunTime}s</p>` : ''}
                <button onclick="location.reload()" style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 15px;">Play Again</button>
            `;
        } else {
            gameOverDiv.innerHTML = `
                <h2>Game Over! 😅</h2>
                <p>${message}</p>
                <p>Score: ${score}</p>
                <p>Flips: ${flips}${difficulty !== 'normal' ? '/' + maxFlips : ''}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 15px;">Try Again</button>
            `;
        }
        
        document.body.appendChild(gameOverDiv);
    }

    // ===== COMBO MULTIPLIER =====
    let comboMultiplier = 1;
    let bestStreak = localStorage.getItem('bestStreak') || 0;
    let currentStreak = 0;

    function updateComboMultiplier() {
        if (combo >= 2 && combo < 4) comboMultiplier = 1.5;
        else if (combo >= 4 && combo < 6) comboMultiplier = 2;
        else if (combo >= 6) comboMultiplier = 2.5;
        else comboMultiplier = 1;
        
        const actualScore = Math.floor(combo * comboMultiplier);
        scoreDisplay.innerHTML = `<span>${score}</span> <span style="color: #f39c12; font-size: 12px;">(×${comboMultiplier})</span>`;
    }

    // ===== STREAK TRACKING =====
    function updateStreak() {
        if (matchedCards === gridSize * gridSize && !gamePaused) {
            currentStreak++;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
                localStorage.setItem('bestStreak', bestStreak);
            }
            const streakDisplay = document.getElementById('streakDisplay');
            if (streakDisplay) {
                streakDisplay.style.display = 'flex';
                document.getElementById('currentStreak').textContent = currentStreak;
                document.getElementById('bestStreak').textContent = bestStreak;
            }
        } else if (!gameRunning && !gamePaused) {
            currentStreak = 0;
        }
    }

    // ===== UNDO FUNCTIONALITY =====
    let undoStack = [];
    function recordMove(firstCardEl, secondCardEl, wasMatch) {
        undoStack.push({
            card1: { element: firstCardEl, value: firstCardEl.dataset.value },
            card2: { element: secondCardEl, value: secondCardEl.dataset.value },
            wasMatch: wasMatch,
            score: score,
            flips: flips,
            combo: combo
        });
    }

    function undo() {
        if (undoStack.length === 0 || lockBoard || !gameRunning || gamePaused) return;
        
        const lastMove = undoStack.pop();
        lastMove.card1.element.classList.remove('flipped', 'matched');
        lastMove.card1.element.textContent = '';
        lastMove.card2.element.classList.remove('flipped', 'matched');
        lastMove.card2.element.textContent = '';
        
        score = lastMove.score;
        flips = lastMove.flips;
        combo = lastMove.combo;
        updateScoreDisplay();
        updateFlipsDisplay();
        updateComboDisplay();
        
        playSound('undo');
    }

    // ===== VOLUME CONTROL =====
    const soundVolumeSlider = document.getElementById('soundVolume');
    const musicVolumeSlider = document.getElementById('musicVolume');
    const soundVolDisplay = document.getElementById('soundVolDisplay');
    const musicVolDisplay = document.getElementById('musicVolDisplay');
    let soundVolume = 1;
    let musicVolume = 0.5;

    if (soundVolumeSlider) {
        soundVolumeSlider.addEventListener('input', (e) => {
            soundVolume = e.target.value / 100;
            if (soundVolDisplay) soundVolDisplay.textContent = e.target.value + '%';
            localStorage.setItem('soundVolume', soundVolume);
            playSound('match'); // Immediate feedback
        });
        soundVolume = parseFloat(localStorage.getItem('soundVolume')) || 1;
        soundVolumeSlider.value = soundVolume * 100;
        if (soundVolDisplay) soundVolDisplay.textContent = Math.round(soundVolume * 100) + '%';
    }

    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener('input', (e) => {
            musicVolume = e.target.value / 100;
            if (musicVolDisplay) musicVolDisplay.textContent = e.target.value + '%';
            localStorage.setItem('musicVolume', musicVolume);
        });
        musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 0.5;
        musicVolumeSlider.value = musicVolume * 100;
        if (musicVolDisplay) musicVolDisplay.textContent = Math.round(musicVolume * 100) + '%';
    }

    // ===== FLIP SPEED CONTROL =====
    const flipSpeedSlider = document.getElementById('flipSpeed');
    const flipSpeedDisplay = document.getElementById('flipSpeedDisplay');
    let flipSpeed = 300;

    if (flipSpeedSlider) {
        flipSpeedSlider.addEventListener('input', (e) => {
            flipSpeed = parseInt(e.target.value);
            if (flipSpeedDisplay) flipSpeedDisplay.textContent = flipSpeed + 'ms';
            localStorage.setItem('flipSpeed', flipSpeed);
            document.documentElement.style.setProperty('--flip-speed', flipSpeed + 'ms');
        });
        flipSpeed = parseInt(localStorage.getItem('flipSpeed')) || 300;
        flipSpeedSlider.value = flipSpeed;
        if (flipSpeedDisplay) flipSpeedDisplay.textContent = flipSpeed + 'ms';
    }

    // ===== FLIP ANIMATION STYLES =====
    const animBtns = document.querySelectorAll('.anim-btn');
    let currentAnimation = 'spin';

    animBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            animBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAnimation = btn.dataset.anim;
            localStorage.setItem('flipAnimation', currentAnimation);
            document.body.className = document.body.className.replace(/flip-\w+/, '');
            document.body.classList.add('flip-' + currentAnimation);
        });
    });
    
    currentAnimation = localStorage.getItem('flipAnimation') || 'spin';
    document.body.classList.add('flip-' + currentAnimation);
    document.querySelectorAll('.anim-btn').forEach(btn => {
        if (btn.dataset.anim === currentAnimation) btn.classList.add('active');
    });

    // ===== QUICK PLAY =====
    const quickPlayBtn = document.getElementById('quickPlayBtn');
    if (quickPlayBtn) {
        quickPlayBtn.addEventListener('click', () => {
            const lastMode = localStorage.getItem('lastGameMode') || 'classic';
            const lastDifficulty = localStorage.getItem('lastDifficulty') || 'normal';
            const lastTheme = localStorage.getItem('lastTheme') || 'arts';

            gameModeButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.mode === lastMode) btn.classList.add('active');
            });
            modeBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.mode === lastDifficulty) btn.classList.add('active');
            });
            themeBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.theme === lastTheme) btn.classList.add('active');
            });

            gameMode = lastMode;
            currentGameMode = lastMode;
            difficulty = lastDifficulty;
            currentTheme = lastTheme;
            
            initGame();
        });
    }

    // ===== SHARE SCORE =====
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const scoreText = `I scored ${score} pairs in the ${currentGameMode} mode at ${difficulty} difficulty! 🎮 Play Memory Card Game and beat my score! 🏆`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Memory Card Game',
                    text: scoreText
                }).catch(err => console.log('Share cancelled'));
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(scoreText).then(() => {
                    alert('Score copied to clipboard! 📋');
                    playSound('match');
                }).catch(() => {
                    alert(scoreText);
                });
            }
        });
    }

    // ===== SOUND THEMES =====
    const soundThemeBtn = document.getElementById('soundThemeBtn');
    const soundThemeModal = document.getElementById('soundThemeModal');
    let soundTheme = 'classic';

    function createSoundWithTheme(type, theme) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        gain.gain.value = soundVolume;

        const themes = {
            classic: {
                flip: { freq: 400, duration: 0.1 },
                match: { freq: 600, duration: 0.2 },
                win: { freq: 800, duration: 0.3 }
            },
            retro: {
                flip: { freq: 300, duration: 0.05 },
                match: { freq: 500, duration: 0.1 },
                win: { freq: 700, duration: 0.2 }
            },
            magical: {
                flip: { freq: 600, duration: 0.15 },
                match: { freq: 800, duration: 0.25 },
                win: { freq: 1000, duration: 0.4 }
            },
            futuristic: {
                flip: { freq: 700, duration: 0.08 },
                match: { freq: 900, duration: 0.15 },
                win: { freq: 1100, duration: 0.25 }
            }
        };

        const config = themes[theme] && themes[theme][type] ? themes[theme][type] : themes.classic[type];
        oscillator.frequency.value = config.freq;
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + config.duration);
    }

    if (soundThemeBtn) {
        soundThemeBtn.addEventListener('click', () => {
            soundThemeModal.style.display = 'block';
        });
    }

    const soundOptions = document.querySelectorAll('.sound-option');
    soundOptions.forEach(option => {
        option.addEventListener('click', () => {
            soundOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            soundTheme = option.dataset.sound;
            localStorage.setItem('soundTheme', soundTheme);
            soundThemeModal.style.display = 'none';
            playSound('match'); // Test the new sound
        });
    });

    soundTheme = localStorage.getItem('soundTheme') || 'classic';
    soundOptions.forEach(option => {
        if (option.dataset.sound === soundTheme) option.classList.add('active');
    });

    // Sound theme quick buttons in settings modal
    const soundQuickOptions = document.querySelectorAll('.sound-opt');
    soundQuickOptions.forEach(option => {
        option.addEventListener('click', () => {
            soundQuickOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            soundTheme = option.dataset.sound;
            localStorage.setItem('soundTheme', soundTheme);
            playSound('match'); // Immediate test
        });
    });

    // Set initial state for quick buttons
    soundQuickOptions.forEach(option => {
        if (option.dataset.sound === soundTheme) option.classList.add('active');
    });

    // ===== ACCESSIBILITY MODE =====
    const accessibilityBtn = document.getElementById('accessibilityBtn');
    const accessibilityModal = document.getElementById('accessibilityModal');
    const highContrastCheckbox = document.getElementById('highContrastMode');
    const colorblindCheckbox = document.getElementById('colorblindMode');
    const largerTextCheckbox = document.getElementById('largerText');
    const focusIndicatorsCheckbox = document.getElementById('focusIndicators');

    function loadAccessibilitySettings() {
        const highContrast = localStorage.getItem('highContrast') === 'true';
        const colorblind = localStorage.getItem('colorblind') === 'true';
        const largeText = localStorage.getItem('largeText') === 'true';
        const focusInd = localStorage.getItem('focusIndicators') === 'true';

        if (highContrast) {
            document.body.classList.add('high-contrast');
            highContrastCheckbox.checked = true;
        }
        if (colorblind) {
            document.body.classList.add('colorblind');
            colorblindCheckbox.checked = true;
        }
        if (largeText) {
            document.body.classList.add('large-text');
            largerTextCheckbox.checked = true;
        }
        if (focusInd) {
            document.body.classList.add('focus-indicators');
            focusIndicatorsCheckbox.checked = true;
        }
    }

    if (accessibilityBtn) {
        accessibilityBtn.addEventListener('click', () => {
            accessibilityModal.style.display = 'block';
        });
    }

    if (highContrastCheckbox) {
        highContrastCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('high-contrast');
            localStorage.setItem('highContrast', highContrastCheckbox.checked);
        });
    }

    if (colorblindCheckbox) {
        colorblindCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('colorblind');
            localStorage.setItem('colorblind', colorblindCheckbox.checked);
        });
    }

    if (largerTextCheckbox) {
        largerTextCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('large-text');
            localStorage.setItem('largeText', largerTextCheckbox.checked);
        });
    }

    if (focusIndicatorsCheckbox) {
        focusIndicatorsCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('focus-indicators');
            localStorage.setItem('focusIndicators', focusIndicatorsCheckbox.checked);
        });
    }

    loadAccessibilitySettings();

    // ===== AUTO-SAVE GAME =====
    function saveGameProgress() {
        const gameState = {
            gameMode: currentGameMode,
            difficulty: difficulty,
            gridSize: gridSize,
            currentTheme: currentTheme,
            score: score,
            flips: flips,
            combo: combo,
            matchedCards: matchedCards,
            cards: Array.from(gameBoard.querySelectorAll('.card')).map(card => ({
                value: card.dataset.value,
                isFlipped: card.classList.contains('flipped'),
                isMatched: card.classList.contains('matched')
            })),
            timestamp: Date.now()
        };
        localStorage.setItem('gameProgress', JSON.stringify(gameState));
    }

    function loadGameProgress() {
        const saved = localStorage.getItem('gameProgress');
        if (!saved) return null;
        
        const gameState = JSON.parse(saved);
        const timeDiff = Date.now() - gameState.timestamp;
        
        // Only auto-restore if saved less than 30 minutes ago
        if (timeDiff > 30 * 60 * 1000) {
            localStorage.removeItem('gameProgress');
            return null;
        }
        
        return gameState;
    }

    // Auto-save every 5 seconds during gameplay
    setInterval(() => {
        if (gameRunning && !gamePaused && matchedCards < gridSize * gridSize) {
            saveGameProgress();
        }
    }, 5000);

    // Check for saved game on load
    const resumeGameModal = document.getElementById('resumeGameModal');
    const resumeSavedGame = document.getElementById('resumeSavedGame');
    const startNewGame = document.getElementById('startNewGame');
    
    const savedGame = loadGameProgress();
    if (savedGame && resumeGameModal) {
        resumeGameModal.style.display = 'block';
        
        resumeSavedGame.addEventListener('click', () => {
            currentGameMode = savedGame.gameMode;
            difficulty = savedGame.difficulty;
            gridSize = savedGame.gridSize;
            currentTheme = savedGame.currentTheme;
            score = savedGame.score;
            flips = savedGame.flips;
            combo = savedGame.combo;
            matchedCards = savedGame.matchedCards;
            
            resumeGameModal.style.display = 'none';
            initGame();
        });
        
        startNewGame.addEventListener('click', () => {
            localStorage.removeItem('gameProgress');
            resumeGameModal.style.display = 'none';
            initGame();
        });
    }

    // ===== DIFFICULTY PROGRESSION =====
    function unlockedDifficulties() {
        const wins = stats.totalGames;
        const unlockedDifficulties = ['normal'];
        
        if (wins >= 1) unlockedDifficulties.push('easy');
        if (wins >= 5) unlockedDifficulties.push('hard');
        if (wins >= 15) unlockedDifficulties.push('insane');
        
        return unlockedDifficulties;
    }

    function updateDifficultyButtons() {
        const unlocked = unlockedDifficulties();
        modeBtns.forEach(btn => {
            const mode = btn.dataset.mode;
            if (unlocked.includes(mode)) {
                btn.disabled = false;
                btn.style.opacity = '1';
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.title = 'Win more games to unlock this difficulty!';
            }
        });
    }

    // ===== ENDLESS MODE =====
    let isEndlessMode = false;
    let endlessCardsCount = 16;

    function toggleEndlessMode() {
        isEndlessMode = !isEndlessMode;
        if (isEndlessMode) {
            document.getElementById('endlessModeModal').style.display = 'block';
        }
    }

    // ===== STATISTICS CHART =====
    function displayStatsChart() {
        const stats = JSON.parse(localStorage.getItem('stats') || '{"totalGames":0,"totalWins":0,"totalFlips":0,"bestScore":0}');
        
        const chartContainer = document.querySelector('.stats-chart-container');
        if (!chartContainer) return;

        const chartBar = document.createElement('div');
        chartBar.className = 'chart-bar';
        
        const chartData = [
            { label: 'Games', value: stats.totalGames, max: 50 },
            { label: 'Wins', value: stats.totalWins, max: 50 },
            { label: 'Best Score', value: stats.bestScore, max: 100 }
        ];

        chartData.forEach(item => {
            const percentage = (item.value / item.max) * 100;
            const chartItem = document.createElement('div');
            chartItem.className = 'chart-item';
            chartItem.innerHTML = `
                <div class="chart-bar-fill" style="height: ${Math.min(percentage, 100)}%"></div>
                <span>${item.label}</span>
                <span>${item.value}</span>
            `;
            chartBar.appendChild(chartItem);
        });

        if (chartContainer.children.length > 0) {
            chartContainer.removeChild(chartContainer.children[0]);
        }
        chartContainer.appendChild(chartBar);
    }

    // ===== ACHIEVEMENT PROGRESS =====
    function showAchievementProgress() {
        const progressList = document.getElementById('achievementProgressList');
        if (!progressList) return;

        progressList.innerHTML = '';
        achievements.forEach(achievement => {
            const progress = document.createElement('div');
            progress.className = 'achievement-progress-item';
            
            const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            
            progress.innerHTML = `
                <h4>${achievement.emoji} ${achievement.name}</h4>
                <p>${achievement.desc}</p>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${isUnlocked ? '100' : '50'}%"></div>
                </div>
                <p style="font-size: 11px; color: #aaa;">${isUnlocked ? '✓ Unlocked' : 'In Progress'}</p>
            `;
            
            progressList.appendChild(progress);
        });
    }

    // ===== UPDATE DISPLAY FUNCTIONS =====
    function updateComboDisplay() {
        comboDisplay.textContent = combo;
        if (combo > 0) {
            updateComboMultiplier();
        }
    }

    function updateScoreDisplay() {
        const actualScore = Math.floor(score * comboMultiplier);
        scoreDisplay.textContent = score;
    }

    function updateFlipsDisplay() {
        flipsDisplay.textContent = flips;
        if (difficulty !== 'normal') {
            const remaining = maxFlips - flips;
            remainingDisplay.textContent = Math.max(0, remaining);
        }
    }

    // ===== LEGACY FUNCTION REPLACEMENTS =====
    function playSound(type) {
        if (!soundEnabled) return;
        createSoundWithTheme(type, soundTheme);
    }

    // ===== INITIALIZATION =====
    updateDifficultyButtons();
    loadAccessibilitySettings();


    window.addEventListener('click', (e) => {
        if (e.target === instructionsModal) instructionsModal.style.display = 'none';
        if (e.target === statsModal) statsModal.style.display = 'none';
    });

    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'h') showHint();
        else if (e.key.toLowerCase() === 'u') undo();
        else if (e.key.toLowerCase() === 'p') togglePause();
        else if (e.key.toLowerCase() === 'r') location.reload();
    });

    // ===== RESET BUTTON =====
    resetBtn.addEventListener('click', () => location.reload());

    // ===== RESPONSIVE =====
    window.addEventListener('resize', () => {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    });

    // ===== START GAME =====
    init();
});