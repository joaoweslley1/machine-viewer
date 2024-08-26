import requests
import psutil
from time import sleep

alias = input('Escolha um apelido: ')
server_ip = input('Digite o endereço IP do servidor: ')
# server_ip = '192.168.100.25'
SERVER_PORT = 5000

URL = f'http://{server_ip}:{SERVER_PORT}'

def get_informations():
    """
        Get the information about the machine;
    """
    # while True:

        # cpu = psutil.cpu_percent(interval=1)
        # cputotal = psutil.cpu_percent(interval=1,percpu=True)
        # mem = psutil.virtual_memory()
        # message = f"{cpu}|{';'.join([str(c) for c in cputotal])}|{mem.percent}"
        # cpu_details = ';'.join([str(c) for c in cputotal])

    cputot = psutil.cpu_percent(interval=0)
    cpudet = ';'.join([str(c) for c in psutil.cpu_percent(interval=0,percpu=True)])
    cputmp = psutil.sensors_temperatures()["coretemp"][0][1]
    memtot = round(psutil.virtual_memory().total/(1024**3),2)
    memusa = round(psutil.virtual_memory().used/(1024**3),2)
    swptot = round(psutil.swap_memory().total/(1024**3),2)
    swpusa = round(psutil.swap_memory().used/(1024**3),2)
    dsktmp = psutil.sensors_temperatures()["nvme"][0][1] # verificar compatibilidade
    dsktot = round(psutil.disk_usage("/")[0]/(1024**3),2)
    dskusa = round(psutil.disk_usage("/")[1]/(1024**3),2)
    
    message = {
        'cputot': cputot,
        'cpudet': cpudet,
        'cputmp': cputmp,
        'memtot': memtot,
        'memusa': memusa,
        'swptot': swptot,
        'swpusa': swpusa,
        'dsktmp': dsktmp,
        'dsktot': dsktot,
        'dskusa': dskusa
    }

    # print(message)

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

            if response.status_code > 500:
                print(response.json())
                break
        
        except Exception as e:
            print(f'Ocorreu um erro: {e}')
            break


if __name__ == '__main__':

    while True:
        print(get_informations())
        sleep(1)
    # result = first_connect()

    # if result.status_code == 201:
    #     client_send()
    # else:
    #     print(result.json())