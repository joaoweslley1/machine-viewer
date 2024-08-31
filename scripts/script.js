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
    // .then(response => response.json())
    // .then(result => {
    //     console.log(result);
    // })
    .catch(error => {
        console.error('Error:', error);
    });

    // console.log(response);
    const data = await response.json();
    // console.log(data)
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
    nameLink.href = 'pages/detailing.html';
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
        //row.cells[1].textContent = filteredCadastro[i].nome;
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

    // console.log('FOI');

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
    // console.log('FOI!')
    const cpuMedData = estado.cputot;
    const cpuDetData = estado.cpudet.split(';');

    const elements = [];

    const cpuMed = _generateBar('MED', cpuMedData, true);
    elements.push(cpuMed, document.createElement('br'));

    for (let i = 0; i < cpuDetData.length; i++) {
        const row = _generateBar(`Core ${i}`, cpuDetData[i]);
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
    memRow.appendChild(_generateColum('USADO', memUsa + 'GB'));
    memRow.appendChild(_generateColum('LIVRE', memLiv + 'GB'));
    
    const swpRow = document.createElement('div');
    swpRow.style.display = 'flex';
    swpRow.style.justifyContent = 'space-evenly';

    swpRow.appendChild(_generateColum('TOTAL', swpTot + 'GB'));
    swpRow.appendChild(_generateColum('USADO', swpUsa + 'GB'));
    swpRow.appendChild(_generateColum('LIVRE', swpLiv + 'GB'));
    

    elements.push(_generateBar('MEM', (memUsa * 100 / memTot).toFixed(1), true));
    elements.push(memRow);
    elements.push(document.createElement('hr'))
    elements.push(_generateBar('SWAP', (swpUsa * 100 / swpTot).toFixed(1), true));
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
        type: 'pie',
        data: {
            labels: ['Usado', 'Disponível'],
            datasets: [{
                label: 'Armazenamento',
                data: [dskUsa, dskLiv],
                backgroundColor: ['red', 'green'],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
        }
    });

    holder.appendChild(chartCanvas)

    const diskRow = document.createElement('div');
    diskRow.style.display = 'flex';
    diskRow.style.justifyContent = 'space-evenly';

    diskRow.appendChild(_generateColum('TOTAL', dskTot + 'GB'));
    diskRow.appendChild(_generateColum('USADO', dskUsa + 'GB'));
    diskRow.appendChild(_generateColum('LIVRE', dskLiv + 'GB'));

    elements.push(holder, document.createElement('hr'), diskRow);
    // elements.push()
    return elements;
}

function _generateBar(label, percentage, med = false) {
    // console.log('FOI!!')
    const actualProgress = percentage;

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '20px';

    const labelInfo = document.createElement('b');
    labelInfo.classList.add('my-auto');
    labelInfo.textContent = label;

    const progressBar = document.createElement('div');
    progressBar.classList.add('progress', 'my-auto');

    const progress = document.createElement('div');
    progress.classList.add('progress-bar');
    progress.style.width = progress.textContent = actualProgress + '%';

    if (med) {
        progressBar.style.width = '90%';
    } else {
        row.style.justifyContent = 'end';
        row.style.paddingTop = '10px';
        progressBar.style.width = '80%';
    }

    progressBar.appendChild(progress);
    row.appendChild(labelInfo);
    row.appendChild(progressBar);

    return row;
}

function _generateColum(labelContent, valueContent) {
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

    column.appendChild(value);
    column.appendChild(bar);
    column.appendChild(label);

    return column;
}