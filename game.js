// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player
const player = {
    x: 100,
    y: canvas.height - 80,
    width: 35,
    height: 35,
    dy: 0,
    grounded: true
};

// Game state
let gameRunning = false;
let practiceMode = false;
let currentLevel = 1;
let deaths = 0;
let attempts = 0;
let distance = 0;
let obstacles = [];
let obstacleTimer = 0;
let gameOverFlag = false;
let winFlag = false;
let currentSpeed = 5;
let animationId = null;

// Player stats
let playerStats = {
    stars: 0,
    diamonds: 100,
    coins: 0,
    completed: []
};

// Load save
function loadGame() {
    const saved = localStorage.getItem('gdLite');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            playerStats = data.stats || { stars: 0, diamonds: 100, coins: 0, completed: [] };
            deaths = data.deaths || 0;
            attempts = data.attempts || 0;
        } catch(e) {}
    }
    updateUI();
    updateLevelButtons();
}

function saveGame() {
    localStorage.setItem('gdLite', JSON.stringify({
        stats: playerStats,
        deaths: deaths,
        attempts: attempts
    }));
}

function updateUI() {
    document.getElementById('stars').innerText = playerStats.stars;
    document.getElementById('diamonds').innerText = playerStats.diamonds;
    document.getElementById('coins').innerText = playerStats.coins;
    document.getElementById('levelName').innerText = LEVELS[currentLevel].name;
}

function updateLevelButtons() {
    const btns = document.querySelectorAll('.level-btn');
    btns.forEach(btn => {
        const level = parseInt(btn.dataset.level);
        btn.classList.remove('completed', 'locked');
        if (playerStats.completed.includes(level)) btn.classList.add('completed');
        if (LEVELS[level].required > playerStats.stars) {
            btn.classList.add('locked');
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });
}

function selectLevel(level) {
    if (LEVELS[level].required <= playerStats.stars) {
        currentLevel = level;
        updateUI();
    }
}

function resetGame() {
    player.y = canvas.height - 80;
    player.dy = 0;
    player.grounded = true;
    obstacles = [];
    obstacleTimer = 0;
    distance = 0;
    gameOverFlag = false;
    winFlag = false;
    currentSpeed = LEVELS[currentLevel].speed;
    document.getElementById('percentage').innerText = '0%';
}

function createObstacle() {
    const type = Math.random() > 0.6 ? 'block' : 'spike';
    obstacles.push({
        x: canvas.width,
        y: type === 'spike' ? canvas.height - 35 : canvas.height - 65,
        width: type === 'spike' ? 25 : 40,
        height: type === 'spike' ? 35 : 65,
        type: type
    });
}

function jump() {
    if (player.grounded && gameRunning && !gameOverFlag && !winFlag) {
        player.dy = JUMP_POWER;
        player.grounded = false;
        playJumpSound();
    }
}

function gameOver() {
    gameOverFlag = true;
    gameRunning = false;
    deaths++;
    attempts++;
    saveGame();
    updateUI();
    playDeathSound();
    
    const flash = document.createElement('div');
    flash.className = 'death-flash';
    document.getElementById('gameContainer').appendChild(flash);
    setTimeout(() => flash.remove(), 200);
    
    document.getElementById('gameOverlay').classList.remove('hidden');
}

function winGame() {
    winFlag = true;
    gameRunning = false;
    playCompleteSound();
    
    const level = LEVELS[currentLevel];
    const alreadyCompleted = playerStats.completed.includes(currentLevel);
    
    if (!alreadyCompleted) {
        playerStats.completed.push(currentLevel);
        playerStats.stars += level.stars;
        playerStats.diamonds += level.stars * 10;
        saveGame();
        updateUI();
        updateLevelButtons();
        document.getElementById('rewardText').innerHTML = `+${level.stars} Stars!<br>+${level.stars * 10} Diamonds!`;
    } else {
        document.getElementById('rewardText').innerHTML = `Level already completed!`;
    }
    
    document.getElementById('winOverlay').classList.remove('hidden');
}

function updateGame() {
    if (!gameRunning || gameOverFlag || winFlag) return;
    
    // Player physics
    player.dy += GRAVITY;
    player.y += player.dy;
    
    if (player.y + player.height >= canvas.height - 20) {
        player.y = canvas.height - player.height - 20;
        player.dy = 0;
        player.grounded = true;
    }
    
    if (player.y <= 0) {
        player.y = 0;
        player.dy = 0;
    }
    
    // Distance and percentage
    distance += currentSpeed;
    const percent = Math.min(100, Math.floor((distance / LEVELS[currentLevel].length) * 100));
    document.getElementById('percentage').innerText = `${percent}%`;
    
    // Win condition
    if (distance >= LEVELS[currentLevel].length) {
        winGame();
        return;
    }
    
    // Spawn obstacles
    obstacleTimer++;
    const spawnRate = Math.max(35, 75 - Math.floor(currentSpeed * 3));
    if (obstacleTimer > spawnRate) {
        createObstacle();
        obstacleTimer = 0;
    }
    
    // Update obstacles and collision
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= currentSpeed;
        
        // Collision detection
        if (player.x < obstacles[i].x + obstacles[i].width &&
            player.x + player.width > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y) {
            gameOver();
            return;
        }
    }
    
    // Remove offscreen obstacles
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
}

