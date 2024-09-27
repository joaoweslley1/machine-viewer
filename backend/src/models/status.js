import prisma from '../database/database.js'

async function consultaStatus(id) {
    
    let maquinas = [];

    if (id) {
        maquinas.push(await prisma.maquina_status.findUnique({
            where: {
                id_cad: parseInt(id)
            }
        }))
    } else {
        maquinas.push(await prisma.maquina_status.findMany())
    }

    return maquinas;
}



async function atualizarStatus(id, infos) {
    const cputot = parseFloat(infos['cputot']);
    const cpudet = infos['cpudet'];
    const cputmp = parseFloat(infos['cputmp']);
    const memtot = parseFloat(infos['memtot']);
    const memusa = parseFloat(infos['memusa']);
    const swptot = parseFloat(infos['swptot']);
    const swpusa = parseFloat(infos['swpusa']);
    const dsktmp = parseFloat(infos['dsktmp']);
    const dsktot = parseFloat(infos['dsktot']);
    const dskusa = parseFloat(infos['dskusa']);

    const maquinaAtualizada = await prisma.maquina_status.update({
        where: {
            id_cad: parseInt(id),
        },
        data: {
            cputot : cputot,
            cpudet : cpudet,
            cputmp : cputmp,
            memtot : memtot,
            memusa : memusa,
            swptot : swptot,
            swpusa : swpusa,
            dsktmp : dsktmp,
            dsktot : dsktot,
            dskusa : dskusa,
        },
    });

    return maquinaAtualizada;
}

// async function atualizarStatus(id, infos) {

//     const db = await Database.connect();

//     const cputot = infos['cputot'];
//     const cpudet = infos['cpudet'];
//     const cputmp = infos['cputmp'];
//     const memtot = infos['memtot'];
//     const memusa = infos['memusa'];
//     const swptot = infos['swptot'];
//     const swpusa = infos['swpusa'];
//     const dsktmp = infos['dsktmp'];
//     const dsktot = infos['dsktot'];
//     const dskusa = infos['dskusa'];

//     const atualizarStatusSql = `
//     UPDATE maquina_status SET
//         cputot = ?, 
//         cpudet = ?, 
//         cputmp = ?,
//         memtot = ?,
//         memusa = ?,
//         swptot = ?,
//         swpusa = ?,
//         dsktmp = ?,
//         dsktot = ?,
//         dskusa = ?
//     WHERE id = ?
//     `;

//     const result = await db.run(atualizarStatusSql, [cputot,cpudet,cputmp,memtot,memusa,swptot,swpusa,dsktmp,dsktot,dskusa,id]);

//     db.close();

//     return [0, result]
// }


export default { atualizarStatus, consultaStatus };