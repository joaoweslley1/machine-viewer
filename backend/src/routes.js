import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import express from 'express';
import cadastro from './models/cadastro.js';
import status from './models/status.js';
import usuarios from './models/usuarios.js';

import { isAuthenticated } from './middleware/auth.js';

const router = express.Router();


// CREATE
router.post('/maquinas', async (req, res) => {
    const ipAddress = req.ip.match(/\b(\d{1,3}\.){3}\d{1,3}\b/)[0];
    const data = req.body;

    data['ip'] = ipAddress;

    const result = await cadastro.cadastraMaquina(data);

    if (result) {
        res.status(201).json({'id' : result['id']});
    } else {
        res.status(400);
    }
})


// READ 
router.get('/maquinas/', async (req, res) => {
    const { id } = req.query;
    
    const response = [];
    response.push(await cadastro.mostraCadastros(id));
    response.push(await status.consultaStatus(id));

    res.status(200).json(response);

})

router.get('/maquinas/:id', async (req, res) => {
    const {id} = req.params;
    
    const response = [];
    response.push(await cadastro.mostraCadastros(id));
    response.push(await status.consultaStatus(id));

    res.status(200).json(response);

})


// UPDATE
router.put('/maquinas/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // console.log(data);
    if (id && data) {
        const response = await status.atualizarStatus(id, data);
        res.status(201).json({'response' : response});
    } else {
        res.status(400).json({'response' : 'Bad request'});
    }
})


// DELETE
router.delete('/maquinas/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    const maquinaInfos = await cadastro.mostraCadastros(id);

    const situacao = maquinaInfos[0]["situacao"];

    const userInfos = await usuarios.mostraUsuario(req.userId);
    const userGroup = userInfos[0]["id_grupo"];

    console.log(situacao);
    console.log(userGroup);

    if (id != undefined) {
        if (situacao === 'A' && (userGroup === 1 || userGroup === 2)) {
            const result = await cadastro.inativaMaquina(id);
            res.status(201).json({'message': 'Maquina inativada.'});

        } else if (situacao === 'I' && userGroup === 1) {
            const result = await cadastro.inativaMaquina(id);
            res.status(201).json({'message': 'Máquina removida.'});

        } else if (situacao === 'D' && userGroup === 1) {
            res.status(400).json({'message': "Máquina já removida."})

        } else {
            res.status(403).json({'message': "Usuário sem permissão para remover máquina."})
        }
    } else {
        res.status(400).json({'response' : 'Bad request'});
    }

})

// CREATE
router.post('/usuarios', async (req, res) => {
    const data = req.body;

    const result = await usuarios.cadastraUsuario(data);

    if (result['status'] === 0) {
        delete result.senha;
        res.status(201).json({'message': "Usuário cadastrado!", "response": result["message"], "status": result["status"]});
    } else {
        res.status(400).json({'message' : "Ocorreu um erro com a requisição:", "response": result["message"], "status": result["status"]});
    }
})

// UPDATE
router.put('/usuarios/', isAuthenticated, async (req, res) => {
    const data = req.body;
    const userInfos = await usuarios.mostraUsuario(req.userId);
    const match = await bcrypt.compare(data["senha"], userInfos[0]["senha"]);

    if (match) {
        await usuarios.atualizaCadastro(req.userId, data);
        res.status(201).json({'message': 'Alterações salvas'});
    } else {
        res.status(401).json({'message': 'Senha incorreta.'});
    }

})


router.get('/usuarios/', isAuthenticated, async (req, res) => {
    // const { id } = req.query;

    const response = [];

    response.push(await usuarios.mostraUsuario(req.userId));

    res.status(200).json(response);
})

router.get('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    const response = [];
    response.push(await usuarios.mostraUsuario(id));

    res.status(200).json(response);
})

router.delete('/usuarios/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    const userInfos = await usuarios.mostraUsuario(req.userId);

    const userGroup = userInfos[0]["id_grupo"];

    if (id) {
        if (userGroup == 1){
            const result = await usuarios.removeUsuario(id);    
            res.status(204).json(result);
        } else {
            res.status(403).json({'message': "Usuário sem permissão para remover usuário."})
        }

    } else {
        res.status(400).json({"response": "Bad request"});
    }
})


router.post('/singin', async(req, res) => {
    try {

        const { email, username, senha: senha_enviada } = req.body;

        const usuario = await usuarios.pesquisaUsuario(email, username);

        if (usuario != 0) {
            const { id: userId, senha: senha } = usuario;

            const match = await bcrypt.compare(senha_enviada, senha);
            
            if (match) {
                const token = jwt.sign(
                    { userId },
                    process.env.JWT_SECRET,
                    { expiresIn: 3600 }
                );

                return res.status(200).json({ auth: true, token, nome: usuario["nome"] });
            } else {
                throw new Error('User not found');
            }
        }
    } catch (error) {
        res.status(401).json({ error: 'Senha incorreta' });
    }
});

export default router;