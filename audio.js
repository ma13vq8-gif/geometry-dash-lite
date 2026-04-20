// Audio Management
let currentAudio = null;
let isMuted = false;

function playSong(levelId) {
    stopSong();
    const level = LEVELS[levelId];
    const songUrl = CONFIG.SONGS[level.song];
    
    if (songUrl && !isMuted) {
        currentAudio = new Audio(songUrl);
        currentAudio.loop = true;
        currentAudio.volume = 0.5;
        currentAudio.play().catch(e => console.log('Audio play failed:', e));
    }
}

function stopSong() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

function toggleMute() {
    isMuted = !isMuted;
    if (isMuted && currentAudio) {
        currentAudio.volume = 0;
    } else if (currentAudio) {
        currentAudio.volume = 0.5;
    }
}

function playJumpSound() {
    if (!isMuted) {
        try {
            const jumpSound = new Audio();
            jumpSound.volume = 0.3;
            // Web Audio API for simple beep
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.1;
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch(e) { console.log('Sound error'); }
    }
}

function playDeathSound() {
    if (!isMuted) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 220;
            gainNode.gain.value = 0.15;
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch(e) { console.log('Sound error'); }
    }
}

function playCompleteSound() {
    if (!isMuted) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 1046.50;
            gainNode.gain.value = 0.2;
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.8);
            oscillator.stop(audioCtx.currentTime + 0.8);
        } catch(e) { console.log('Sound error'); }
    }
}
