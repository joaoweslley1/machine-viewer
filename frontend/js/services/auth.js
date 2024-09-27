function isAuthenticated() {
    if (!getToken()) {
        window.location.href = '/frontend/pages/singin.html';
    } else {
        return true;
    }
}

function getToken() {
    return localStorage.getItem('@userMachineViewer');
}

function singin(token) {
    localStorage.setItem('@userMachineViewer', token);
    window.location.href = '/frontend/pages/home.html';
}

function singout() {
    localStorage.removeItem('@userMachineViewer');
    window.location.href = '/frontend/pages/singin.html';
}

export default { isAuthenticated, getToken, singin, singout };