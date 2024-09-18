from flask import Flask, jsonify, request
from flask_cors import CORS
from os import remove, path, mkdir
import threading
import time
# from models import maquinas as mq
import models.cadastro as cd
import models.status as st
import database.load as load

# constantes
PORT : int  = 5900
TIMEOUT : int = 10

# configurações do servidor
server_ip : str = ''
clients : list = []

# variavel para controle de cliente
last_update : dict = {}

# configurações do Flask
app = Flask(__name__)
CORS(app)

# database_path = '../../database/database.db'
configs_path = '../../configs/ip_addrs'

@app.route('/maquinas', methods=['POST'])
def maquina_cadastro():

    ip_add = request.remote_addr

    data = request.get_json()
    data['ip'] = ip_add

    # response = mq.cadastra_maquina(data)
    response = cd.cadastra_maquina(data)

    if response == 0:
        clients.append(ip_add)

        id = len(clients)
        
        last_update[id] = time.time()
        
        return jsonify({'id': id, 'response': 'Maquina cadastrada!'}), 201
    else:
        return jsonify(response), 400


@app.route('/maquinas', methods=['GET'])
def maquinas_status():

    id = request.args.get('id')

    response = []
    response.append(cadastro = cd.exibe_maquinas(id))
    response.append(status = st.busca_status(id))

    if type(response) != str:
        return jsonify(response),200
    else:
        return jsonify(response),500


@app.route('/maquinas/<int:id>', methods=['GET','PUT','DELETE'])
def maquina_status(id):
    if request.method == 'GET':
        response = []
        response.append(cadastro = cd.exibe_maquinas(id))
        response.append(status = st.busca_status(id))
        
        if type(response) != str:
            return jsonify(response),200
        else:
            return jsonify(response),500
        
    elif request.method == 'PUT':

        data = request.get_json()
        # response = mq.atualiza_maquina(id, data)
        response = st.atualiza_maquina(id, data)

        if type(response) != str:
            if response[0] == 0:
                last_update[id] = time.time()
                return jsonify(response[1]),200
            else:
                return jsonify(response[1]),400
        else:
            return jsonify(response),500

    elif request.method == 'DELETE':
        
        # response = mq.inativa_maquina(id)
        response = cd.inativa_maquina(id)

        if type(response) != str:
            if response[0] == 0:
                return jsonify(response[1]),200
            else:
                return jsonify(response[1]),400
        else:
            return jsonify(response),500



def monitor_inactivity():
    '''
    Verifica inatividade das máquinas;
    '''
    while True:
        current_time = time.time()
        for client_id, last_time in list(last_update.items()):
            if last_update[client_id] != 'I':
                if current_time - last_time > TIMEOUT:
                    print(f'Cliente {client_id} atingiu o timeout. Desconectando...')
                    cd.inativa_maquina(client_id)
                    last_update[client_id] = 'I'
        time.sleep(15)


def load_api():
    # if not path.exists('/'.join(database_path.split('/')[:3]) + '/'):
    #     mkdir('/'.join(database_path.split('/')[:3]) + '/')

    load.load_database()

    id = cd.ultimo_id()
    # print(id)
    inativos = (id) if id != None else 0

    for i in range(inativos):
        clients.append(i)
        last_update[i] = 'I'


if __name__ == '__main__':
    
    load_api()

    monitor_thread = threading.Thread(target=monitor_inactivity, daemon=True)
    monitor_thread.start()

    if server_ip == '':
        server_ip = input('Insira o endereço IP do servidor: ')
    
    file = open('../../configs/ip_addrs','w')
    file.write(server_ip)
    file.close()

    
    app.run(debug=False, host=server_ip, port=PORT)