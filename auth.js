let supabaseClient = null;
let currentUser = null;

// Initialize Supabase
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function login() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    if (!email || !password) { alert('Enter email and password'); return; }
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) { alert('Login failed: ' + error.message); return; }
    
    currentUser = data.user;
    alert('Logged in!');
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('authBtn').innerText = 'LOGOUT';
}

async function register() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const username = document.getElementById('authUsername').value;
    if (!email || !password || !username) { alert('Fill all fields'); return; }
    
    const { data, error } = await supabaseClient.auth.signUp({ 
        email, password, 
        options: { data: { username } }
    });
    if (error) { alert('Register failed: ' + error.message); return; }
    
    alert('Registered! Check email to confirm.');
}

async function logout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    document.getElementById('authBtn').innerText = 'LOGIN';
    alert('Logged out');
}

// Event listeners for auth
document.getElementById('doLogin').onclick = login;
document.getElementById('doRegister').onclick = register;
document.getElementById('closeAuthBtn').onclick = () => {
    document.getElementById('authOverlay').classList.add('hidden');
};
document.getElementById('authBtn').onclick = () => {
    if (currentUser) logout();
    else document.getElementById('authOverlay').classList.remove('hidden');
};
