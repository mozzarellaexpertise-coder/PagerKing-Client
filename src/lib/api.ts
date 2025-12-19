const BASE_URL = 'https://pagerking.vercel.app/api';

function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// ADD THIS FUNCTION
export async function getCurrentUser() {
    const res = await fetch(`${BASE_URL}/currentUser`, {
        headers: getAuthHeaders()
    });
    return res.json();
}

// Keep your other existing functions (login, getMessages, etc.)
export async function login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
}