import {defineStore} from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('userName')) || null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.user,
        userName: (state) => state.user?.name || '',
        isAdmin: (state) => state.user?.role === 'admin',
        userRole: (state) => state.user?.role || 'user',
    },
    actions: {
        login(token, userData) {
            this.user = userData;
            this.token = token;
            localStorage.setItem('token', token);
            localStorage.setItem('userName', JSON.stringify(userData));
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
        }
    }
});
