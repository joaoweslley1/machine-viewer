import Database from '../database/database.js'

async function cadastraMaquina(infos) {

    const db = await Database.connect();

    const enderecoIp = infos['ip'];
    const alias = infos['nome'];
    const so = infos['so'];

    const cadastroSql = `
        INSERT INTO maquina_cadastro (
            ip,
            alias,
            situacao,
            so
        ) VALUES (
            ?,
            ?,
            ?,
            ?
        )
    `;

    const statusSql = `
        INSERT INTO maquina_status (
            id
        ) VALUES (
            ?
        )
    `

    await db.run(cadastroSql, [enderecoIp, alias, 'A', so]);

    const lastIdData = await db.run('SELECT MAX(id) FROM maquina_cadastro')
    
    
    const lastId = lastIdData['lastID']

    await db.run(statusSql, [lastId]);

    db.close();

    return [0, lastId];
}

async function inativaMaquina(id) {

    const db = await Database.connect();

    const estadoMaquina = `
        SELECT situacao FROM maquina_cadastro WHERE id = ?
    `

    const atualizaAtividade = `
        UPDATE maquina_cadastro SET situacao = 'I' WHERE ID = ?
    `

    const estado = await db.all(estadoMaquina, [id,]);

    if (estado[0]['situacao']  == 'A') {
        await db.run(atualizaAtividade, [id,])
    }

    db.close();

    return 0;
}

async function mostraCadastros(id) {

    const db = await Database.connect();

    let data;

    if (id != undefined) {
        const consultaPorIdSql = `
            SELECT * FROM maquina_cadastro WHERE id = ?
        `
        data = await db.all(consultaPorIdSql, [id,])
    } else {
        const consultaGeralSql = `
            SELECT * FROM maquina_cadastro
        `
        data = await db.all(consultaGeralSql)
    }

    return data;
}
export default { cadastraMaquina, inativaMaquina, mostraCadastros };