import sqlite3
from os import remove

DATABASE_PATH = 'db.sqlite'

def generate_database():
    '''
    Reseta o banco de dados
    '''
    try:
        remove(DATABASE_PATH)
    except:
        print('Database empty')

    conn = sqlite3.connect(DATABASE_PATH)

    cursor = conn.cursor()

    cursor.execute('''
            CREATE TABLE IF NOT EXISTS maquina_cadastro (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip VARCHAR(16),
                alias VARCHAR(100),
                situacao VARCHAR(1) DEFAULT 'I',
                so VARCHAR(255) DEFAULT NULL,
                exibir VARCHAR(1) DEFAULT S
            );
            ''')


    cursor.execute('''
                CREATE TABLE IF NOT EXISTS maquina_status(
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
)''')

    conn.commit()

    conn.close()

if __name__ == '__main__':
    generate_database()