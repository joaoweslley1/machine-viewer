function isAuthenticated() {
    console.log(getToken());
    if (getToken() === "undefined") {
        window.location.href = '/frontend/pages/singin.html';
    } else if (!getToken()) {
        window.location.href = '/frontend/pages/singin.html';
    } else {
        return true;
    }
}

function getToken() {
    return localStorage.getItem('@userMachineViewer');
}

function singin(token, nome) {
    localStorage.setItem('@userMachineViewer', token);
    localStorage.setItem('@userName', nome);

    if (!isAuthenticated()) {
        alert("Usuário ou senha incorreto.")
    } else {
        window.location.href = '/frontend/pages/home.html';
    }
}

function singout() {
    localStorage.removeItem('@userMachineViewer');
    localStorage.removeItem('@userName');
    window.location.href = '/frontend/pages/singin.html';
}

export default { isAuthenticated, getToken, singin, singout };