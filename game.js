// ============================================
// GEOMETRY DASH LITE - WORKING VERSION
// ============================================

// Game State
let gameRunning = false;
let practiceMode = false;
let currentLevel = 1;
let deaths = 0;
let attempts = 0;
let playerStats = {
    stars: 0,
    diamonds: 0,
    coins: 0,
    completedLevels: [],
    bestPercent: {}
};

// Game Objects
let player = {
    x: 100,
    y: 500,
    vy: 0,
    grounded: true,
    size: 35
};
let camera = 0;
let distance = 0;
let currentObstacles = [];
let animationId = null;
let frameCount = 0;

// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 1000;
canvas.height = 600;

// Load saved data
function loadGameData() {
    const saved = localStorage.getItem('geometryDashLite');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            playerStats = data.stats || { stars: 0, diamonds: 0, coins: 0, completedLevels: [], bestPercent: {} };
            deaths = data.deaths || 0;
            attempts = data.attempts || 0;
        } catch(e) {
            console.error('Failed to load');
        }
    }
    updateDisplay();
    renderLevelButtons();
}

// Save data
function saveGameData() {
    localStorage.setItem('geometryDashLite', JSON.stringify({
        stats: playerStats,
        deaths: deaths,
        attempts: attempts
    }));
}

// Update UI displays
function updateDisplay() {
    document.getElementById('starCount').textContent = playerStats.stars;
    document.getElementById('diamondCount').textContent = playerStats.diamonds;
    document.getElementById('coinCount').textContent = playerStats.coins;
    document.getElementById('attemptNum').textContent = attempts;
    document.getElementById('deathNum').textContent = deaths;
}

// Render level buttons
function renderLevelButtons() {
    const grid = document.getElementById('levelGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const level = LEVELS[i];
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = `${level.name}\n${level.difficulty} ★${level.stars}`;
        
        if (playerStats.completedLevels.includes(i)) {
            btn.classList.add('completed');
        }
        
        if (level.requiredStars > playerStats.stars) {
            btn.classList.add('locked');
            btn.disabled = true;
        }
        
        btn.onclick = (function(levelId) {
            return function() { selectLevel(levelId); };
        })(i);
        
        grid.appendChild(btn);
    }
}

// Select level
function selectLevel(levelId) {
    currentLevel = levelId;
    document.getElementById('songInfo').innerHTML = `🎵 ${LEVELS[levelId].name}`;
}

// Reset game
function resetGame() {
    player.y = 500;
    player.vy = 0;
    player.grounded = true;
    camera = 0;
    distance = 0;
    frameCount = 0;
    
    const level = LEVELS[currentLevel];
    currentObstacles = [];
    
    // Load obstacles
    for (let obs of level.obstacles) {
        currentObstacles.push({
            x: obs.x,
            type: obs.type,
            width: obs.type === 'double' ? 60 : (obs.type === 'block' ? 40 : 30),
            height: obs.type === 'block' ? 40 : 30,
            y: obs.y || 500
        });
    }
    
    document.getElementById('percentage').textContent = '0%';
    document.getElementById('progressFill').style.width = '0%';
}

// Jump
function jump() {
    if (player.grounded && gameRunning) {
        player.vy = -10;
        player.grounded = false;
    }
}

// Update game logic
function updateGame() {
    if (!gameRunning) return;
    
    // Physics
    player.vy += 0.5;
    player.y += player.vy;
    
    // Ground collision
    if (player.y >= 500) {
        player.y = 500;
        player.vy = 0;
        player.grounded = true;
    }
    
    // Ceiling
    if (player.y <= 50) {
        player.y = 50;
        player.vy = 0;
    }
    
    // Scroll
    camera += 5;
    distance += 5;
    
    // Update percentage
    const level = LEVELS[currentLevel];
    const percent = Math.min(100, Math.floor((distance / level.length) * 100));
    document.getElementById('percentage').textContent = `${percent}%`;
    document.getElementById('progressFill').style.width = `${percent}%`;
    
    // Check win
    if (distance >= level.length) {
        winGame();
        return;
    }
    
    // Collision detection
    for (let obs of currentObstacles) {
        const obsX = obs.x - camera;
        if (obsX > -50 && obsX < 150) {
            if (player.x + player.size > obsX &&
                player.x < obsX + obs.width &&
                player.y + player.size > obs.y - obs.height) {
                gameOver();
                return;
            }
        }
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    deaths++;
    attempts++;
    saveGameData();
    updateDisplay();
    
    // Flash effect
    const flash = document.createElement('div');
    flash.className = 'death-flash';
    document.getElementById('ui').appendChild(flash);
    setTimeout(() => flash.remove(), 200);
    
    if (!practiceMode) {
        document.getElementById('menuOverlay').classList.remove('hidden');
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
    } else {
        resetGame();
    }
}

// Win game
function winGame() {
    gameRunning = false;
    const level = LEVELS[currentLevel];
    
    if (!playerStats.completedLevels.includes(currentLevel)) {
        playerStats.completedLevels.push(currentLevel);
        playerStats.stars += level.stars;
        playerStats.diamonds += level.stars * 10;
        
        document.getElementById('rewardText').innerHTML = `⭐ +${level.stars} Stars!<br>💎 +${level.stars * 10} Diamonds!`;
    } else {
        document.getElementById('rewardText').innerHTML = `⭐ Level already completed!`;
    }
    
    attempts++;
    saveGameData();
    updateDisplay();
    renderLevelButtons();
    
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    document.getElementById('completeOverlay').classList.remove('hidden');
}

// Start game
function startGame(practice) {
    practiceMode = practice;
    gameRunning = true;
    resetGame();
    document.getElementById('menuOverlay').classList.add('hidden');
    
    // Play song
    const level = LEVELS[currentLevel];
    const songUrl = CONFIG.SONGS[level.song];
    if (songUrl && window.currentAudio === undefined) {
        try {
            window.currentAudio = new Audio(songUrl);
            window.currentAudio.loop = true;
            window.currentAudio.volume = 0.3;
            window.currentAudio.play().catch(e => console.log('Audio:', e));
        } catch(e) {}
    }
}

// Draw everything
function draw() {
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 1000, 600);
    
    // Draw ground
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 500, 1000, 5);
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 505, 1000, 95);
    
    // Draw obstacles
    for (let obs of currentObstacles) {
        const x = obs.x - camera;
        if (x > -100 && x < 1100) {
            if (obs.type === 'spike') {
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.moveTo(x, obs.y);
                ctx.lineTo(x + obs.width/2, obs.y - obs.height);
                ctx.lineTo(x + obs.width, obs.y);
                ctx.fill();
            } else if (obs.type === 'double') {
                ctx.fillStyle = '#ff6644';
                ctx.fillRect(x, obs.y - obs.height, obs.width, obs.height);
                ctx.fillStyle = '#ff8844';
                ctx.fillRect(x + 10, obs.y - obs.height - 20, obs.width - 20, 20);
            } else if (obs.type === 'block') {
                ctx.fillStyle = '#8866ff';
                ctx.fillRect(x, obs.y - obs.height, obs.width, obs.height);
            }
        }
    }
    
    // Draw player
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player.x, player.y - player.size, player.size, player.size);
    ctx.fillStyle = '#000';
    ctx.font = `${player.size}px Arial`;
    ctx.fillText('😀', player.x + 5, player.y - 8);
    
    // Draw practice mode text
    if (practiceMode && gameRunning) {
        ctx.fillStyle = 'rgba(0,255,0,0.7)';
        ctx.fillRect(0, 0, 200, 40);
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('PRACTICE MODE', 10, 30);
    }
    
    // Draw start instructions if game not running
    if (!gameRunning && document.getElementById('menuOverlay').classList.contains('hidden') === false) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, 1000, 600);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS SPACE OR CLICK', 500, 300);
        ctx.font = '24px monospace';
        ctx.fillText('TO START', 500, 360);
        ctx.textAlign = 'left';
    }
}

