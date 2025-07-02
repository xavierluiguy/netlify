import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    // Lógica de autenticação
});

export async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/';
}