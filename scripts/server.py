import threading
import socket
from subprocess import check_output
import re
from os import remove
import sqlite3


SERVER_IP = str(check_output('hostname -I | cut -d" " -f1', shell=True).decode('utf8')).splitlines()[0]
PORT = 59000

server = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
server.bind((SERVER_IP,PORT))
server.listen()
clients = []



# Database functions
def generate_database():
    '''
    Gera o banco de dados, removendo-o primeiramente caso já exista.
    '''
    # remove os dados do banco, zerando ele
    try:
        remove('../database/main_database.db')
    except:
        print('Database empty')

    # conecta ao banco, criando se não existe
    conn = sqlite3.connect('../database/main_database.db')

    # gera o cursor
    cursor = conn.cursor()

    # gera tabela de cadastro de máquinas
    cursor.execute('''
CREATE TABLE IF NOT EXISTS MAQUINA_CADASTRO (
                   id INTEGER PRIMARY KEY,
                   ip VARCHAR(15) DEFAULT NULL,
                   alias VARCHAR(255) DEFAULT NULL,
                   situacao VARCHAR(1) DEFAULT I
)''')
    
    # gera tabela de status da máquina
    cursor.execute('''
CREATE TABLE IF NOT EXISTS MAQUINA_STATUS (
                   id INTEGER PRIMARY KEY,
                   cpu_usage_geral REAL DEFAULT 0,
                   cpu_usage_detail VARCHAR(255) DEFAULT 0,
                   memory_usage REAL DEFAULT 0,
                   FOREIGN KEY (id) REFERENCES MAQUINA_CADASTRO(id)
)''')

    # envia para o banco as alterações
    conn.commit()

    conn.close()


# Cadastra máquina no banco
def cadastrar_maquina(ip_add:'str',alias:'str'):
    '''
    Insere a máquina no banco de dados.
    '''
    conn = sqlite3.connect('../database/main_database.db')
    cursor = conn.cursor()

    try:
        # Inicia a trasação
        conn.execute('BEGIN TRANSACTION')

        cursor.execute('INSERT INTO MAQUINA_CADASTRO (ip, alias, situacao) VALUES (?, ?, ?)', (ip_add, alias, 'A'))
        id = cursor.lastrowid

        cursor.execute('INSERT INTO MAQUINA_STATUS (id) VALUES (?)', (id,))

        # conclui a 
        conn.execute('COMMIT')

    except Exception as e:
        conn.execute('ROLLBACK')
        raise e

    conn.close()


# Atualiza informações da máquina no banco 
def atualizar_status(id:'int',cpu_t:'float',cpu_d:'str',mem:'float'):
    '''
    Realiza a atualização das informações das máquinas na tabela de status.
    '''
    conn = sqlite3.connect('../database/main_database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM MAQUINA_CADASTRO WHERE id = ? AND situacao = 'A'",(id,))
    
    if cursor.fetchall() != []:
        cursor.execute("UPDATE MAQUINA_STATUS SET cpu_usage_geral = ?, cpu_usage_detail = ?, memory_usage = ? WHERE id = ?",
                    (cpu_t,cpu_d,mem,id))
        conn.commit()
    else: 
        print(f'A máquina de id {id} está inativa!')

    conn.close()


# Desativa a máquina
def desativar_maquina(id:'int'):
    '''
    Desativa a máquina, alterando sua situação para "I".
    '''
    conn = sqlite3.connect('../database/main_database.db')
    cursor = conn.cursor()

    cursor.execute('UPDATE MAQUINA_CADASTRO SET situacao = ? WHERE id = ?',
                    ('I',id))
    
    conn.commit()
    conn.close()



# Server functions

# Trata mensagem do cliente
def recieve_from_client(message:'str',client):
    '''
    Recebe a mensagem do cliente com os status atuais e manda-os para o banco. 
    '''
    index = clients.index(client)+1

    cpu_t = float(re.split(r'\|',message)[0])
    cpu_d = str(re.split(r'\|',message)[1])
    mem = float(re.split(r'\|',message)[2])

    atualizar_status(index,cpu_t,cpu_d,mem)


# Trata a conexão do cliente
def handle_client(client):
    '''
    Trata a conexão do cliente, verificando se ele mandou uma mensagem vazia,
    caso verdadeiro ele inativa o cliente no banco e desconecta ele.
    '''
    while True:
        try:
            message = str(client.recv(1024).decode('utf-8'))
            if len(message) == 0:
                index = clients.index(client)+1
                client.close()

                desativar_maquina(index)

                ''' # pode ser necessário
                all_aliases = '|'.join([str(alias) for alias in aliases])
                file = open('../machines/aliases.txt','w')
                file.write(all_aliases)
                file.close()
                '''

                print(f'{client} disconnected...')

                break 
            else:
                
                recieve_from_client(message,client)
    
        except:
            index = clients.index(client)+1
            client.close()
            desativar_maquina(index)
            break 
        
def receive():
    '''
    Recebe a conexão inicial do cliente, criando seu cadastro no banco.
    '''
    while True:
        client, address = server.accept()
        print(f'Connection is established with {str(address[0])}')
        client.send('alias?'.encode('utf-8'))
        alias = client.recv(1024).decode('utf-8')
        #aliases.append(alias)
        clients.append(client)

        cadastrar_maquina(str(address[0]),alias)

        # file = open(f'../machines/{alias}.log','w')
        # file.write(f'Connection is established with {alias} with {str(address)} address\n\n')
        # file.close()
        

        ''' # talvez seja necessário
        all_aliases = '|'.join([str(alias) for alias in aliases])
        file = open('../machines/aliases.txt','w')
        file.write(all_aliases)
        file.close()
        '''

        client.send('Connected'.encode('utf-8'))
        thread = threading.Thread(target= handle_client, args=(client,))
        thread.start()


if __name__ == "__main__":
    generate_database()
    receive()
