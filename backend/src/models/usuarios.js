import prisma from "../database/database.js";

async function cadastraUsuario(infos) {
    const nome =  infos['nome'];
    const username =  infos['username'];
    const email = infos['email'];
    const senha = infos['senha'];
    const id_grupo = infos['id_grupo'];

    const usuarioCriado = await prisma.usuarios.create({
        data: {
            nome: nome,
            username: username,
            email: email,
            senha: senha,
            id_grupo: id_grupo
        },
    });

    return usuarioCriado;
}

async function mostraUsuario(id) {
    
    let usuarios = []

    if (id) {
        usuarios.push(await prisma.usuarios.findUnique({
            where: {
                id: parseInt(id),
            },
        }))
    } else {
        usuarios.push(await prisma.usuarios.findMany())
    }

    return usuarios;
}

async function removeUsuario(id) {
    
    const usuarioDeletado = await prisma.usuarios.delete({
        where: {
            id: parseInt(id),
        },
    });

    return usuarioDeletado;

}

export default { cadastraUsuario, mostraUsuario, removeUsuario };