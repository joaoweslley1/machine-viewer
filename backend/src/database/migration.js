import Database from './database.js';

async function up() {
    const db = await Database.connect();

    const maquinaCadastroSql = `
        CREATE TABLE IF NOT EXISTS maquina_cadastro (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip VARCHAR(16),
            alias VARCHAR(100),
            situacao VARCHAR(1) DEFAULT 'I',
            so VARCHAR(255) DEFAULT NULL,
            exibir VARCHAR(1) DEFAULT S
        );
    `;

    const maquinaStatusSql = `
        CREATE TABLE IF NOT EXISTS maquina_status (
            id INTEGER PRIMARY KEY,
            cputot REAL DEFAULT 0,
            cpudet VARCHAR(255) DEFAULT 0,
            cputmp REAL DEFAULT 0,
            memtot REAL DEFAULT 0,
            memusa REAL DEFAULT 0,
            swptot REAL DEFAULT 0,
            swpusa REAL DEFAULT 0,
            dsktot REAL DEFAULT 0,
            dskusa REAL DEFAULT 0,
            dsktmp REAL DEFAULT 0,     
            FOREIGN KEY (id) REFERENCES maquina_cadastro(id)
        );
    `;

    await db.run(maquinaCadastroSql);
    await db.run(maquinaStatusSql)

    db.close()
}

async function down() {
    const db = await Database.connect();

    const maquinaCadastroSql = `
        DROP TABLE maquina_cadastro
    `;

    const maquinaStatusSql = `
        DROP TABLE maquina_status
    `

    await db.run(maquinaCadastroSql);
    await db.run(maquinaStatusSql);

    db.close()
}

export default { up, down };
