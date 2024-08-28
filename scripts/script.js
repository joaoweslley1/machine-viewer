async function getData(address) {
    const response = await fetch(address, {method: ['GET']});
    const data = await response.json()
    return {
        ...data,
        address : address
    };
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

    /*      TODO - Utilizar o link para acessar a página de detalhamento da máquina.
    
    const nameLink = document.createElement('a');
    nameLink.href = 'pages/detailing.html';
    nameLink.textContent = cadastro.nome;
    aliasCell.appendChild(nameLink);

    */

    aliasCell.textContent = cadastro.nome; // Desativar linha quando lógica de acesso à página de detalhamento for adicionada
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
    // console.log(`http://${ipAddress}/api/desconectar_maquina`);
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