// swagger.js
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Messenger Buddy API',
    description: 'Servidor para o aplicativo de mensagens.',
  },
  host: 'localhost:3000', // Altere para o seu host
  basePath: '/', // Caminho base das suas rotas
  schemes: ['http'], // Protocolo de comunicação (http, https, etc.)
};

const outputFile = './swagger-output.json';
const routes = ['./routes/messagesRoutes.js','./server.js']; // rotas

swaggerAutogen(outputFile, routes, doc);