import sqlite3
from time import sleep
from os import system

while True:
    system('clear')
    conn = sqlite3.connect('database/main_database.db')
    cursor = conn.cursor()

    print('Maquina Cadastro')
    print('ID, IP, NOME, ATIVO')
    cursor.execute('SELECT * FROM MAQUINA_CADASTRO')
    rows = cursor.fetchall()

    for row in rows:
        print(row)

    print('Maquina Status')
    print('ID, CPUT, CPUD, MEM')
    cursor.execute('SELECT * FROM MAQUINA_STATUS')
    rows = cursor.fetchall()

    for row in rows:
        print(row)

    conn.close()
    sleep(2)
