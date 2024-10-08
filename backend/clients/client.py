import requests
import psutil
from time import sleep
import platform

alias = input('Escolha um apelido: ')
server_ip = input('Digite o endereço IP do servidor: ')

if alias == '':
    alias = platform.node()

if server_ip == '':
    server_ip = '127.0.0.1'

SERVER_PORT = 5900

if len(platform.system()) != 0:
    PLATAFORMA = platform.system()
else:
    PLATAFORMA = '?'

URL = f'http://{server_ip}:{SERVER_PORT}'

def get_informations():
    """
        Get the information about the machine;
    """

    try:
        cputot = psutil.cpu_percent(interval=0)
    except:
        cputot = -1.0
    try:
        cpudet = ';'.join([str(c) for c in psutil.cpu_percent(interval=0,percpu=True)])
    except:
        cpudet = '-1.0'
    try:
        cputmp = psutil.sensors_temperatures()["coretemp"][0][1]
    except:
        cputmp = -1.0
    try:
        memtot = round(psutil.virtual_memory().total/(1024**3),2)
    except:
        memtot = -1.0
    try:
        memusa = round(psutil.virtual_memory().used/(1024**3),2)
    except:
        memusa = -1.0
    try:
        swptot = round(psutil.swap_memory().total/(1024**3),2)
    except:
        swptot = -1.0
    try:
        swpusa = round(psutil.swap_memory().used/(1024**3),2)
    except:
        swpusa = -1.0
    try:
        memusa = round(psutil.virtual_memory().used/(1024**3),2)
    except:
        memusa = -1.0
    try:
        dsktmp = psutil.sensors_temperatures()["nvme"][0][1]
    except:
        dsktmp = -1.0
    try:
        dsktot = round(psutil.disk_usage("/")[0]/(1024**3),2)
    except:
        dsktot = -1.0
    try:
        dskusa = round(psutil.disk_usage("/")[1]/(1024**3),2)
    except:
        dskusa = -1.0

    message = {
        'cputot': cputot,
        'cpudet': cpudet,
        'cputmp': cputmp,
        'memtot': memtot,
        'memusa': memusa,
        'swptot': swptot,
        'swpusa': swpusa,
        'dsktot': dsktot,
        'dskusa': dskusa,
        'dsktmp': dsktmp
    }
    return message



def first_connect():
    try:
        message = {
            'nome' : alias,
            'so' : PLATAFORMA
        }

        response = requests.post(f'{URL}/maquinas', json=message)
        return response
    except Exception as e:
        return f'Ocorreu um erro: {e}'


def client_send(id):
    while True:
        sleep(1)
        try:
            message = get_informations()
            print(message)
            response = requests.put(f'{URL}/maquinas/{id}', json=message)

            if response.status_code not in [200, 201, 204]:
                print(response.json())
                break
        
        except Exception as e:
            print(f'Ocorreu um erro: {e}')
            break


if __name__ == '__main__':

    result = first_connect()
    print(result.json())
    id = result.json()['id']
    print(id)
    client_send(id)
    # if result.status_code == 201:
    #     client_send()
    # else:
    #     print(result.json())