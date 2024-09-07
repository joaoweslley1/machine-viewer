import sqlite3

DATABASE_PATH = '../../database/database.db'


def cadastra_maquina(infos: 'dict'):
    '''
    Cadastra a máquina baseado nas informações enviadas.
    '''
    try:

        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        endereco_ip = infos['ip']
        alias = infos['nome']
        so = infos['so']

        cursor.execute('''
                        INSERT INTO maquina_cadastro 
                    (ip,
                    alias,
                    situacao,
                    so)
                    VALUES (?, ?, ?, ?)
                    ''',
                    (endereco_ip, alias, 'A', so))
        
        id = cursor.lastrowid # alterar para usar outro tipo de id
        cursor.execute('INSERT INTO maquina_status (id) VALUES (?)', (id,))
        conn.commit()
        conn.close()

        return 0
    
    except Exception as e:
        return f'Ocorreu um erro: {e}. Maquina nao cadastrada.'


def exibe_maquinas(id = None):
    '''
    Caso não receba um id, exibe todas as maquinas;
    Caso contrário, exibe apenas a máquina correspondente ao ID. 
    '''
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        if id == None:
            cursor.execute('SELECT * FROM maquina_cadastro')
            cadastros = cursor.fetchall()
            cursor.execute('SELECT * FROM maquina_status')
            estados = cursor.fetchall()
        else:
            cursor.execute('SELECT * FROM maquina_cadastro WHERE id = ?', (int(id),))
            cadastros = cursor.fetchall()
            cursor.execute('SELECT * FROM maquina_status WHERE id = ?', (int(id),))
            estados = cursor.fetchall()
        
        cadastro = []
        status = []

        for c in cadastros:
            cadastro.append({
                'id'    : c[0],
                'ip'    : c[1],
                'nome'  : c[2],
                'estado': c[3],
                'so'    : c[4],
                'exibir': c[5],
            })
        
        for s in estados:
            status.append({
                'id'     : s[0],
                'cputot' : s[1],
                'cpudet' : s[2],
                'cputmp' : s[3],
                'memtot' : s[4],
                'memusa' : s[5],
                'swptot' : s[6],
                'swpusa' : s[7],
                'dsktot' : s[8],
                'dskusa' : s[9],
                'dsktmp' : s[10],
            })
        conn.close()

        return [cadastro, status]
    except Exception as e:
        return f'Ocorreu um erro: {e}'


def atualiza_maquina(id, infos: 'dict'):
    '''
    Atualiza a máquina referente ao id enviado usando as infos enviadas.
    '''
    try:
        print('infos: ', infos)
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT situacao FROM maquina_cadastro WHERE id = ?', (id,))
        response = cursor.fetchall()

        if response == []:
            conn.close()
            return [1, 'Maquina desabilitada ou inexistente.']
        elif response[0][0] == 'I':
            return [1, 'Maquina desabilitada.']
        else:
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
                           ''',(
                            infos['cputot'],
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
            conn.close()
            return [0, f'Estado da máquina {id} atualizado!']
    except Exception as e:
        return f'Ocorreu um erro: {e}'


def inativa_maquina(id):
    '''
    Altera a situação da máquina para I, caso esteja como A; e
    Altera a exibicao da máquina para N, caso a situacao seja I
    '''
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT situacao FROM maquina_cadastro WHERE id = ?', (id,))

        response = cursor.fetchall()
        print(response[0][0])
        if response == []:
            conn.close()
            return [1, 'Maquina desabilitada ou inexistente.']
        elif response[0][0] == 'A':
            cursor.execute('UPDATE maquina_cadastro SET situacao = ? WHERE id = ?', ('I', id))
            conn.commit()
            conn.close()
            return [0, 'Maquina desabilitada.']
        else:
            cursor.execute('UPDATE maquina_cadastro SET exibir = ? WHERE id = ?', ('N', id))
            conn.commit()
            conn.close()
            return [0, 'Maquina removida.']
    except Exception as e:
        return f'Ocorreu um erro: {e}'


def ultimo_id():
    '''
    Pega o último id adicionado ao banco
    '''
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE maquina_cadastro SET situacao = ?', ('I',))
    conn.commit()
    
    cursor.execute('SELECT MAX(id) FROM maquina_cadastro')
    id = cursor.fetchall()[0][0]
    conn.close()

    return id