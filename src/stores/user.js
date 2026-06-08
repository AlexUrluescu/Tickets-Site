import {defineStore} from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('userName')) || null,
        userEmail: localStorage.getItem('userEmail') || null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.user,
        userName: (state) => state.user?.name || '',
        isAdmin: (state) => state.user?.role === 'admin',
        userRole: (state) => state.user?.role || 'user',
    },
    actions: {
        login(token, userData, userEmail) {
            this.user = userData;
            this.token = token;
            this.userEmail = userEmail || localStorage.getItem('userEmail');
            localStorage.setItem('token', token);
            localStorage.setItem('userName', JSON.stringify(userData));
        },
        logout() {
            this.user = null;
            this.token = null;
            this.userEmail = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
        }
    }
});
