import prisma from "../database/database.js";
import bcrypt from "bcrypt";

const saltRounds = Number(process.env.BCRYPT_SALT);

async function cadastraUsuario(infos) {
    const nome =  infos['nome'];
    const username =  infos['username'];
    const email = infos['email'];
    const senha = infos['senha'];
    let id_grupo = infos['id_grupo'];

    const senha_encriptada = await bcrypt.hash(senha, saltRounds);

    if (!id_grupo) {
        id_grupo = "2";
    }

    const usuarioCriado = await prisma.usuarios.create({
        
        data: {
            nome: nome,
            username: username,
            email: email,
            senha: senha_encriptada,
            id_grupo: parseInt(id_grupo),
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

async function pesquisaUsuario(email, username) {

    if (email) {
        const usuario = await prisma.usuarios.findMany({
            where: {
                email: email,
            },
        });

        return usuario[0];

    } else if (username) {
        const usuario = await prisma.usuarios.findMany({
            where: {
                username: username,
            },
        });
        
        return usuario[0];
    } else {
        return 0;
    }

}

export default { cadastraUsuario, mostraUsuario, removeUsuario, pesquisaUsuario };