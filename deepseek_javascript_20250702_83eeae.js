const supabaseUrl = 'https://xbqzoiqyhobqmakuiwhv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicXpvaXF5aG9icW1ha3Vpd2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzIzMzgsImV4cCI6MjA2NzA0ODMzOH0.pLzCHdAtf2pTiopZX-8-yhu7y_ygW2h-e-se1I9e_hU';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Funções globais
async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

// Verifica autenticação e redireciona
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && window.location.pathname.includes('calculadora.html')) {
        window.location.href = 'index.html';
    }
    return session;
}

// Carrega dados do usuário
async function loadUserData(userId) {
    const { data: inversores } = await supabase
        .from('inversores')
        .select('*')
        .eq('user_id', userId);

    const { data: paineis } = await supabase
        .from('paineis')
        .select('*')
        .eq('user_id', userId);

    return { inversores, paineis };
}

// Salva novo inversor
async function saveInversor(inversorData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('inversores').insert([{
        user_id: user.id,
        ...inversorData
    }]);
    return { error };
}

// Salva novo painel
async function savePainel(painelData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('paineis').insert([{
        user_id: user.id,
        ...painelData
    }]);
    return { error };
}