from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from os import remove, path, mkdir, getcwd
import threading
import time

# constantes
PORT : int  = 5000
TIMEOUT : int = 30

# configurações do servidor
server_ip : str = ''
clients = []

# variavel para controle de cliente
last_update : dict = {}

# configurações do Flask
app = Flask(__name__)
CORS(app)



#########################################################################################################
# Rotas da API
#########################################################################################################


# respondável por mostrar as máquinas cadastradas no banco
@app.route('/api/devices')
def get_device_status():

    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e


    cursor = conn.cursor()

    cursor.execute("SELECT * FROM maquina_cadastro")
    # cadastro = cursor.fetchall()
    cadastro_list = cursor.fetchall()


    # print(cadastro)
    cadastro = []
    
    for c in cadastro_list:
        cadastro.append({
            'id' : c[0],
            'ip' : c[1],
            'nome' : c[2],
            'estado' : c[3]
            })

    cursor.execute("SELECT * FROM maquina_status")
    status_list = cursor.fetchall()

    status = []
    for s in status_list:
        status.append({
            'id' : s[0],
            'cput' : s[1],
            'cpud' : s[2],
            'mem' : s[3]
        })
    conn.close()

    return jsonify(cadastro,status)


# responsável por cadastrar as máquinas no banco
@app.route('/api/cadastro_maquina', methods=['POST'])
def device_register():
    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e
    
    try:
        data = request.get_json()
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

# responsável por atualizar as informações no banco
@app.route('/api/update_status', methods=['POST'])
def update_device_status():
    
    data = request.get_json()
    client_ip = request.remote_addr
    index = -1

    print(clients)
    for i, ip in enumerate(clients):
        # print(i,ip)
        if ip == client_ip:
            if check_device_status(i+1) == 'A':
                index = i+1

    if index != -1:

        last_update[index] = time.time()

        atualizar_status(
            index,
            data['cpu_total'],
            data['cpu_details'],
            data['memory']
        )

        if check_device_status(index) == 'A':
            return jsonify({'message': f'Atualizado com sucesso!'}), 201
        else:
            return jsonify({'message': f'Máquina desconectada.'}), 501
    
    else:
        return jsonify({'Não há maquina.'}), 502


#########################################################################################################
# Fim das Rotas da API
#########################################################################################################


#########################################################################################################
# funções de administração do banco
#########################################################################################################


def generate_database():
    '''
    Renova o banco de dados
    '''

    if not path.exists('../database/'):
        mkdir('../database/')

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


def monitor_inactivity():
    while True:
        current_time = time.time()
        for client_id, last_time in list(last_update.items()):
            if last_update[client_id] != 'I':
                if current_time - last_time > TIMEOUT:
                    print(f'Cliente {client_id} atingiu o timeout. Desconectando...')
                    desativar_maquina(client_id)
                    last_update[client_id] = 'I'
            time.sleep(15)
            print(last_update)


def cadastrar_maquina(ip_add:'str',alias:'str'):
    '''
    Função que cadastra a máquina no banco
    '''

    try:
        conn = sqlite3.connect('../database/main_database.db')
    except:
        conn = sqlite3.connect('database/main_database.db')
    
    cursor = conn.cursor()

    try:
        conn.execute('BEGIN TRANSACTION')

        cursor.execute('''
                       INSERT 
                        INTO maquina_cadastro 
                        (ip, alias, situacao) 
                       VALUES (?, ?, ?)
                       ''', 
                    (ip_add, alias, 'A'))
        
        id = cursor.lastrowid

        cursor.execute('INSERT INTO maquina_status (id) VALUES (?)', (id,))

        conn.execute('COMMIT')

    except Exception as e:
        conn.execute('ROLLBACK')
        raise e
    
    finally:
        conn.close()



def atualizar_status(id:'int',cpu_t:'float',cpu_d:'str',mem:'float'):
    '''
    Função que atualiza as informações do banco
    '''

    
    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e
    
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM maquina_cadastro WHERE id = ? AND situacao = 'A'",(id,))

    # print(f'cpu_t: {cpu_t}\ncpu_d: {cpu_d}\nmem: {mem}')

    if cursor.fetchall() != []:
        cursor.execute("UPDATE maquina_status SET cpu_usage_geral = ?, cpu_usage_detail = ?, memory_usage = ? WHERE id = ?",
                       (cpu_t,cpu_d,mem,id))
        conn.commit()
    else:
        print(f'A máquina de id {id} está inativa!')
    
    conn.close()

    # print(check_device_status(id))


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


def check_device_status(id : 'int'):

    conn = sqlite3.connect('../database/main_database.db')
    cursor = conn.cursor()

    cursor.execute('SELECT situacao FROM maquina_cadastro WHERE id = ?',(id,))
    
    status = cursor.fetchall()

    conn.close()

    if status != []:
        return status[0][0]


#####################################################################################################
# FIM DAS FUNÇÕES DO BANCO
#####################################################################################################


if __name__ == '__main__':
    
    generate_database()

    monitor_thread = threading.Thread(target=monitor_inactivity, daemon=True)
    monitor_thread.start()

    if server_ip == '':
        server_ip = input('Insira o endereço IP do servidor: ')
        # server_ip = '192.168.100.25'
        file = open('../configs/ip_addrs','w')
        file.write(server_ip)
        file.close()

    
    app.run(debug=False, host=server_ip)