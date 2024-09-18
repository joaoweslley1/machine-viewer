# import database.load as load
import database.database as db

def cadastra_maquina(infos : 'dict'):
    '''Cadastra a máquina baseado nas informações enviadas'''

    try:
        conn = db.connect()
        cursor = conn.cursor()
        
        CADASTRAR_MAQUINA_SQL = '''
            INSERT INTO maquina_cadastro (
                ip,
                alias,
                situacao,
                so
            ) VALUES (
                ?, ?, ?, ?
            )
        '''

        ADICIONAR_STATUS = '''
            INSERT INTO maquina_status (id) VALUES (?)
        '''

        endereco_ip, alias, so = infos['ip'], infos['alias'], infos['so']

        cursor.execute(CADASTRAR_MAQUINA_SQL, (endereco_ip, alias, 'A', so))

        id = cursor.lastrowid
        cursor.execute(ADICIONAR_STATUS, (id,))

        conn.commit()
        conn.close()

        return 0
    except Exception as e:
        return f'Ocorreu um erro: {e}. Maquina não cadastrada.'

def exibe_maquinas(id = None):
    '''
    Envia o cadastro de todas as máquinas caso não receba um id, caso contrário envia o cadastro da máquina específica
    '''

    try:
        conn = db.connect()
        cursor = conn.cursor()

        if id == None:
            CONSULTA_GERAL = '''
                SELECT * FROM maquina_cadastro
            '''

            cursor.execute(CONSULTA_GERAL)
            cadastros = cursor.fetchall()
        else:
            CONSULTA_ESPECIFICA = '''
                SELECT * FROM maquina_cadastro WHERE id = ?
            '''

            cursor.execute(CONSULTA_ESPECIFICA, (id,))
            cadastros = cursor.fetchall()
        
        conn.close()

        cadastro = []
        for c in cadastros:
            cadastro.append({
                'id'    : c[0],
                'ip'    : c[1],
                'nome'  : c[2],
                'estado': c[3],
                'so'    : c[4],
                'exibir': c[5],
            })

        return cadastro
    except Exception as e:
        return f'Ocorreu um erro: {e}.'

def inativa_maquina(id):
    '''
    Altera a situação para I, caso esteja como A e altera a exibição para N caso situacao esteja como I.
    '''

    try:
        conn = db.connect()
        cursor = conn.cursor()

        BUSCAR_SITUACAO = '''
            SELECT situacao FROM maquina_cadastro WHERE id = ?
        '''

        cursor.execute(BUSCAR_SITUACAO)
        situacao = cursor.fetchall()

        if situacao == []:
            return [1, 'Maquina desabilitada ou inexistente.']
        elif situacao[0][0] == 'A':
            ATUALIZA_SITUACAO = '''
                UPDATE maquina_cadastro SET situacao = 'I' WHERE id = ?
            '''
            cursor.execute(ATUALIZA_SITUACAO, (id,))
            conn.commit()
            conn.close()
            return [0, 'Maquina desabilitada.']
        else:
            ATUALIZA_EXIBICAO = '''
                UPDATE maquina_cadastro SET exibir = 'N' WHERE id = ?
            '''
            cursor.execute(ATUALIZA_SITUACAO, (id,))
            conn.commit()
            conn.close()
            return [0, 'Maquina removida.']

    except Exception as e:
        return f'Ocorreu um erro: {e}.'

def ultimo_id():
    try:
        conn = db.connect()
        cursor = conn.cursor()

        INATIVA_TODAS_MAQUINAS = '''
            UPDATE maquina_cadastro SET situacao = 'I'
        '''

        conn.execute(INATIVA_TODAS_MAQUINAS)
        conn.commit()

        PEGAR_ULTIMO_ID = '''
            SELECT MAX(id) FROM maquina_cadastro
        '''
        id = cursor.fetchall()
        conn.close()

        if id == []:
            return 0
        else:
            return id[0][0]

    except Exception as e:
        return f'Ocorreu um erro: {e}.'