function draw() {
    // Clear
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 5);
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
    
    // Obstacles
    for (let obs of obstacles) {
        if (obs.type === 'spike') {
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + obs.width / 2, obs.y - obs.height);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.fill();
        } else {
            ctx.fillStyle = '#0fbcf9';
            ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
        }
    }
    
    // Player
    ctx.fillStyle = LEVELS[currentLevel].color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('>', player.x + 12, player.y + 25);
    
    // Practice mode indicator
    if (practiceMode && gameRunning) {
        ctx.fillStyle = 'rgba(0,255,0,0.3)';
        ctx.fillRect(0, 0, 150, 30);
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('PRACTICE MODE', 10, 22);
    }
}

function gameLoop() {
    updateGame();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function startGame(practice) {
    practiceMode = practice;
    gameRunning = true;
    gameOverFlag = false;
    winFlag = false;
    resetGame();
    document.getElementById('menuOverlay').classList.add('hidden');
    document.getElementById('gameOverlay').classList.add('hidden');
    document.getElementById('winOverlay').classList.add('hidden');
}

function showStats() {
    document.getElementById('menuOverlay').classList.add('hidden');
    const statsDiv = document.getElementById('statsContent');
    statsDiv.innerHTML = `
        <p>⭐ Stars: ${playerStats.stars}</p>
        <p>💎 Diamonds: ${playerStats.diamonds}</p>
        <p>🪙 Coins: ${playerStats.coins}</p>
        <p>💀 Deaths: ${deaths}</p>
        <p>🎮 Attempts: ${attempts}</p>
        <p>✅ Completed: ${playerStats.completed.map(l => LEVELS[l].name).join(', ') || 'None'}</p>
    `;
    document.getElementById('statsOverlay').classList.remove('hidden');
}

function resetProgress() {
    if (confirm('Delete ALL progress?')) {
        playerStats = { stars: 0, diamonds: 100, coins: 0, completed: [] };
        deaths = 0;
        attempts = 0;
        saveGame();
        updateUI();
        updateLevelButtons();
        alert('Progress reset!');
    }
}

// Event listeners
document.getElementById('playBtn').onclick = () => startGame(false);
document.getElementById('practiceBtn').onclick = () => startGame(true);
document.getElementById('statsBtn').onclick = showStats;
document.getElementById('resetBtn').onclick = resetProgress;
document.getElementById('retryBtn').onclick = () => startGame(practiceMode);
document.getElementById('menuBtn').onclick = () => {
    document.getElementById('gameOverlay').classList.add('hidden');
    document.getElementById('menuOverlay').classList.remove('hidden');
};
document.getElementById('nextBtn').onclick = () => {
    document.getElementById('winOverlay').classList.add('hidden');
    document.getElementById('menuOverlay').classList.remove('hidden');
};
document.getElementById('closeStatsBtn').onclick = () => {
    document.getElementById('statsOverlay').classList.add('hidden');
    document.getElementById('menuOverlay').classList.remove('hidden');
};

document.querySelectorAll('.level-btn').forEach(btn => {
    btn.onclick = () => selectLevel(parseInt(btn.dataset.level));
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);

// Initialize
loadGame();
gameLoop();
