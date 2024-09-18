import express from 'express';
import cadastro from './models/cadastro.js';
import status from './models/status.js';

const router = express.Router();


// CREATE
router.post('/maquinas', async (req, res) => {
    const ipAddress = req.ip.match(/\b(\d{1,3}\.){3}\d{1,3}\b/)[0];
    const data = req.body;

    data['ip'] = ipAddress;

    const result = await cadastro.cadastraMaquina(data);

    if (result[0] == 0) {
        data['id'] = result[1];
        res.status(201).json(data);
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

    if (id != undefined && data != undefined) {
        const result = await status.atualizarStatus(id, data);
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

export default router;