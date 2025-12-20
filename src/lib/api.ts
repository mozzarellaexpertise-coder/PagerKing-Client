const BASE_URL = 'https://pagerking.vercel.app/api';

function getAuthHeaders() {
    if (typeof window === 'undefined') {
        return { 'Content-Type': 'application/json' };
    }

    const key = Object.keys(localStorage).find(k =>
        k.startsWith('sb-') && k.endsWith('-auth-token')
    );

    if (!key) {
        return { 'Content-Type': 'application/json' };
    }

    const session = JSON.parse(localStorage.getItem(key)!);

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
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
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
}