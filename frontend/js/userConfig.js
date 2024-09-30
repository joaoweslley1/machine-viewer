import { getAddress } from "./services/address.js";

import Auth from "./services/auth.js"

const serverAddress = await getAddress();

const actualNameField = document.getElementById("actual-name");
const actualUsernameField = document.getElementById("actual-username");
const actualEmailField = document.getElementById("actual-email");
const newNameField = document.getElementById("nome");
const newUsernameField = document.getElementById("username");
const newEmailField = document.getElementById("email");
const actualPasswordField = document.getElementById("senha");
const newPasswordField = document.getElementById("senha2");
const newPasswordFieldConf = document.getElementById("senha3");
const passwordError = document.getElementById("passwordError");
const usernameError = document.getElementById("usernameError");

async function updatePage(address) {
    const token = Auth.getToken();
    // console.log('foi?');

    const response = await fetch(`http://${address}:5900/usuarios`,{
        method: ['GET'],
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });

    const data = await response.json();

    console.log(data[0][0]);
    actualNameField.textContent = data[0][0]["nome"];
    actualUsernameField.textContent = data[0][0]["username"];
    actualEmailField.textContent = data[0][0]["email"];
}

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

async function updateUser(address, userInfo) {
    const token = Auth.getToken();
    const response = await fetch(`http://${address}:5900/usuarios`, {
        method: ['PUT'],
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON .stringify({
            'nome': userInfo['nome'],
            'username': userInfo['username'],
            'email': userInfo['email'],
            'senha': userInfo['senha'],
            'novaSenha': userInfo['novaSenha'],
        }),
    })

    const res = await response.json();
    if (res['message'] === 'Alterações salvas') {
        window.location.reload();
    };
    
}

newPasswordField.addEventListener('input', () => validatePassword(newPasswordField.value, newPasswordFieldConf.vaue));
newPasswordFieldConf.addEventListener('input', () => validatePassword(newPasswordField.value, newPasswordFieldConf.vaue));
newUsernameField.addEventListener('input', () => validateUsername(newUsernameField.value));

updatePage(serverAddress);

document.getElementById('form').addEventListener('submit', async function (event) {
    if (!validatePassword(newPasswordField.value, newPasswordFieldConf.value) || !validateUsername(newUsernameField.value)) {
        event.preventDefault();
    } else {
        await updateUser(serverAddress, {
            'nome': newNameField.value,
            'username': newUsernameField.value,
            'email': newEmailField.value,
            'senha': actualPasswordField.value,
            'novaSenha': newPasswordField.value,
        })
    }
})