import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
    // Only run this in the browser
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('sb-access-token');

        if (!token) {
            throw redirect(307, '/login');
        }

        // Validate the token by calling your server's currentUser endpoint
        const res = await fetch('https://pagerking.vercel.app/api/currentUser', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            localStorage.removeItem('sb-access-token');
            throw redirect(307, '/login');
        }

        const { user } = await res.json();
        return { user };
    }
};