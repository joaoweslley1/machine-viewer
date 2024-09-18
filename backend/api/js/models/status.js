import Database from '../database/database.js'


async function consultaStatus(id) {

    const db = await Database.connect();

    let data; 

    if (id != undefined) {
        const consultaPorIdSql = `
            SELECT
            *
            FROM maquina_status
            WHERE id = ?
        `
        data = await db.all(consultaPorIdSql, [id,]);

    } else {
        const consultaGeralSql = `
            SELECT
            *
            FROM maquina_status
        `
        data = await db.all(consultaGeralSql);
    }

    return data;
}


async function atualizarStatus(id, infos) {

    const db = await Database.connect();

    const cputot = infos['cputot'];
    const cpudet = infos['cpudet'];
    const cputmp = infos['cputmp'];
    const memtot = infos['memtot'];
    const memusa = infos['memusa'];
    const swptot = infos['swptot'];
    const swpusa = infos['swpusa'];
    const dsktmp = infos['dsktmp'];
    const dsktot = infos['dsktot'];
    const dskusa = infos['dskusa'];

    const atualizarStatusSql = `
    UPDATE maquina_status SET
        cputot = ?, 
        cpudet = ?, 
        cputmp = ?,
        memtot = ?,
        memusa = ?,
        swptot = ?,
        swpusa = ?,
        dsktmp = ?,
        dsktot = ?,
        dskusa = ?
    WHERE id = ?
    `;

    const result = await db.run(atualizarStatusSql, [cputot,cpudet,cputmp,memtot,memusa,swptot,swpusa,dsktmp,dsktot,dskusa,id]);

    db.close();

    return [0, result]
}


export default { atualizarStatus, consultaStatus };