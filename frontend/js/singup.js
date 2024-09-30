import { getAddress } from "./services/address.js";

import Auth from "./services/auth.js";

const serverAddress = await getAddress();

const passwordField = document.getElementById("senha");
const confPasswordField = document.getElementById("senha2");
const usernameField = document.getElementById("username");

const passwordError = document.getElementById("passwordError");
const usernameError = document.getElementById("usernameError");

function validatePassword(passwd, confpasswd) {

    if (passwd !== '' && passwd.length < 8) {
        passwordError.textContent = "A senha deve conter pelo menos 8 caracteres.";
        return false;
    }
    else if (passwd !== confpasswd) {
        passwordError.textContent = "As senhas não coincidem.";
        return false;
    }

    passwordError.textContent = "";
    return true;
}

function validateUsername(username) {
    const regex = /[^a-zA-Z0-9]/;
    
    if (regex.test(username)) {
        usernameError.textContent = "O nome de usuário não pode conter caracteres especiais!";
        return false
    }

    usernameError.textContent = '';
    return true;
}

async function register(address, userInfo) {
    
    const response = await fetch(`http://${address}:5900/usuarios`, {
        method: ['POST'],
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'nome':     userInfo['nome'],
            'username': userInfo['username'],
            'email':    userInfo['email'],
            'senha':    userInfo['senha'],
        })
    })

    const res = await response.json();
    console.log(res);

    if (res["status"] === 1) {
        alert('Ocorreu um erro com a requisição: Nome de usuário e/ou senha já cadastrados!')
    } else {
        window.location.href = '/frontend/pages/singin.html';
    }
}

passwordField.addEventListener('input', () => validatePassword(passwordField.value, confPasswordField.value));
confPasswordField.addEventListener('input', () => validatePassword(passwordField.value, confPasswordField.value));

usernameField.addEventListener('input', () => validateUsername(usernameField.value));

document.getElementById('form').addEventListener('submit', async function (event) {
    if (!validatePassword(passwordField.value, confPasswordField.value) || !validatePassword(passwordField.value, confPasswordField.value)) {
        event.preventDefault();
    } else {
        await register(serverAddress, {
            'nome': document.getElementById('nome').value,
            'username': usernameField.value.toLowerCase(),
            'email': document.getElementById('email').value.toLowerCase(),
            'senha': passwordField.value,
        });
    }
});
