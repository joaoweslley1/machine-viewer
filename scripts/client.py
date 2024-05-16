
import threading
import socket
from time import sleep
from random import randint
import psutil

alias = input('Choose your alias: ')
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_address = input('Input the server IP address: ')
server_port = 59000
client.connect((server_address,server_port))

def get_informations():
    """
        Get the information about the machine;
    """
    while True:

        cpu = psutil.cpu_percent(interval=1)
        cputotal = psutil.cpu_percent(interval=1,percpu=True)
        mem = psutil.virtual_memory()
        message = f"{cpu}|{';'.join([str(c) for c in cputotal])}|{mem.percent}"

        return message

def client_receive():
    while True:
        try:
            message = client.recv(1024).decode('utf-8')
            if message == 'alias?':
                client.send(alias.encode('utf-8'))
            elif len(message) == 0: 
                client.close()
                disconnect = True
                break 

            print(message)
        except:
            print('Error!')
            client.close()
            break

def client_send():
    while True:
        #sleep(3)
        message = get_informations()
        client.send(message.encode('utf-8'))


receive_thread = threading.Thread(target=client_receive)
receive_thread.start()

send_thread = threading.Thread(target=client_send)
send_thread.start()