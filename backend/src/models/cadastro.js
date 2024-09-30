import prisma from '../database/database.js'

async function cadastraMaquina(infos) {

    const ip = infos['ip'];
    const alias = infos['nome'];
    const so = infos['so'];

    const maquinaCadastrada = await prisma.maquina_cadastro.create({
        data: { ip, alias, so, 'situacao': 'A'},
    })

    await prisma.maquina_status.create({
        data: {}
    });

    return maquinaCadastrada;
}

async function mostraCadastros(id) {

    let maquinas = [];

    if (id) {
        maquinas.push(await prisma.maquina_cadastro.findUnique({
            where: {
                id: parseInt(id),
            },
        }))
    } else {
        maquinas.push(await prisma.maquina_cadastro.findMany())
    }

    return maquinas;
}

async function inativaMaquina(id) {
    const situacaoAtual = await prisma.maquina_cadastro.findUnique({
        where: {
            id: parseInt(id),
        },
    })

    let novaSituacao;

    if (situacaoAtual['situacao'] === 'A') {
        novaSituacao = 'I'
    } else {
        novaSituacao = 'D'
    }

    const maquinaAtualizada = await prisma.maquina_cadastro.update({
        where: {
            id: parseInt(id),
        },
        data: {
            situacao: novaSituacao
        },
    });

    return maquinaAtualizada;
}

async function desativaMaquinas() {
    // Utilizado quando inicia a API para inativar todas as máquinas que ficaram com conexão pendente

    const maquinasDesativadas = await prisma.maquina_cadastro.updateMany({
        where: {
            situacao: 'A',
        },
        data : {
            situacao: 'I',
        }
    })

    return maquinasDesativadas;
}
export default { cadastraMaquina, inativaMaquina, mostraCadastros, desativaMaquinas };