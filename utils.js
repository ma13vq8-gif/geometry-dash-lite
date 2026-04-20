// Utility Functions
function saveGameData(stats, deaths, attempts) {
    const gameData = {
        stats: stats,
        deaths: deaths,
        attempts: attempts,
        lastSaved: Date.now()
    };
    localStorage.setItem('geometryDashLite', JSON.stringify(gameData));
}

function loadGameData() {
    const saved = localStorage.getItem('geometryDashLite');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            return {
                stats: data.stats || { stars: 0, diamonds: 0, coins: 0, completedLevels: [], bestPercent: {} },
                deaths: data.deaths || 0,
                attempts: data.attempts || 0
            };
        } catch(e) {
            console.error('Failed to load save data');
        }
    }
    return {
        stats: { stars: 0, diamonds: 0, coins: 0, completedLevels: [], bestPercent: {} },
        deaths: 0,
        attempts: 0
    };
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showDeathFlash() {
    const flash = document.createElement('div');
    flash.className = 'death-flash';
    document.getElementById('ui').appendChild(flash);
    setTimeout(() => flash.remove(), 200);
}

function updateStatsDisplay(stats, deaths, attempts) {
    document.getElementById('starCount').textContent = stats.stars || 0;
    document.getElementById('diamondCount').textContent = stats.diamonds || 0;
    document.getElementById('coinCount').textContent = stats.coins || 0;
    document.getElementById('attemptNum').textContent = attempts || 0;
    document.getElementById('deathNum').textContent = deaths || 0;
}

function renderLevelButtons(stats) {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const level = LEVELS[i];
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        
        if (stats.completedLevels && stats.completedLevels.includes(i)) {
            btn.classList.add('completed');
        }
        
        if (level.requiredStars > (stats.stars || 0)) {
            btn.classList.add('locked');
            btn.disabled = true;
        }
        
        btn.textContent = `${level.name}\n${level.difficulty} ★${level.stars}`;
        btn.onclick = () => selectLevel(i);
        grid.appendChild(btn);
    }
}

function selectLevel(levelId) {
    currentLevel = levelId;
    document.getElementById('songInfo').innerHTML = `🎵 ${LEVELS[levelId].name}`;
}

function calculateRewards(levelId, deaths) {
    const level = LEVELS[levelId];
    let stars = level.stars;
    let diamonds = level.stars * 10;
    
    // Penalty for deaths
    if (deaths > 10) {
        stars = Math.max(1, stars - 2);
        diamonds = Math.max(10, diamonds - 20);
    } else if (deaths > 5) {
        stars = Math.max(1, stars - 1);
        diamonds = Math.max(10, diamonds - 10);
    }
    
    return { stars, diamonds };
}
