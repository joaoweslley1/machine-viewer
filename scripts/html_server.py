from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import re
from os import remove
import socket
import threading

# configurações do servidor
# SERVER_IP = input('Insira o endereço IP do servidor... ')
PORT = 5000
clients = []



# configurações do Flask
app = Flask(__name__)
CORS(app)

@app.route('/api/devices')
def get_device_status():

    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e


    cursor = conn.cursor()

    cursor.execute("SELECT * FROM maquina_cadastro")
    cadastro = cursor.fetchall()

    cursor.execute("SELECT * FROM maquina_status")
    status = cursor.fetchall()

    conn.close()

    return jsonify([cadastro,status],[])


@app.route('/api/cadastro_maquina', methods=['POST'])
def device_register():

    # print(request.remote_addr)

    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e
    
    try:
        data = request.get_json()
        # id = data['']
        ip = request.remote_addr
        clients.append(ip)
        nome = data['nome']

        cursor = conn.cursor()

        # conn.execute('BEGIN TRANSACTION')
        cursor.execute('''INSERT 
            INTO maquina_cadastro (ip, alias, situacao) VALUES (?, ?, ?)''', (ip, nome, 'A'))
        id = cursor.lastrowid

        cursor.execute('INSERT INTO maquina_status (id) VALUES (?)', (id,))

        conn.commit()
        conn.close()

        #print(request.headers['X-Forwarded-for'])
        #clients.append(request.headers['X-Forwarded-for'])

        return jsonify({'message': f'Usuário {nome} adicionado com sucesso!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/update_status', methods=['POST'])
def update_device_status():
    
    print('teste')


    data = request.get_json()

    client_ip = request.remote_addr


    index = clients.index(client_ip)+1

    print(data)

    atualizar_status(
        index,
        data['cpu_total'],
        data['cpu_details'],
        data['memory']
    )

    return jsonify({'message': f'Atualizado com sucesso!'}), 201
    # conn = sqlite3.connect('../database/main_database.db')
    # cursor = conn.cursor()

        



# funções de administração do banco
def generate_database():

    # remove os dados do banco, zerando ele
    try:
        remove('../database/main_database.db')
    except:
        print('Database empty')

    conn = sqlite3.connect('../database/main_database.db')

    cursor = conn.cursor()

    cursor.execute('''
CREATE TABLE IF NOT EXISTS maquina_cadastro (
                id INTEGER PRIMARY KEY,
                ip VARCHAR(15) DEFAULT NULL,
                alias VARCHAR(255),
                situacao VARCHAR(1) DEFAULT I
)''')


    cursor.execute('''
CREATE TABLE IF NOT EXISTS maquina_status(
                   id INTEGER PRIMARY KEY,
                   cpu_usage_geral REAL DEFAULT 0,
                   cpu_usage_detail VARCHAR(255) DEFAULT 0,
                   memory_usage REAL DEFAULT 0,
                   FOREIGN KEY (id) REFERENCES maquina_cadastro(id)
)''')

    conn.commit()

    conn.close()


def cadastrar_maquina(ip_add:'str',alias:'str'):

    try:
        conn = sqlite3.connect('../database/main_database.db')
    except:
        conn = sqlite3.connect('database/main_database.db')
    
    cursor = conn.cursor()

    try:
        conn.execute('BEGIN TRANSACTION')

        cursor.execute('INSERT INTO maquina_cadastro (ip, alias, situacao) VALUES (?, ?, ?)', (ip_add, alias, 'A'))
        id = cursor.lastrowid

        cursor.execute('INSERT INTO maquina_status (id) VALUES (?)', (id,))

        conn.execute('COMMIT')

    except Exception as e:
        conn.execute('ROLLBACK')
        raise e
    
    finally:
        conn.close()


def atualizar_status(id:'int',cpu_t:'float',cpu_d:'str',mem:'float'):

    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e
    
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM maquina_cadastro WHERE id = ? AND situacao = 'A'",(id,))

    print(f'cpu_t: {cpu_t}\ncpu_d: {cpu_d}\nmem: {mem}')

    if cursor.fetchall() != []:
        cursor.execute("UPDATE maquina_status SET cpu_usage_geral = ?, cpu_usage_detail = ?, memory_usage = ? WHERE id = ?",
                       (cpu_t,cpu_d,mem,id))
        conn.commit()
    else:
        print(f'A máquina de id {id} está inativa!')
    
    conn.close()

def desativar_maquina(id:'int'):
    
    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e

    cursor = conn.cursor()

    cursor.execute('UPDATE maquina_cadastro SET situacao = ? WHERE id = ?',
                   ('I',id))
    
    conn.commit()
    conn.close()



# funções do servidor
def receber_do_cliente(message:'str',client):

    index = clients.index(client)+1

    cpu_t = float(re.split(r'\|',message)[0])
    cpu_d = str(re.split(r'\|',message)[1])
    mem = float(re.split(r'\|',message)[2])

    atualizar_status(index,cpu_t,cpu_d,mem)


def gerir_cliente(client):

    while True:
        try:
            message = str(client.recv(1024).decode('utf-8'))
            if len(message) == 0:
                index = clients.index(client)+1
                client.close()

                desativar_maquina(index)

                print(f'{client} desconectou...')

                break
            else:
                receber_do_cliente(message,client)
        
        except:
            index = clients.index(client)+1
            client.close()
            desativar_maquina(index)
            break


def socket_server():

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((SERVER_IP,PORT))
    server.listen()

    while True:
        client, address = server.accept()
        print(f'Conexão estabelecida com {str(address[0])}')
        client.send('alias?'.encode('utf-8'))
        alias = client.recv(1024).decode('utf-8')
        clients.append(client)
        
        cadastrar_maquina(str(address[0]),alias)

        client.send('Conectado!'.encode('utf-8'))
        thread = threading.Thread(target=gerir_cliente, args=(client,))
        thread.start()


if __name__ == '__main__':
    generate_database()
    
    app.run(debug=True)
    # flask_thread = threading.Thread(target=app.run,kwargs={'port':59001})
    # flask_thread.start()

    # socket_server()
