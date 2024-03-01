// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
// const { Socket } = require('dgram');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const messagesRoutes = require('./routes/messagesRoutes');
const authenticationRoutes = require('./routes/authenticationRoutes');
const reset = require('./scripts/reset');
const swaggerAutogen = require('swagger-autogen')();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000; // Define a porta como a variável de ambiente PORT ou 3000
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Armazenar os nomes de usuário conectados
let connectedUsers = [];

io.on('connection', (socket) => {
  // console.log(`user ${socket.id} is connected`);

  // Quando um usuário se conecta, espera-se que o front-end envie o nome de usuário
  socket.on('currentUser', (username) => {
    // Associar o nome de usuário ao ID do socket
    socket.currentUser = username;

    // Adicionar o nome de usuário ao array de usuários conectados
    connectedUsers.push(username);

    // Emitir evento informando que um novo usuário se conectou
    io.emit('userConnected', username);

    // Atualizar contagem de usuários online
    const onlineUsersCount = io.engine.clientsCount;
    // console.log('Online users count:', onlineUsersCount);
    io.emit('onlineUsersCount', onlineUsersCount);

    // Exibir os usuários conectados no console
    // console.log('Connected users:', connectedUsers);
  });

  // Escutar por mensagens enviadas pelo cliente
  socket.on('message', data => {
    // Transmitir a mensagem recebida para todos os outros clientes
    socket.broadcast.emit('message:received', data);
  });

  // Lidar com desconexão do usuário
  socket.on('disconnect', () => {
    // console.log(`user ${socket.id} left`);

    // Se o usuário estava associado a um nome de usuário, emitir evento informando sua saída
    if (socket.currentUser) {
      io.emit('userDisconnected', socket.currentUser);

      // Remover o nome de usuário do array de usuários conectados
      connectedUsers = connectedUsers.filter(user => user !== socket.currentUser);

      // Exibir os usuários conectados atualizados no console
      // console.log('Connected users:', connectedUsers);
    }

    // Atualizar contagem de usuários online
    const onlineUsersCount = io.engine.clientsCount;
    // console.log('Online users count:', onlineUsersCount);
    io.emit('onlineUsersCount', onlineUsersCount);
  });
});

// Middleware para lidar com as solicitações OPTIONS
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://messenger-buddy.vercel.app',
    'https://messenger-buddy-arturstriker3.vercel.app',
    'https://messenger-buddy-git-master-arturstriker3.vercel.app'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]); // Origem padrão
  }

  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Objeto io para ser acessado em outros lugares
app.set('socketio', io);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexão com o banco de dados
const connectToDatabase = () => {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });
};

// Reinicialização em caso de erro ao conectar ao banco de dados
let db = connectToDatabase();

// Função para lidar com erros de conexão com o banco de dados e reiniciar o servidor
const handleDatabaseConnectionError = (err) => {
  console.error('Error connecting to database:', err);
  console.log('Attempting to restart the server...');
  setTimeout(() => {
    console.log('Restarting server...');
    process.exit(1);
  }, 5000); // Reiniciar o servidor após 5 segundos
};

// Lidar com erros de conexão com o banco de dados
db.connect((err) => {
  if (err) {
    handleDatabaseConnectionError(err);
  } else {
    console.log('Conectado ao Banco de Dados!');
  }
});

// Rotas 
app.use('/', messagesRoutes);
app.use('/', authenticationRoutes(io));

// Exporta a instância do aplicativo
module.exports = { app, io };

// Configuração de CORS
app.use(cors());

// Rotina para apagar mensagens
// reset.deleteMessages();

// Documentação
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

server.listen(port, () => {
  console.log(`Server rodando na porta: ${port}`);
});
