
export const geraSpan = function (string,stringId = null){


    // gera os textos
    const span = document.createElement('span');
    span.textContent = string;

    // dá um id ao span se for passado algum id
    if (stringId != null) {
        span.id = stringId;
    }

    return span;
}


export const geraBar = function (value,stringId){
    // garantindo que o valor será um Float
    var usage = parseFloat(value);

    // criando a barra
    const bar = document.createElement('div');
    bar.classList.add('bar');
    
    // criando o texto da barra
    bar.appendChild(geraSpan(value+'%',stringId));
    
    // criando o progresso da barra
    const progress = document.createElement('div');
    progress.classList.add('progress');
    progress.id = stringId + 'Bar';

    // definindo sua %
    progress.style.width = usage + '%';

    // definindo sua cor
    progress.style.backgroundColor = defineProgressColor(usage)

    // adicionando o progresso à barra
    bar.appendChild(progress);

    return bar;
}


export const updateBar = function (value,stringId) {
    var usage = parseFloat(value);
    
    const progress = document.getElementById(stringId+'Bar');
    progress.style.width = usage + '%';

    progress.style.backgroundColor = defineProgressColor(usage);

    const span = document.getElementById(stringId);
    span.textContent = value+'%';
}


export const defineProgressColor = function (usage) {
    if (usage < 31) {
        return 'greenyellow';
    } else if (usage < 76) {
        return 'yellow';
    } else {
        return 'red';
    }
}


window.onclick = function(event) {

    const modal = document.getElementById('modalMain');
    const modalContent = document.getElementById('modalContent');
    const detailing = document.getElementById('detailing');

    if (event.target == modal) {
        detailing.replaceChildren();
        modal.style.display = 'none';
        modalContent.replaceChildren();
    }
}


export const geraDetailing = function (id,alias,cpuD,mem) {

    
    // cria o card de detalhamento
    const detailingCard = document.createElement('div');
    detailingCard.classList.add('detailing-card');
    detailingCard.id = 'detailing';
    
    // cria o header do card
    const header = document.createElement('div');
    header.classList.add('header');
    
    // adiciona o nome da máquina ao header
    header.appendChild(geraSpan(alias));
    
    // adicionando o header ao card
    detailingCard.appendChild(header);
    
    // cria parte da CPU
    const cpuHolder = document.createElement('div');
    cpuHolder.classList.add('holder');
    
    cpuHolder.appendChild(geraSpan('CPU'));
    
    // cria uma variável de controle
    var containers = [];
    // divide os dados brutos
    var cpuDetails = cpuD.split(';');
    // variável de cntrole
    var i = 0;
    
    //
    cpuDetails.forEach((core) => {


        const container = document.createElement('div');
        container.classList.add('container');

        container.appendChild(geraSpan('CPU-' + i));

        container.appendChild(geraBar(core,'detailcpu' + i));

        // container.appendChild(geraSpan(core + '%'));

        containers.push(container);
        i++;
        }

    )

//
    containers.forEach((cont) => {
        cpuHolder.appendChild(cont);
    })


    // adicionando o cpuHolder no detailingCard
    detailingCard.appendChild(cpuHolder);

    // gera o memHolder
    const memHolder = document.createElement('div');
    memHolder.classList.add('holder');

    memHolder.appendChild(geraSpan('MEMÓRIA'));

    // gera o container da memória
    var container = document.createElement('div');
    container.classList.add('container');
    container.appendChild(geraSpan('MEM'));
    container.appendChild(geraBar(mem,'detailmem'));

    memHolder.appendChild(container);

    detailingCard.appendChild(memHolder);


    const modal = document.getElementById('modalMain');

    var modalContent = document.getElementById('modalContent') ;

    //modalContent.replaceChildren();

    modalContent.appendChild(detailingCard);

    modal.style.display = 'block';

}


export const updateDetailing = function (cpuD,mem){

    var cpuDetails = cpuD.split(';')

    var i = 0;

    cpuDetails.forEach((usage) => {
        updateBar(usage,'detailcpu'+i);
        i++
    })

    updateBar(mem,'detailmem')

}
