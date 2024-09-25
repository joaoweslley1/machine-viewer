import prisma from "../database/database.js";

async function cadastraGrupo({nome}) {
    
    const grupoCriado = await prisma.grupos.create({
        data: {nome: nome}
    })

    return grupoCriado;
}

async function mostraGrupos(id) {
    
    let grupos = []

    if (id) {
        grupos.push(await prisma.grupos.findUnique({
            where: {
                id: parseInt(id),
            },
        }))
    } else {
        grupos.push(await prisma.grupos.findMany())
    }

    return grupos;
}

export default { cadastraGrupo, mostraGrupos };
