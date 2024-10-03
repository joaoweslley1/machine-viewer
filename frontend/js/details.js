import { getAddress } from './services/address.js'

import Auth from "./services/auth.js";

const comboBox = document.getElementById("menu");
comboBox.style.position = "absolute"
comboBox.style.top = "50px"
comboBox.style.display = "none"
comboBox.style.zIndex= "100"

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
    Auth.isAuthenticated();
    console.log('Direcionar para página de configuração de usuário');
    window.location.href = '/frontend/pages/userConfig.html'
}

window.singout = () => {
    Auth.singout();
}



async function getDataById(machineId, ipAddress) {

    const options = {id: machineId};

    const response = await fetch(ipAddress);

    const data = await response.json();

    return data;
}

function generateDetailCardContent(buttonClicked, cadastro, status) {
    const elements = [];

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title', 'text-center');

    let detailInfo;

    if (buttonClicked == 'cpuButton') {
        cardTitle.textContent = 'CPU';
        detailInfo = generateCpuDetails(cadastro, status);
    } else if (buttonClicked == 'memButton') {
        cardTitle.textContent = 'MEM';
        detailInfo = generateMemoryDetails(cadastro, status);
    } else if (buttonClicked == 'diskButton') {
        cardTitle.textContent = 'DISK';
        detailInfo = generateDiskDetails(cadastro, status);
    }

    elements.push(cardTitle, document.createElement('br'), ...detailInfo);

    return elements;
}

function generateCpuDetails(cadastro, status) {
    const cpuMedData = status.cputot;
    const cpuDetData = status.cpudet.split(';');

    const elements = [];

    const cpuMed = _generateBar('MED', cpuMedData, true, 'cpu-total-bar');
    elements.push(cpuMed, document.createElement('br'));

    for (let i = 0; i < cpuDetData.length; i++) {
        const row = _generateBar(`Core ${i}`, cpuDetData[i], false, `core-bar-${i}`);
        elements.push(row);
    }

    return elements;
}

function generateMemoryDetails(cadastro, status) {
    const elements = [];
    let label;

    const memTot = status.memtot;
    const memUsa = status.memusa;
    const memLiv = (parseFloat(memTot) - parseFloat(memUsa)).toFixed(2);

    const swpTot = status.swptot;
    const swpUsa = status.swpusa;
    const swpLiv = (parseFloat(swpTot) - parseFloat(swpUsa)).toFixed(2);

    
    const memRow = document.createElement('div');
    memRow.style.display = 'flex';
    memRow.style.justifyContent = 'space-evenly';
    
    memRow.appendChild(_generateColum('TOTAL', memTot + 'GB'));
    memRow.appendChild(_generateColum('USADO', memUsa + 'GB', 'memusa'));
    memRow.appendChild(_generateColum('LIVRE', memLiv + 'GB', 'memliv'));
    
    const swpRow = document.createElement('div');
    swpRow.style.display = 'flex';
    swpRow.style.justifyContent = 'space-evenly';

    swpRow.appendChild(_generateColum('TOTAL', swpTot + 'GB'));
    swpRow.appendChild(_generateColum('USADO', swpUsa + 'GB', 'swpusa'));
    swpRow.appendChild(_generateColum('LIVRE', swpLiv + 'GB', 'swpliv'));
    

    elements.push(_generateBar('MEM', (memUsa * 100 / memTot).toFixed(1), true, 'membar'));
    elements.push(memRow);
    elements.push(document.createElement('hr'))
    elements.push(_generateBar('SWAP', (swpUsa * 100 / swpTot).toFixed(1), true, 'swpbar'));
    elements.push(swpRow);

    return elements;
}

