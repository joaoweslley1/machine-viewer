import { getAddress } from './services/address.js'

import Auth from './services/auth.js'

const serverAddress = await getAddress();

const passwordField = document.getElementById("senha");
const passwdErrorMessage = document.getElementById("passwordError");
const usernameField = document.getElementById("email-or-username");
const usernameErrorMessage = document.getElementById("usernameError");

let usernameToSend;
let emailToSend;

function validatePassword() {
    const passwd = passwordField.value;

    if (passwd === '') {
        passwdErrorMessage.textContent = "Preencha o campo de senha!";
        return false;
    } 
    passwdErrorMessage.textContent = "";
    return true;
}
  
function validateUsername() {
    const username = usernameField.value;
    const regex = /[*@*]/;

    if (username === '') {
        usernameErrorMessage.textContent = 'Preencha o campo de usuário!'
        return false;
    }

    if (regex.test(username)) {
        emailToSend = username;
        usernameToSend = undefined;
    } else {
        usernameToSend = username;
        emailToSend = undefined;
    }

    usernameErrorMessage.textContent = '';
    return true;

}


async function login(address, userInfo) {

    const res = await fetch(`http://${address}:5900/singin`, {
        method: ['POST'], 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "username": userInfo["username"],
            "email":    userInfo["email"],
            "senha":    userInfo["senha"],
        }),
    });

    const resData = await res.json();

    Auth.singin(resData['token'], resData['nome']);
    
}

passwordField.addEventListener('input', validatePassword);
usernameField.addEventListener('input', validateUsername);

document.getElementById("login-form").addEventListener("submit", async function(event) {
    
    if (!validatePassword() || !validateUsername()){
        event.preventDefault();
    } else {
        await login(serverAddress, {
            "username": usernameToSend,
            "email": emailToSend,
            "senha": passwordField.value
        });
    }
});