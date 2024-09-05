async function getData(address) {
    const response = await fetch(address, {method: ['GET']});
    const data = await response.json()
    return {
        ...data,
        address : address
    };
}

async function getDataById(machineId, ipAddress) {

    const options = {id: machineId};

    const response = await fetch(ipAddress, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
    })
    .catch(error => {
        console.error('Error:', error);
    });

    const data = await response.json();

    return data;
}

function createDeviceRow(cadastro, estado, ipAddress, table) {
    //  CRIANDO ROW 
    const newRow = document.createElement('tr');
    newRow.id = `row_${cadastro.id}`;

    const soIcon = document.createElement('img');
    soIcon.src = `assets/img/${cadastro.so.toLowerCase()}Icon.svg`;

    const soCell = newRow.insertCell(0);
    soCell.classList.add('text-center', 'align-middle');
    soCell.style.width = '5%';
    soCell.appendChild(soIcon);


    const aliasCell = newRow.insertCell(1);
    aliasCell.classList.add('align-middle');


    const ipCell = newRow.insertCell(2);
    ipCell.classList.add('align-middle');

    const cpuCell = newRow.insertCell(3);
    cpuCell.classList.add('align-middle');

    const memCell = newRow.insertCell(4);
    memCell.classList.add('align-middle');

    const diskTempCell = newRow.insertCell(5);
    diskTempCell.classList.add('align-middle');

    const cpuTempCell = newRow.insertCell(6);
    cpuTempCell.classList.add('align-middle');

    const statusCell = newRow.insertCell(7);
    statusCell.classList.add('align-middle');

    const deleteCell = newRow.insertCell(8);
    deleteCell.classList.add('text-center','align-middle');

    // TODO - Utilizar o link para acessar a página de detalhamento da máquina.
    
    const nameLink = document.createElement('a');
    nameLink.href = `pages/detailing.html?device-id=${cadastro.id}`;
    nameLink.textContent = cadastro.nome;
    aliasCell.appendChild(nameLink);


    //aliasCell.textContent = cadastro.nome; // Desativar linha quando lógica de acesso à página de detalhamento for adicionada
    ipCell.textContent = cadastro.ip;
    cpuCell.textContent = estado.cputot + '%';

    memCell.textContent = (parseFloat(estado.memusa) * 100 / parseFloat(estado.memtot)).toFixed(1)+'%';

    diskTempCell.textContent = estado.dsktmp !== 'Indisponível' ? estado.dsktmp + '°C' : estado.dsktmp;

    cpuTempCell.textContent = estado.cputmp !== 'Indisponível' ? estado.cputmp + '°C' : estado.cputmp;

    statusCell.textContent = cadastro.estado === 'A' ? 'Ativa' : 'Inativa';

    const removeIcon = document.createElement('i');
    removeIcon.classList.add('fas', 'fa-trash');

    const removeButton = document.createElement('button')
    removeButton.classList.add('border-0');
    removeButton.style.backgroundColor = 'transparent';

    removeButton.addEventListener('click', function() {
        _disableDevice(newRow.id.split('_')[1], ipAddress);
        table.deleteRow(newRow.rowIndex - 1);
    });


    removeButton.appendChild(removeIcon);


    deleteCell.appendChild(removeButton);

    return newRow;
}

function checkNewDevices(table, devicesCount) {
    return table.rows.length < devicesCount
}

function updateTable(table, cadastro, estado) {
    let filteredCadastro = [];

    for (var i = 0; i < cadastro.length; i++) {
        if (cadastro[i].exibir == 'S') {
            filteredCadastro.push(cadastro[i])
        }
    }

    for (var i = 0, row; row = table.rows[i]; i++) {
        row.cells[2].textContent = filteredCadastro[i].ip;
        row.cells[3].textContent = estado[i].cputot + '%';
        row.cells[4].textContent = (parseFloat(estado[i].memusa) * 100 / parseFloat(estado[i].memtot)).toFixed(1)+'%';
        row.cells[5].textContent = estado[i].dsktmp !== 'Indisponível' ? estado[i].dsktmp + '°C' : estado[i].dsktmp;
        row.cells[6].textContent = estado[i].cputmp !== 'Indisponível' ? estado[i].cputmp + '°C' : estado[i].cputmp;
        row.cells[7].textContent = filteredCadastro[i].estado === 'A' ? 'Ativa' : 'Inativa';
    }
}

async function _disableDevice(machineId, ipAddress){
    const options = {id : machineId};
    await fetch(`http://${ipAddress}/api/desconectar_maquina`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function generateDetailingCardContent(buttonClicked, cadastro, estado) {

    const elements = [];

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title' ,'text-center');

    let detailingInfo;

    if (buttonClicked == 'cpuButton') {
        cardTitle.textContent = 'CPU';
        detailingInfo = generateCpuDetails(cadastro, estado);

    } else if (buttonClicked == 'memButton') {
        cardTitle.textContent = 'MEM/SWAP';
        detailingInfo = generateMemoryDetails(cadastro, estado);
        
    } else if (buttonClicked == 'diskButton') {
        cardTitle.textContent = 'DISK';
        detailingInfo = generateDiskDetails(cadastro, estado);
    }

    elements.push(cardTitle, document.createElement('br'), ...detailingInfo);

    return elements;
}

function generateCpuDetails(cadastro, estado) {
    const cpuMedData = estado.cputot;
    const cpuDetData = estado.cpudet.split(';');
    
    const elements = [];
    
    const cpuMed = _generateBar('MED', cpuMedData, true, 'cpu-total-bar');
    elements.push(cpuMed, document.createElement('br'));

    for (let i = 0; i < cpuDetData.length; i++) {
        const row = _generateBar(`Core ${i}`, cpuDetData[i], false, `core-bar-${i}`);
        elements.push(row);
    }

    return elements;
}

function generateMemoryDetails(cadastro, estado) {
    const elements = [];
    let label;

    const memTot = estado.memtot;
    const memUsa = estado.memusa;
    const memLiv = (parseFloat(memTot) - parseFloat(memUsa)).toFixed(2);

    const swpTot = estado.swptot;
    const swpUsa = estado.swpusa;
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

function generateDiskDetails(cadastro, estado) {
    const elements = [];

    const dskTot = estado.dsktot;
    const dskUsa = estado.dskusa;
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

function getDeviceId(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function loadPage(soIcon, deviceName, deviceAddress, deviceSo, enabledIcon, enabledLabel, cadastro, estado) {

    soIcon.src = `../assets/img/${cadastro.so.toLowerCase()}Icon.svg`;
    deviceName.textContent = cadastro.nome;
    deviceAddress.textContent = cadastro.ip;
    deviceSo.textContent = cadastro.so;

    if (cadastro.estado === 'A') {
        enabledIcon.src = '../assets/img/enabled.svg';
        enabledLabel.textContent = 'Ativa';
    } else {
        enabledIcon.src = '../assets/img/unabled.svg';
        enabledLabel.textContent = 'Inativa';
    }
}

function updatePage(buttonClicked, header, body, cadastro, estado) {
    const statusLabel = header.querySelector('#enabled-label');

    if (cadastro.estado === 'A') {
        header.querySelector('#enabled-label').textContent = 'Ativa';
    } else {
        header.querySelector('#enabled-label').textContent = 'Inativa';
    }

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
        // body.querySelector('#swpusa').textContent = estado.swpusa + 'GB';
        // body.querySelector('#swpliv').textContent = (estado.swptot - estado.swpusa).toFixed(2) + 'GB';
    
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

