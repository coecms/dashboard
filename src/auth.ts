const authProvider = {
    login: ({ username, password }) =>  {
        const request = new Request(import.meta.env.VITE_SIMPLE_REST_URL + 'auth', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.text();
            })
            .then(auth => {
                localStorage.setItem('auth', auth);
            })
            .catch((e) => {
                if ( e.message ) {
                    throw new Error(e.message);
                } else {
                    throw new Error("I broke");
                }
            });
    },
    logout: () => {
        localStorage.removeItem('auth');
        return Promise.resolve();
    },
    checkAuth: () =>
        localStorage.getItem('auth') ? Promise.resolve() : Promise.reject(),
    checkError:  (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('auth');
            return Promise.reject();
        }
        // other error code (404, 500, etc): no need to log out
        return Promise.resolve();
    },
    getIdentity: () =>
        Promise.resolve({
            id: 'user',
            fullName: 'User',
        }),
    getPermissions: () => Promise.resolve(''),
};

export default authProvider;