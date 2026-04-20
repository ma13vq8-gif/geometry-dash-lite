// Supabase Authentication
let supabaseClient = null;
let currentUser = null;

function initSupabase() {
    if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized');
        checkAuth();
    } else {
        console.warn('Supabase not configured - using localStorage only');
    }
}

async function checkAuth() {
    if (!supabaseClient) return;
    
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await loadOnlineData();
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            authBtn.textContent = '👤 LOGOUT';
            authBtn.onclick = logout;
        }
    } else {
        currentUser = null;
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            authBtn.textContent = '🔐 LOGIN';
            authBtn.onclick = showAuthModal;
        }
    }
}

function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('hidden');
}

async function login(email, password) {
    if (!supabaseClient) {
        alert('Supabase not configured');
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

async function register(email, password, username) {
    if (!supabaseClient) {
        alert('Supabase not configured');
        return false;
    }
    
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { username: username }
        }
    });
    
    if (error) {
        alert('Registration failed: ' + error.message);
        return false;
    }
    
    alert('Registered! Please check your email to confirm.');
    return true;
}

async function logout() {
    if (!supabaseClient) return;
    
    await supabaseClient.auth.signOut();
    currentUser = null;
    
    const saved = loadGameData();
    window.playerStats = saved.stats;
    window.deaths = saved.deaths;
    window.attempts = saved.attempts;
    updateStatsDisplay(window.playerStats, window.deaths, window.attempts);
    renderLevelButtons(window.playerStats);
    
    const authBtn = document.getElementById('authBtn');
    if (authBtn) {
        authBtn.textContent = '🔐 LOGIN';
        authBtn.onclick = showAuthModal;
    }
    alert('Logged out');
}

async function loadOnlineData() {
    if (!supabaseClient || !currentUser) return;
    
    const { data: stats } = await supabaseClient
        .from('player_stats')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
    
    if (stats) {
        window.playerStats = {
            stars: stats.stars || 0,
            diamonds: stats.diamonds || 0,
            coins: stats.secret_coins || 0,
            completedLevels: [],
            bestPercent: {}
        };
        window.deaths = stats.total_deaths || 0;
        window.attempts = stats.total_attempts || 0;
    }
    
    const { data: progress } = await supabaseClient
        .from('level_progress')
        .select('*')
        .eq('user_id', currentUser.id);
    
    if (progress) {
        progress.forEach(p => {
            if (p.is_completed) window.playerStats.completedLevels.push(p.level_id);
            window.playerStats.bestPercent[p.level_id] = p.best_percent || 0;
        });
    }
    
    updateStatsDisplay(window.playerStats, window.deaths, window.attempts);
    renderLevelButtons(window.playerStats);
}

async function saveOnlineProgress() {
    if (!supabaseClient || !currentUser) return;
    
    await supabaseClient
        .from('player_stats')
        .upsert({
            user_id: currentUser.id,
            stars: window.playerStats.stars,
            diamonds: window.playerStats.diamonds,
            secret_coins: window.playerStats.coins,
            total_deaths: window.deaths,
            total_attempts: window.attempts
        });
    
    for (let levelId of window.playerStats.completedLevels) {
        await supabaseClient
            .from('level_progress')
            .upsert({
                user_id: currentUser.id,
                level_id: levelId,
                is_completed: true,
                best_percent: window.playerStats.bestPercent[levelId] || 100,
                completed_at: new Date()
            });
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
}

// Setup auth event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('loginTabBtn');
    const registerTab = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const doLogin = document.getElementById('doLoginBtn');
    const doRegister = document.getElementById('doRegisterBtn');
    const closeAuth = document.getElementById('closeAuthBtn');
    
    if (loginTab) {
        loginTab.onclick = () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        };
    }
    
    if (registerTab) {
        registerTab.onclick = () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        };
    }
    
    if (doLogin) {
        doLogin.onclick = () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            if (email && password) login(email, password);
            else alert('Enter email and password');
        };
    }
    
    if (doRegister) {
        doRegister.onclick = () => {
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            if (username && email && password) register(email, password, username);
            else alert('Fill all fields');
        };
    }
    
    if (closeAuth) closeAuth.onclick = closeAuthModal;
});
