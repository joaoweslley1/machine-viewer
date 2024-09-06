import sqlite3
from time import sleep
from os import system

database_path = '../database/database.db'

# Verifica o estado do banco, atualizando a cada 2 segundos

while True:
    system('clear')
    conn = sqlite3.connect(database_path)
    cursor = conn.cursor()

    print('Maquina Cadastro')
    print('ID, IP, NOME, ESTADO, SO, EXIBIR')
    cursor.execute('SELECT * FROM maquina_cadastro')
    rows = cursor.fetchall()

    for row in rows:
        print(row)

    print('Maquina Status')
    print('ID, CPUTOT, CPUDET, CPUTMP, MEMTOT, MEMUSA, SWPTOT, SWPUSA, DSKTOT, DSKUSA, DSKTMP')
    cursor.execute('SELECT * FROM maquina_status')
    rows = cursor.fetchall()

    for row in rows:
        print(row)

    conn.close()
    sleep(2)