// Game loop
function gameLoop() {
    updateGame();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Show stats
function showStats() {
    document.getElementById('menuOverlay').classList.add('hidden');
    const statsDiv = document.getElementById('statsContent');
    
    let completedHtml = '';
    for (let id of playerStats.completedLevels) {
        completedHtml += `${LEVELS[id].name}, `;
    }
    
    statsDiv.innerHTML = `
        <p>⭐ Stars: ${playerStats.stars}</p>
        <p>💎 Diamonds: ${playerStats.diamonds}</p>
        <p>🪙 Coins: ${playerStats.coins}</p>
        <p>💀 Deaths: ${deaths}</p>
        <p>🎮 Attempts: ${attempts}</p>
        <p>✅ Completed: ${completedHtml || 'None'}</p>
        <hr>
        <p>🏆 Best Percentages:</p>
    `;
    
    for (let [id, pct] of Object.entries(playerStats.bestPercent)) {
        if (LEVELS[id]) {
            const p = document.createElement('p');
            p.textContent = `${LEVELS[id].name}: ${pct}%`;
            statsDiv.appendChild(p);
        }
    }
    
    document.getElementById('statsOverlay').classList.remove('hidden');
}

// Reset all progress
function resetProgress() {
    if (confirm('ARE YOU SURE? This will delete ALL progress!')) {
        playerStats = { stars: 0, diamonds: 0, coins: 0, completedLevels: [], bestPercent: {} };
        deaths = 0;
        attempts = 0;
        saveGameData();
        updateDisplay();
        renderLevelButtons();
        alert('Progress reset!');
    }
}

// Initialize everything
function init() {
    console.log('Game initializing...');
    loadGameData();
    renderLevelButtons();
    
    // Set current level display
    document.getElementById('songInfo').innerHTML = `🎵 ${LEVELS[1].name}`;
    
    // Button events
    document.getElementById('playBtn').onclick = () => startGame(false);
    document.getElementById('practiceBtn').onclick = () => startGame(true);
    document.getElementById('resetBtn').onclick = resetProgress;
    document.getElementById('statsBtn').onclick = showStats;
    document.getElementById('continueBtn').onclick = () => {
        document.getElementById('completeOverlay').classList.add('hidden');
        document.getElementById('menuOverlay').classList.remove('hidden');
    };
    document.getElementById('closeStatsBtn').onclick = () => {
        document.getElementById('statsOverlay').classList.add('hidden');
        document.getElementById('menuOverlay').classList.remove('hidden');
    };
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            if (gameRunning) {
                jump();
            } else if (!gameRunning && document.getElementById('menuOverlay').classList.contains('hidden') === false) {
                startGame(false);
            }
        }
    });
    
    // Click on canvas to jump/start
    canvas.addEventListener('click', () => {
        if (gameRunning) {
            jump();
        } else if (!gameRunning && document.getElementById('menuOverlay').classList.contains('hidden') === false) {
            startGame(false);
        }
    });
    
    // Start the game loop
    gameLoop();
    
    console.log('Game ready! Press START or press SPACE');
}

// Make sure CONFIG and LEVELS are loaded
if (typeof CONFIG === 'undefined') {
    console.error('config.js not loaded!');
}
if (typeof LEVELS === 'undefined') {
    console.error('levels.js not loaded!');
}

// Start when page loads
window.addEventListener('load', init);
