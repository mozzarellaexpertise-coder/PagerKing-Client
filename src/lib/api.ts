const BASE_URL = 'https://pagerking.vercel.app/api';

// Helper to get the token from local storage (set during login)
function getAuthHeaders() {
    const token = localStorage.getItem('sb-access-token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

export async function login(email: string, password: string) {
    // Note: Usually you'd login via the client-side Supabase SDK, 
    // but if you are routing through your own server:
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
}

export async function getMessages() {
    const res = await fetch(`${BASE_URL}/messages`, {
        headers: getAuthHeaders()
    });
    return res.json();
}

export async function sendMessage(text: string, receiver_id: string | null = null) {
    const res = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text, receiver_id })
    });
    return res.json();
}