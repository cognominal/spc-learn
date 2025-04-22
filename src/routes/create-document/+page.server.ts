import { get } from 'http';
import type { Actions, PageServerLoad } from './$types';
import { type Cookies } from '@sveltejs/kit'

const cookieName = 'SiteEditor';

function getCookie(cookies: Cookies, name: string) {
    return cookies.get(name);
}


export const load = async ({ cookies }: { cookies: Cookies }) => {
    let cookie = getCookie(cookies, cookieName)
    // console.log(`laod : Cookie value: ${cookie}`);

    return { cookie }
}
export const actions: Actions = {
    getCookie: async ({ request, cookies }) => {
    },
    setCookie: async ({ request, cookies }) => {
        try {
            const data = await request.formData();
            const cookie = data.get('cookieValue')?.toString();
            // console.log(`set Cookie: ${cookie}`);
            cookies.set(cookieName, cookie!, { path: '/' });


        } catch (error) {
            console.error('Error processing request:', error);
        }
    }
}