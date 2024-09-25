import express from 'express';
import cadastro from './models/cadastro.js';
import status from './models/status.js';
import usuarios from './models/usuarios.js';

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

    if (id && data) {
        const result = await status.atualizarStatus(id, data);

        console.group(result);
        
        res.status(200).json(result);
    } else {
        res.status(400).json({'response' : 'Bad request'});
    }
})


// DELETE
router.delete('/maquinas/:id', async (req, res) => {
    const { id } = req.params;

    if (id != undefined) {
        const result = await cadastro.inativaMaquina(id);
        res.status(204).json(result);
    } else {
        res.status(400).json({'response' : 'Bad request'});
    }

})


router.post('/usuarios', async (req, res) => {
    const data = req.body;

    const result = await usuarios.cadastraUsuario(data);

    if (result) {
        res.status(201).json({'message': "Usuário cadastrado!", "response": result})
    } else {
        res.status(400).json({'message' : "Ocorreu um erro com a requisição:", "response": result})
    }
})

router.get('/usuarios/', async (req, res) => {
    const { id } = req.query;

    const response = [];
    response.push(await usuarios.mostraUsuario(id));

    res.status(200).json(response);
})

router.get('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    const response = [];
    response.push(await usuarios.mostraUsuario(id));

    res.status(200).json(response);
})

// router.put('usuarios/:id', async (req, res) => {
//     const { id } = req.params;
//     const data = req.body;

//     if (id && data) {
//         const result = await usuarios.atualizarCadastro();

//         console.group(result);
        
//         res.status(200).json(result);
//     } else {
//         res.status(400).json({'response' : 'Bad request'});
//     }
// })

router.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    if (id) {
        const result = await usuarios.removeUsuario(id);
        
        res.status(204).json(result);
    } else {
        res.status(400).json({"response": "Bad request"});
    }
})

export default router;