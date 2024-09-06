from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from os import remove, path, mkdir
import threading
import time

# constantes
PORT : int  = 5000
TIMEOUT : int = 10

# configurações do servidor
server_ip : str = ''
clients : list = []

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
def get_all_device_status():

    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e


    cursor = conn.cursor()

    cursor.execute("SELECT * FROM maquina_cadastro")
    cadastro_list = cursor.fetchall()

    cadastro = []
    
    for c in cadastro_list:
        cadastro.append({
            'id' : c[0],
            'ip' : c[1],
            'nome' : c[2],
            'estado' : c[3],
            'so': c[4],
            'exibir': c[5]
            })

    cursor.execute("SELECT * FROM maquina_status")
    status_list = cursor.fetchall()

    status = []
    for s in status_list:
        status.append({
            'id' : s[0],
            'cputot' : s[1],
            'cpudet' : s[2],
            'cputmp' : s[3],
            'memtot': s[4],
            'memusa' : s[5],
            'swptot' : s[6],
            'swpusa' : s[7],
            'dsktot' : s[8],
            'dskusa' : s[9],
            'dsktmp' : s[10],
        })
    conn.close()

    return jsonify(cadastro,status)



@app.route('/api/maquina_especifica', methods=['POST'])
def get_device_status():

    conn = sqlite3.connect('../database/main_database.db')

    data = request.get_json()
    id = data['id']
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM maquina_cadastro WHERE id = ?", (int(id),))
    cadastro_list = cursor.fetchall()

    cadastro = []
    
    for c in cadastro_list:
        cadastro.append({
            'id' : c[0],
            'ip' : c[1],
            'nome' : c[2],
            'estado' : c[3],
            'so': c[4],
            'exibir': c[5]
            })

    cursor.execute("SELECT * FROM maquina_status WHERE id = ?", (int(id),))
    status_list = cursor.fetchall()

    status = []
    for s in status_list:
        status.append({
            'id' : s[0],
            'cputot' : s[1],
            'cpudet' : s[2],
            'cputmp' : s[3],
            'memtot': s[4],
            'memusa' : s[5],
            'swptot' : s[6],
            'swpusa' : s[7],
            'dsktot' : s[8],
            'dskusa' : s[9],
            'dsktmp' : s[10],
        })
    conn.close()

    print(id, cadastro, status)
    return jsonify(cadastro, status),200



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
        so = data['so']
        cursor = conn.cursor()

        # conn.execute('BEGIN TRANSACTION')
        cursor.execute('''
                       INSERT INTO maquina_cadastro (
                        ip, 
                        alias, 
                        situacao,
                        so
                       ) 
                       VALUES (?, ?, ?, ?)
                       ''', 
                       (ip, nome, 'A', so))
        id = cursor.lastrowid

        cursor.execute('INSERT INTO maquina_status (id) VALUES (?)', (id,))

        conn.commit()
        conn.close()

        last_update[len(clients)] = time.time()

        return jsonify({'message': f'Usuário {nome} adicionado com sucesso!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400



# responsável por atualizar as informações no banco
@app.route('/api/update_status', methods=['POST'])
def update_device_status():
    
    data = request.get_json()
    client_ip = request.remote_addr
    index = -1

    # verifica se o cliente está ativo
    for i, ip in enumerate(clients):
        if ip == client_ip:
            if check_device_status(i+1) == 'A':
                index = i+1

    if index != -1:

        last_update[index] = time.time()

        atualizar_status(
            index,
            data
        )

        if check_device_status(index) == 'A':
            return jsonify({'message': f'Atualizado com sucesso!'}), 201
        else:
            return jsonify({'message': f'Máquina desconectada.'}), 501
    
    else:
        return jsonify({'Não há maquina.'}), 502



@app.route('/api/desconectar_maquina', methods=['POST'])
def desconectar_maquina():

    data = request.get_json()
    id = data['id']
    desativar_maquina(int(id))
    desconectar_maquina(int(id))
    return jsonify({'message': f'Máquina {id} desativada'}), 202


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
                situacao VARCHAR(1) DEFAULT I,
                so VARCHAR(255),
                exibir VARCHAR(1) DEFAULT S)
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


def monitor_inactivity():
    '''
    Verifica inatividade das máquinas
    '''
    while True:
        current_time = time.time()
        for client_id, last_time in list(last_update.items()):
            if last_update[client_id] != 'I':
                if current_time - last_time > TIMEOUT:
                    print(f'Cliente {client_id} atingiu o timeout. Desconectando...')
                    desativar_maquina(client_id)
                    last_update[client_id] = 'I'
        time.sleep(15)


def atualizar_status(id, infos: 'dict'):
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

    if cursor.fetchall() != []:
        cursor.execute('''
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
                    ''',
                       (infos['cputot'],
                        infos['cpudet'],
                        infos['cputmp'],
                        infos['memtot'],
                        infos['memusa'],
                        infos['swptot'],
                        infos['swpusa'],
                        infos['dsktmp'],
                        infos['dsktot'],
                        infos['dskusa'],
                        id))
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


def desconectar_maquina(id: 'int'):
    try:
        conn = sqlite3.connect('../database/main_database.db')
    except Exception as e:
        print('Erro ocorrido! Você tentou acessar a pasta "scripts/"?')
        raise e

    cursor = conn.cursor()

    cursor.execute('UPDATE maquina_cadastro SET exibir = ? WHERE id = ?',
                   ('N',id))
    
    conn.commit()
    conn.close()

def check_device_status(id : 'int'):

    conn = sqlite3.connect('../database/main_database.db')
    cursor = conn.cursor()

    cursor.execute('SELECT situacao FROM maquina_cadastro WHERE id = ?',(id,))
    
    status = cursor.fetchall()

    conn.close()

    # print(f'check_device_status{id}: {status[0][0]}')

    if status != []:
        return status[0][0]


#####################################################################################################
# FIM DAS FUNÇÕES DO BANCO
#####################################################################################################

def load_api():
    if not path.exists('../configs/'):
        mkdir('../configs/')
    
    if not path.exists('../database/'):
        mkdir('../database/')

    generate_database()

if __name__ == '__main__':
    
    load_api()

    monitor_thread = threading.Thread(target=monitor_inactivity, daemon=True)
    monitor_thread.start()

    if server_ip == '':
        server_ip = input('Insira o endereço IP do servidor: ')
        # server_ip = '192.168.100.25'
        file = open('../configs/ip_addrs','w')
        file.write(server_ip)
        file.close()

    
    app.run(debug=False, host=server_ip)