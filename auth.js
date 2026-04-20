// ============================================
// SUPABASE AUTHENTICATION
// ============================================

let supabaseClient = null;
let currentUser = null;

// Initialize Supabase
function initSupabase() {
    if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized');
        checkAuth();
    } else {
        console.warn('Supabase not configured - using localStorage only');
    }
}

// Check if user is logged in
async function checkAuth() {
    if (!supabaseClient) return;
    
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await loadOnlineData();
        document.getElementById('authBtn').textContent = '👤 LOGOUT';
        document.getElementById('authBtn').onclick = logout;
    } else {
        currentUser = null;
        document.getElementById('authBtn').textContent = '🔐 LOGIN';
        document.getElementById('authBtn').onclick = showAuthModal;
    }
}

// Show login/register modal
function showAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('hidden');
}

// Login
async function login(email, password) {
    if (!supabaseClient) {
        alert('Supabase not configured. Add your URL and anon key to config.js');
        return false;
    }
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        alert('Login failed: ' + error.message);
        return false;
    }
    
    currentUser = data.user;
    await loadOnlineData();
    closeAuthModal();
    alert('Logged in successfully!');
    return true;
}

// Register
async function register(email, password, username) {
    if (!supabaseClient) {
        alert('Supabase not configured. Add your URL and anon key to config.js');
        return false;
    }
    
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: username
            }
        }
    });
    
    if (error) {
        alert('Registration failed: ' + error.message);
        return false;
    }
    
    alert('Registered! Please check your email to confirm (or login if auto-confirmed)');
    return true;
}

// Logout
async function logout() {
    if (!supabaseClient) return;
    
    await supabaseClient.auth.signOut();
    currentUser = null;
    
    // Reload local data
    loadGameData();
    updateStatsDisplay(playerStats, deaths, attempts);
    renderLevelButtons(playerStats);
    
    document.getElementById('authBtn').textContent = '🔐 LOGIN';
    document.getElementById('authBtn').onclick = showAuthModal;
    alert('Logged out');
}

// Load player data from Supabase
async function loadOnlineData() {
    if (!supabaseClient || !currentUser) return;
    
    // Load player stats
    const { data: stats, error: statsError } = await supabaseClient
        .from('player_stats')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
    
    if (stats) {
        playerStats = {
            stars: stats.stars || 0,
            diamonds: stats.diamonds || 0,
            coins: stats.secret_coins || 0,
            completedLevels: [],
            bestPercent: {}
        };
        
        deaths = stats.total_deaths || 0;
        attempts = stats.total_attempts || 0;
    }
    
    // Load level progress
    const { data: progress } = await supabaseClient
        .from('level_progress')
        .select('*')
        .eq('user_id', currentUser.id);
    
    if (progress) {
        progress.forEach(p => {
            if (p.is_completed) {
                playerStats.completedLevels.push(p.level_id);
            }
            playerStats.bestPercent[p.level_id] = p.best_percent || 0;
        });
    }
    
    // Load unlocks
    const { data: unlocks } = await supabaseClient
        .from('player_unlocks')
        .select('unlockable_id, is_equipped')
        .eq('user_id', currentUser.id);
    
    if (unlocks) {
        playerStats.unlocks = unlocks;
    }
    
    updateStatsDisplay(playerStats, deaths, attempts);
    renderLevelButtons(playerStats);
}

// Save progress to Supabase
async function saveOnlineProgress() {
    if (!supabaseClient || !currentUser) return;
    
    // Save stats
    await supabaseClient
        .from('player_stats')
        .upsert({
            user_id: currentUser.id,
            stars: playerStats.stars,
            diamonds: playerStats.diamonds,
            secret_coins: playerStats.coins,
            total_deaths: deaths,
            total_attempts: attempts,
            total_jumps: playerStats.totalJumps || 0
        });
    
    // Save level progress for each completed level
    for (let levelId of playerStats.completedLevels) {
        await supabaseClient
            .from('level_progress')
            .upsert({
                user_id: currentUser.id,
                level_id: levelId,
                is_completed: true,
                best_percent: playerStats.bestPercent[levelId] || 100,
                attempts: attempts,
                deaths: deaths,
                completed_at: new Date()
            });
    }
}

// Close auth modal
function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}
