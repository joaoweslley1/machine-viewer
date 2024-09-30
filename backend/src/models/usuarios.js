import prisma from "../database/database.js";
import bcrypt from "bcrypt";

const saltRounds = Number(process.env.BCRYPT_SALT);

async function cadastraUsuario(infos) {
    try {const nome =  infos['nome'];
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

        return {'status': 0, 'message': usuarioCriado};
    }
    catch (e) {
        return {'status': 1, 'message': 'Ocorreu um erro.'}
    }
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

async function atualizaCadastro(id, data) {
    const nome = (data["nome"]) ? data["nome"] : null;
    const username = (data["username"]) ? data["username"] : null;
    const email = (data["email"]) ? data["email"] : null;
    const senha = (data["novaSenha"]) ? data["novaSenha"] : null;
    const senha_encriptada = (senha) ? await bcrypt.hash(senha, saltRounds) : null;


    console.log(id);
    
    if (nome) {
        await prisma.usuarios.update({
            where: {id: parseInt(id)},
            data: {nome: nome}
        })
    }
    if (username) {
        await prisma.usuarios.update({
            where: {id: parseInt(id)},
            data: {username: username}
        })
    }
    if (email) {
        await prisma.usuarios.update({
            where: {id: parseInt(id)},
            data: {email: email}
        })
    }
    if (senha) {
        await prisma.usuarios.update({
            where: {id: parseInt(id)},
            data: {senha: senha_encriptada}
        })
    }
}

export default { cadastraUsuario, atualizaCadastro, mostraUsuario, removeUsuario, pesquisaUsuario };