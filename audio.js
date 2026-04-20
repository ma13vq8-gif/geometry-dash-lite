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
        const jumpSound = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZCBnZW5lcmF0ZWQ=');
        jumpSound.volume = 0.3;
        jumpSound.play().catch(e => console.log('Sound play failed'));
    }
}

function playDeathSound() {
    if (!isMuted) {
        const deathSound = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZCBnZW5lcmF0ZWQ=');
        deathSound.volume = 0.4;
        deathSound.play().catch(e => console.log('Sound play failed'));
    }
}

function playCompleteSound() {
    if (!isMuted) {
        const completeSound = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZCBnZW5lcmF0ZWQ=');
        completeSound.volume = 0.6;
        completeSound.play().catch(e => console.log('Sound play failed'));
    }
}
