import database.database as db

def atualiza_maquina(id, infos: 'dict'):
    '''
    Atualiza a máquina na tabela de status baseado nas informações enviadas. 
    '''

    try:
        conn = db.connect()
        cursor = conn.cursor()

        BUSCA_SITUACAO = '''
            SELECT situacao FROM maquina_cadastro WHERE id = ?
        '''

        cursor.execute(BUSCA_SITUACAO, (id,))
        situacao = cursor.fetchall()

        if situacao == []:
            conn.close()
            return [1, 'Maquina desabilitada ou inexistente.']
        elif situacao[0][0] != 'A':
            return [1, 'Maquina desabilitada.']
        else:

            ATUALIZAR_STATUS = '''
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
            '''

            cursor.execute(ATUALIZAR_STATUS, (
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
                id 
            ))

            conn.commit()
            conn.close()
            return [0, f'Status da máquina {id} atualizado.']
    
    except Exception as e:
        return f'Ocorreu um erro: {e}.'
    
def busca_status(id = None):
    try:
        conn = db.connect()
        cursor = conn.cursor()

        if id == None:
            CONSULTA_GERAL = '''
                SELECT * FROM maquina_status
            '''

            cursor.execute(CONSULTA_GERAL)
            status = cursor.fetchall()
        else:
            CONSULTA_ESPECIFICA = '''
                SELECT * FROM maquina_status WHERE id = ?
            '''

            cursor.execute(CONSULTA_ESPECIFICA, (id,))
            status = cursor.fetchall()

        conn.close()
        stat = []
        for s in status:
            stat.append({
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
        
        return stat
    except Exception as e:
        return f'Ocorreu um erro: {e}.'