import { getAddress } from './services/address.js';
import { $ } from '../lib/dom.js';

import Auth from './services/auth.js';

const serverAddress = await getAddress();

const tbody = $('tbody');

const comboBox = document.getElementById("menu");
comboBox.style.position = "absolute";
comboBox.style.top = "50px";
comboBox.style.display = "none";
comboBox.style.zIndex= "100";

const button = document.getElementById("user-button");

const rect = button.getBoundingClientRect();
comboBox.style.left = rect.left - 70 + "px";
comboBox.style.top = rect.top + 40 + "px";

const username = localStorage.getItem('@userName');
document.getElementById("user-name").textContent = (username) ? username.split(' ')[0] : 'Fazer login';

window.toggleCombobox = () => {
    if (comboBox.style.display === "block") {
        comboBox.style.display = "none"
    } else if (comboBox.style.display === "none") {
        comboBox.style.display = "block"
    }
}

window.goToUserConfigPage = () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = '/frontend/pages/singin.html';
    } else {
        window.location.href = '/frontend/pages/userConfig.html';
    }
}

window.singout = () => {
    Auth.singout();
}

async function getData(address) {
    const response = await fetch(address, {
        method: ['GET'],
    });
    const data = await response.json()
    return {
        ...data,
        address : address
    };
}


function _createDeviceRow(cad, status, ip, table) {
    const newRow = document.createElement('tr');
    newRow.id = `row_${cad.id}`;

    const soIcon = document.createElement('img');
    soIcon.src = `../assets/img/${cad.so.toLowerCase()}Icon.svg`;
    const soCell = newRow.insertCell(0);
    soCell.classList.add('text-center', 'align-middle');
    soCell.style.width = '5%';
    soCell.appendChild(soIcon);

    const aliasCell = newRow.insertCell(1);
    aliasCell.classList.add('align-middle');
    const nameLink = document.createElement('a');
    nameLink.href = `details.html?device-id=${cad.id}`;
    nameLink.textContent = cad.alias;
    aliasCell.appendChild(nameLink);

    const ipCell = newRow.insertCell(2);
    ipCell.classList.add('align-middle');
    ipCell.textContent = cad.ip;

    const cpuCell = newRow.insertCell(3);
    cpuCell.classList.add('align-middle');
    cpuCell.textContent = status.cputot + '%';

    const memCell = newRow.insertCell(4);
    memCell.classList.add('align-middle');
    memCell.textContent = status.memtot + '%';

    const diskTempCell = newRow.insertCell(5);
    diskTempCell.classList.add('align-middle');
    diskTempCell.textContent = status.dsktmp !== 'Indisponível' ? status.dsktmp + '°C' : status.dsktmp;

    const cpuTempCell = newRow.insertCell(6);
    cpuTempCell.classList.add('align-middle');
    cpuTempCell.textContent = status.cputmp !== 'Indisponível' ? status.cputmp + '°C' : status.cputmp;

    const  situacaoCell = newRow.insertCell(7);
    situacaoCell.classList.add('align-middle');
    situacaoCell.textContent = cad.situacao === 'A' ? 'Ativa' : 'Inativa';

    const deleteCell = newRow.insertCell(8);
    deleteCell.classList.add('text-center','align-middle');

    const removeButton = document.createElement('button');
    removeButton.classList.add('border-0');
    removeButton.style.backgroundColor = 'transparent';

    removeButton.addEventListener('click', async function() {
        const resultado = await _disableDevice(newRow.id.split('_')[1], ip);
        const message = await resultado.json();

        if (cad.situacao !== 'A' && resultado.status == 201) {
            table.deleteRow(newRow.rowIndex - 1);
        } else {
            alert(message.message);
        }
    });

    const removeIcon = document.createElement('i');
    removeIcon.classList.add('fas', 'fa-trash');

    removeButton.appendChild(removeIcon);

    deleteCell.appendChild(removeButton);

    return newRow;
}

function checkNewDevices(table, devicesCount) {
    return table.rows.length < devicesCount;
}

function updateTable(table, cad, status) {
    let cadAtivos = [];

    for (var i = 0; i < cad.length; i++) {
        if (cad[i].situacao !== 'D') {
            cadAtivos.push(cad[i]);
        }
    }

    for (var i = 0, row; row = table.rows[i]; i++) {
        row.cells[3].textContent = status[i].cputot + '%';
        row.cells[4].textContent = (parseFloat(status[i].memusa) * 100 / parseFloat(status[i].memtot)).toFixed(1) + '%';
        row.cells[5].textContent = status[i].dsktmp !== 'Indisponível' ? status[i].dsktmp + '°C' : 'Indisponível';
        row.cells[6].textContent = status[i].cputmp !== 'Indisponível' ? status[i].cputmp + '°C' : 'Indisponível';
        row.cells[7].textContent = cadAtivos[i].situacao === 'A' ? 'Ativa' : 'Inativa';
    }
}

async function _disableDevice(idMaquina, ipAddress) {
    // console.log(token);
    console.log(`http://${ipAddress}:5900/maquinas/${idMaquina}`);
    const autenticado = Auth.isAuthenticated();
    const token = Auth.getToken();
    let resultado;
    if (autenticado){
        resultado = await fetch(`http://${ipAddress}:5900/maquinas/${idMaquina}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
    }
    return resultado;
}

setInterval(async () => {

    const data = await getData(`http://${serverAddress}:5900/maquinas`);
    const cadastros = data[0][0];
    const status = data[1][0];

    if (checkNewDevices(tbody, cadastros.length)) {
        tbody.innerHTML = '';
        cadastros.forEach(cad => {
            if (cad.situacao !== 'D') {
                const row = _createDeviceRow(cad, status[cadastros.indexOf(cad)], serverAddress, tbody);
                tbody.appendChild(row);
            }
        });
    } else {
        updateTable(tbody, cadastros, status);
    }
}, 3000);