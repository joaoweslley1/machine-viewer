import { PrismaClient } from "@prisma/client";
import Grupo from "../models/grupos.js"
import Usuario from "../models/usuarios.js";

const prisma = new PrismaClient();

async function main() {
    await Grupo.cadastraGrupo({
        nome: "Admin",
    });
    await Grupo.cadastraGrupo({
        nome: "Usuario",
    });
    await Grupo.cadastraGrupo({
        nome: "Anonimo",
    });

    await Usuario.cadastraUsuario({
        nome: "Admin",
        username: "admin",
        email: "admin@localhost",
        senha: "admin",
        id_grupo: 1
    })

    await Usuario.cadastraUsuario({
        nome: "Anonimo",
        username: "anon",
        email: "anon@localhost",
        senha: "_",
        id_grupo: 3
    })
}

main()
    .then(async () => {
        prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
    });
    