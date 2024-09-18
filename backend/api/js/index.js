import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes.js';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let serverAddress;

rl.question('Digite o endereço IP do servidor: ', (ip) => {

    if (!ip) {
        serverAddress = '127.0.0.1'
    } else {
        serverAddress = ip;
    }

    fs.writeFile('../../configs/ip_addrs', ip, 'utf-8', (err) => {
        if (err) {
            console.error(`Erro ao alterar arquivo: ${err}`);
            return;
        }
        
        console.log('Arquivo de configuração alterado.')
    })

    const serverPort = 5900;

    const server = express();

    server.use(morgan('tiny'));

    server.use(
        cors({
            origin: '*',
            methods: 'GET,PUT,POST,DELETE',
            allowedHeaders: ['Content-Type'],
            credentials: true,
            preflightContinue: false,
        })
    );

    server.use(express.json());

    server.use(router);

    server.listen(serverPort, serverAddress, () => {
        console.log(`Server is listening on ${serverAddress}:${serverPort}`);
    });

    rl.close();
})



// export default server;