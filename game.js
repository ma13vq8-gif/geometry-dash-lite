// Game State
let gameRunning = false;
let practiceMode = false;
let currentLevel = 1;
let deaths = 0;
let attempts = 0;
let playerStats = { stars: 0, diamonds: 0, coins: 0, completedLevels: [], bestPercent: {} };

// Game Objects
let player = { x: 100, y: 500, vy: 0, grounded: true, size: 35 };
let camera = 0;
let distance = 0;
let currentObstacles = [];
let animationId = null;

// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function init() {
    const saved = loadGameData();
    playerStats = saved.stats;
    deaths = saved.deaths;
    attempts = saved.attempts;
    updateStatsDisplay(playerStats, deaths, attempts);
    renderLevelButtons(playerStats);
    
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
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            if (gameRunning) jump();
        }
    });
    
    canvas.addEventListener('click', () => {
        if (gameRunning) jump();
    });
    
    initSupabase();
    draw();
}

function startGame(practice) {
    practiceMode = practice;
    gameRunning = true;
    resetGame();
    document.getElementById('menuOverlay').classList.add('hidden');
    playSong(currentLevel);
    
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function resetGame() {
    player.y = 500;
    player.vy = 0;
    player.grounded = true;
    camera = 0;
    distance = 0;
    
    const level = LEVELS[currentLevel];
    currentObstacles = level.obstacles.map(obs => ({
        x: obs.x,
        type: obs.type,
        width: obs.type === 'double' ? 60 : (obs.type === 'block' ? 40 : 30),
        height: obs.type === 'block' ? 40 : 30,
        y: obs.y || 500
    }));
    
    document.getElementById('percentage').textContent = '0%';
    document.getElementById('progressFill').style.width = '0%';
}

function jump() {
    if (player.grounded && gameRunning) {
        player.vy = CONFIG.JUMP_FORCE;
        player.grounded = false;
        playJumpSound();
    }
}

function updateGame() {
    if (!gameRunning) return;
    
    player.vy += CONFIG.GRAVITY;
    player.y += player.vy;
    
    if (player.y >= CONFIG.GROUND_Y) {
        player.y = CONFIG.GROUND_Y;
        player.vy = 0;
        player.grounded = true;
    }
    
    if (player.y <= 50) {
        player.y = 50;
        player.vy = 0;
    }
    
    camera += CONFIG.SCROLL_SPEED;
    distance += CONFIG.SCROLL_SPEED;
    
    const level = LEVELS[currentLevel];
    const percent = Math.min(100, Math.floor((distance / level.length) * 100));
    document.getElementById('percentage').textContent = `${percent}%`;
    document.getElementById('progressFill').style.width = `${percent}%`;
    
    if (percent > (playerStats.bestPercent[currentLevel] || 0)) {
        playerStats.bestPercent[currentLevel] = percent;
    }
    
    if (distance >= level.length) {
        winGame();
        return;
    }
    
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

function gameOver() {
    gameRunning = false;
    deaths++;
    attempts++;
    showDeathFlash();
    playDeathSound();
    saveGameData(playerStats, deaths, attempts);
    updateStatsDisplay(playerStats, deaths, attempts);
    
    if (!practiceMode) {
        document.getElementById('menuOverlay').classList.remove('hidden');
        stopSong();
    } else {
        resetGame();
        startGame(true);
    }
}

function winGame() {
    gameRunning = false;
    const level = LEVELS[currentLevel];
    
    if (!playerStats.completedLevels.includes(currentLevel)) {
        playerStats.completedLevels.push(currentLevel);
        const rewards = calculateRewards(currentLevel, deaths);
        playerStats.stars += rewards.stars;
        playerStats.diamonds += rewards.diamonds;
        
        if (currentUser) saveOnlineProgress();
        
        document.getElementById('rewardText').innerHTML = `⭐ +${rewards.stars} Stars!<br>💎 +${rewards.diamonds} Diamonds!`;
    } else {
        document.getElementById('rewardText').innerHTML = `⭐ Level already completed!`;
    }
    
    attempts++;
    saveGameData(playerStats, deaths, attempts);
    updateStatsDisplay(playerStats, deaths, attempts);
    renderLevelButtons(playerStats);
    playCompleteSound();
    stopSong();
    
    document.getElementById('completeOverlay').classList.remove('hidden');
}

function resetProgress() {
    if (confirm('ARE YOU SURE? This will delete ALL progress!')) {
        playerStats = { stars: 0, diamonds: 0, coins: 0, completedLevels: [], bestPercent: {} };
        deaths = 0;
        attempts = 0;
        saveGameData(playerStats, deaths, attempts);
        updateStatsDisplay(playerStats, deaths, attempts);
        renderLevelButtons(playerStats);
        alert('Progress reset!');
    }
}

function showStats() {
    document.getElementById('menuOverlay').classList.add('hidden');
    const statsDiv = document.getElementById('statsContent');
    
    let completedList = '';
    playerStats.completedLevels.forEach(id => {
        completedList += `${LEVELS[id].name}, `;
    });
    
    statsDiv.innerHTML = `
        <p>⭐ Total Stars: ${playerStats.stars}</p>
        <p>💎 Total Diamonds: ${playerStats.diamonds}</p>
        <p>🪙 Total Coins: ${playerStats.coins}</p>
        <p>💀 Total Deaths: ${deaths}</p>
        <p>🎮 Total Attempts: ${attempts}</p>
        <p>✅ Completed: ${completedList || 'None'}</p>
        <hr><p>🏆 Best Percentages:</p>
        ${Object.entries(playerStats.bestPercent).map(([id, pct]) => 
            `<p>${LEVELS[id]?.name}: ${pct}%</p>`
        ).join('')}
    `;
    
    document.getElementById('statsOverlay').classList.remove('hidden');
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 1000, 600);
    
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, CONFIG.GROUND_Y, 1000, 5);
    
    currentObstacles.forEach(obs => {
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
    });
    
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player.x, player.y - player.size, player.size, player.size);
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.fillText('😀', player.x + 5, player.y - 8);
    
    if (practiceMode && gameRunning) {
        ctx.fillStyle = 'rgba(0,255,0,0.3)';
        ctx.fillRect(0, 0, 200, 40);
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('PRACTICE MODE', 10, 30);
    }
    
    requestAnimationFrame(draw);
}

function gameLoop() {
    updateGame();
    animationId = requestAnimationFrame(gameLoop);
}

// Make variables global for other scripts
window.currentLevel = currentLevel;
window.playerStats = playerStats;
window.deaths = deaths;
window.attempts = attempts;
window.selectLevel = selectLevel;
window.startGame = startGame;

init();
