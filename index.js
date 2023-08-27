// consts de dependências instaladas
const Promise = require('bluebird');
const express = require('express');
const cors = require('cors');
const spectable = require('spectable-docs');

// swagger-express
const middleware = Promise.promisify(require('swagger-express-middleware'));
const FileDataStore = require('swagger-express-middleware/lib/data-store/file-data-store');
const Resource = require('swagger-express-middleware/lib/data-store/resource');

// rotas e dados iniciais
const initialData = require('./initial-data.json');
const routesFilePath = './routes.yml';

// aplicação express
const app = express();
app.use(cors());

// banco de dados
const myDB = new FileDataStore('./data/');
myDB.save(Resource.parse(initialData));

console.log('inicializando app...');

Promise
    .all([
        middleware(routesFilePath, app),

        spectable({
            silent: true,
            specFile: routesFilePath,
            targetFile: 'index.html',
            targetDir: 'dist'
        })
    ])
    .then(([ middleware ]) => {
        app.use(express.static('dist'));

        app.get('/routes.yml', (req, res) => {
            res.sendFile(routesFilePath, { root: './' });
        });

        app.use(
            middleware.metadata(),
            middleware.CORS(),
            middleware.files(),
            middleware.parseRequest(),
            middleware.validateRequest(),
            middleware.mock(myDB)
        );
    })
    .catch((err) => {
        console.log('erro', err, err.stack);

        app.get('*', (req, res) => {
            res.status(500).send({
                error: err.message,
                stack: err.stack
            });
        });
    })
    .then(() => {
        app.listen(8000, function () {
            console.log('laboratório de api agora está rodando em http://localhost:8000');
        });
    })
