import requests
import psutil
from time import sleep

alias = input('Escolha um apelido: ')
server_ip = input('Digite o endereço IP do servidor: ')
# server_ip = '172.16.0.87'
SERVER_PORT = 5000

URL = f'http://{server_ip}:{SERVER_PORT}'

def get_informations():
    """
        Get the information about the machine;
    """
    while True:

        cpu = psutil.cpu_percent(interval=1)
        cputotal = psutil.cpu_percent(interval=1,percpu=True)
        mem = psutil.virtual_memory()
        # message = f"{cpu}|{';'.join([str(c) for c in cputotal])}|{mem.percent}"
        cpu_details = ';'.join([str(c) for c in cputotal])
        
        message = {
            'cpu_total': cpu,
            'cpu_details': cpu_details,
            'memory' : mem.percent
        }

        return message



def first_connect():
    try:
        message = {
            'nome' : alias
        }

        response = requests.post(f'{URL}/api/cadastro_maquina', json=message)
        return response
    except Exception as e:
        return f'Ocorreu um erro: {e}'


def client_send():
    while True:
        sleep(1)
        try:
            message = get_informations()
            response = requests.post(f'{URL}/api/update_status', json=message)

            if response.status_code == 501:
                print(response.json())
                break
        
        except Exception as e:
            print(f'Ocorreu um erro: {e}')
            break


if __name__ == '__main__':

    result = first_connect()

    if result.status_code == 201:
        client_send()
    else:
        print(result.json())