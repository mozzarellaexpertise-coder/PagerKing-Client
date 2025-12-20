const BASE_URL = 'https://pagerking.vercel.app/api';

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();

    return {
        'Content-Type': 'application/json',
        ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {})
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