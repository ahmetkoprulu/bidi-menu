export default {
    getToken() {
        console.log('getToken', document.cookie);
        return localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    removeToken() {
        localStorage.removeItem('token');
    },
}