function generateDiskDetails(cadastro, status) {
    const elements = [];

    const dskTot = status.dsktot;
    const dskUsa = status.dskusa;
    const dskLiv = (parseFloat(dskTot) - parseFloat(dskUsa)).toFixed(2);

    const holder = document.createElement('div');
    holder.classList.add('mx-auto');
    holder.style.height = '300px';
    holder.style.width = '300px';

    const chartCanvas = document.createElement('canvas');
    const chart = new Chart(chartCanvas, {
        name: 'disk-chart',
        type: 'pie',
        data: {
            labels: ['Usado', 'Disponível'],
            datasets: [{
                label: 'Armazenamento',
                data: [dskUsa, dskLiv],
                backgroundColor: ['#AD1818', '#0d6efd'],
                borderColor: ['#FFFFFF00', '#FFFFFF00'],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
        }

    });

    holder.appendChild(chartCanvas);

    const diskRow = document.createElement('div');
    diskRow.style.display = 'flex';
    diskRow.style.justifyContent = 'space-evenly';

    diskRow.appendChild(_generateColum('TOTAL', dskTot + 'GB', 'dsktot'));
    diskRow.appendChild(_generateColum('USADO', dskUsa + 'GB', 'dskusa'));
    diskRow.appendChild(_generateColum('LIVRE', dskLiv + 'GB', 'dskliv'));

    elements.push(holder, document.createElement('hr'), diskRow);
    return elements;
}

function loadPage(soIcon, deviceName, deviceAddress, deviceSo, enabledIcon, enabledLabel, cadastro, estado) {

    soIcon.src = `../assets/img/${cadastro.so.toLowerCase()}Icon.svg`;
    deviceName.textContent = cadastro.alias;
    deviceAddress.textContent = cadastro.ip;
    deviceSo.textContent = cadastro.so;

    if (cadastro.situacao === 'A') {
        enabledIcon.src = '../assets/img/enabled.svg';
        enabledLabel.textContent = 'Ativa';
    } else {
        enabledIcon.src = '../assets/img/unabled.svg';
        enabledLabel.textContent = 'Inativa';
    }
}

function updatePage(buttonClicked, header, body, cadastro, estado) {
    const statusLabel = header.querySelector('#enabled-label');
    const cpuTemp = header.querySelector('#cpu-temp');
    const dskTemp = header.querySelector('#dsk-temp');

    cpuTemp.textContent = parseFloat(status.cputmp) !== -1.0 ? 'CPU: ' + status.cputmp + '°C' : 'Indisponível';
    dskTemp.textContent = parseFloat(status.dsktmp) !== -1.0 ? 'DISK: ' + status.dsktmp + '°C' : 'Indisponível';

    if (cadastro.situacao === 'A') {
        statusLabel.textContent = 'Ativa';
        header.querySelector('#enabled-icon').src = '../assets/img/enabled.svg'
    } else {
        statusLabel.textContent = 'Inativa';
        header.querySelector('#enabled-icon').src = '../assets/img/unabled.svg'
    }

    // console.log(estado.cputot);
    if (buttonClicked == 'cpuButton') {

        // console.log(body.querySelector('#cpu-total-bar'))
        _updateBar(body.querySelector('#cpu-total-bar'), estado.cputot);

        const cpuDetData = estado.cpudet.split(';')
    
        for (let i = 0; i < cpuDetData.length; i++) {
            _updateBar(body.querySelector(`#core-bar-${i}`), cpuDetData[i])
        }

    } else if (buttonClicked == 'memButton') {

        _updateBar(body.querySelector('#membar'), (estado.memusa * 100 / estado.memtot).toFixed(1))
        _updateBar(body.querySelector('#swpbar'), (estado.swpusa * 100 / estado.swptot).toFixed(1))

        body.querySelector('#memliv').textContent = (estado.memtot - estado.memusa).toFixed(2) + 'GB';
        body.querySelector('#memusa').textContent = estado.memusa + 'GB';
        body.querySelector('#swpusa').textContent = estado.swpusa + 'GB';
        body.querySelector('#swpliv').textContent = (estado.swptot - estado.swpusa).toFixed(2) + 'GB';
        
    } else if (buttonClicked == 'diskButton') {
        console.log(body.querySelector('#dskusa').textContent);
        console.log(estado.dskusa);
        body.querySelector('#dskusa').textContent = estado.dskusa + 'GB';
        body.querySelector('#dskliv').textContent = (estado.dsktot - estado.dskusa).toFixed(2) + 'GB';
    }
}

function _updateBar(bar, value) {

    const progressBar = bar;

    progressBar.style.width = progressBar.textContent = value + '%';

    if (value < 30) {
        progressBar.style.backgroundColor = '#0d6efd';
    } else if (value < 50) {
        progressBar.style.backgroundColor = '#E6B30D';
    } else {
        progressBar.style.backgroundColor = '#AD1818';
    }
}

function _generateBar(label, percentage, med = false, id='') {
    const actualProgress = percentage;

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '20px';
    row.style.justifyContent = 'end';

    const labelInfo = document.createElement('b');
    labelInfo.classList.add('my-auto');
    labelInfo.textContent = label;

    const progress = document.createElement('div');
    progress.classList.add('progress', 'my-auto');

    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    
    _updateBar(progressBar, actualProgress);
    
    if (med) {
        progress.style.width = '90%';
    } else {
        row.style.paddingTop = '10px';
        progress.style.width = '85%';
    }
    
    if (id !== '') {
        progressBar.id = id;
    }

    progress.appendChild(progressBar);

    
    row.appendChild(labelInfo);
    row.appendChild(progress);

    return row;
}

function _generateColum(labelContent, valueContent, id = '') {
    const column = document.createElement('div');
    column.style.display = 'flex';
    column.style.flexDirection = 'column';
    column.style.alignItems = 'center';


    const label = document.createElement('b');
    label.textContent = labelContent;

    const value = document.createElement('p');
    value.style.marginTop = '20px';
    value.style.marginBottom = '0%';
    value.textContent = valueContent;
    
    const bar = document.createElement('hr');
    bar.style.width = '100%'
    
    if (id != '') {
        value.id = id;
    }

    column.appendChild(value);
    column.appendChild(bar);
    column.appendChild(label);
    
    
    return column;
}

function getDeviceId(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function changeDetailingCard(buttonClicked, cadastro, status){

    const detailingCard = document.getElementById('detailing-card-body');
    detailingCard.innerHTML = '';
    const elements = generateDetailCardContent(buttonClicked, cadastro, status);

    elements.forEach(element => {
        detailingCard.appendChild(element);
    });
};

const serverAddress = await getAddress();
const deviceId = getDeviceId('device-id');

let data = await getDataById(deviceId, `http://${serverAddress}:5900/maquinas/${deviceId}`);
let cadastros = data[0][0];
let status = data[1][0];


const cpuButton = document.getElementById('cpuButton');
const memButton = document.getElementById('memButton');
const diskButton = document.getElementById('diskButton');

let actualDetailingPage = cpuButton.id;

cpuButton.addEventListener('click', function() {
    actualDetailingPage = cpuButton.id;
    changeDetailingCard(
        cpuButton.id, 
        cadastros, 
        status)
});
memButton.addEventListener('click', function() {
    actualDetailingPage = memButton.id;
    changeDetailingCard(
        memButton.id, 
        cadastros, 
        status)
});
diskButton.addEventListener('click', function() {
    actualDetailingPage = diskButton.id;
    changeDetailingCard(
        diskButton.id, 
        cadastros, 
        status)
});

loadPage(
    document.getElementById('so-icon'),
    document.getElementById('device-name'),
    document.getElementById('device-address'),
    document.getElementById('device-so'),
    document.getElementById('enabled-icon'),
    document.getElementById('enabled-label'),
    cadastros,
    status
);

changeDetailingCard(cpuButton.id, cadastros, status);
// generateDetailCardContent(cpuButton.id, cadastros, status)

setInterval(async () => {
    data = await getDataById(deviceId, `http://${serverAddress}:5900/maquinas/${deviceId}`);
    cadastros = data[0][0];
    status = data[1][0];

    // console.log(status);

    updatePage(
        actualDetailingPage,
        document.getElementById('device-header'),
        document.getElementById('detailing-card-body'),
        cadastros,
        status
    );
}, 3000);