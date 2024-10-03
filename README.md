# Machine Viewer

---

Repostório dedicado ao código do **Machine Viewer**, uma aplicação para administração e análise do status de máquinas em rede.

## Visão geral

O Machine Viewer é uma aplicação que permite a visualização do status de máquinas em rede. Utilizando uma API em express que gerencia as requisições e um cliente em Python, também disponibilizado no repositório.

## Estrutura do projeto

```bash
machine-viewer/
├── backend/
│   ├── api/
│   ├── clients/
│   ├── src/
│   └── utils/
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── lib/
│   ├── pages/
│   └── public/
├── preview.png
└── README.md
```

## Funcionamento da API

Ao executar a API, irá armazenar o endereço IP passado pelo usuário (*127.0.0.1 caso o usuário não escolha nenhum*) no arquivo de configuração `machine-viewer/backend/config/ip_addr`, esse arquivo será acessado pelo front-end para obter o endereço IP que a API está ouvindo.
A API, então, ficará escutando na porta 5900 requisições do tipo `POST`, `GET`, `PUT` e `DELETE` e ela tratará o cadastro de máquinas e usuários, além de responder as requisições, conforme necessário.

## Funcionamento do Cliente

O cliente irá pedir ao usuário um apelido para seu cadastro e o endereço IP da API (*usará o 127.0.0.1 caso não seja passado nenhum*), ele então enviará os dados de cadastro e em seguida começa a coletar os dados utilizando a biblioteca do Python psutil e a enviá-los para a API.

## Informações coletadas

O cliente coletará e enviará para a API as seguintes informações:

* Sistema operacional;
* Endereço IP da máquina;
* Uso médio da CPU;
* Uso detalhado de cada núcleo da CPU;
* Temperatura da CPU (indisponível em windows);
* Total de Memória RAM e Swap;
* Total usado de RAM e Swap;
* Total de armazenamento de disco;
* Total utilizado do armazenamento;
* Temperatura do Disco (indisponpivel em windows);

## Requisitos e dependências

Segue a versão requisitada do Node.js e do Python, juntamente com as dependências para execução da aplicação e do cliente.

### API

* [Node.js 18.19.1](https://nodejs.org/pt/blog/release/v18.19.1)
* [package.json](backend/src/package.json)

### Cliente

* [Python 3.12.3](https://www.python.org/downloads/release/python-3123/)
* [requirements.txt](backend/clients/requirements.txt)

## Execução

Para executar a **API** é necessário siga os seguintes passos:

1. Após clonar o [repositório](https://github.com/joaoweslley1/machine-viewer.git), navegue até o diretório `/backend/src/` com o comando `cd machine-viewer/backend/src/`;
2. Instale as dependências com o comando `npx install`;
3. Faça uma cópia do arquivo `.env.example`, altere conforme o necessário e renomeie a cópia para `.env`;
4. Gere o banco de dados com o comando `npx prisma migrate dev`;
5. Inicie a API com comando `node index.js`;
6. Insira o endereço IP que quer que sua API escute (caso deixe vazio, ele utilizará o 127.0.0.1).

Para o **cliente**:

1. Após clonar o [repositório](https://github.com/joaoweslley1/machine-viewer.git), navegue até o diretório `/backend/clients` com o comando `cd machine-viewer/backend/clients;
2. Instale as dependências com o comando `pip install -r requirements.txt`;
3. Inicie o cliente com o comando `python3 client.py`.
4. Digite um apelido para sua máquina ser cadastrada no banco (caso deixe vazio, ele usará o nome de sua máquina na rede).
5. Insira o endereço IP que a sua API está rodando (se vazio, ele utilizará o 127.0.0.1).

## Capturas de tela

Página inicial:
    <img src="./frontend/public/img/machine-viewer-home.png" alt= "homePage">

Página de detalhamento:
    <img src="./frontend/public/img/machine-viewer-details.png" alt="detailPage">