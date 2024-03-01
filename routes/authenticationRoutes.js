// authenticationRoutes.js
const express = require('express');
const router = express.Router();
// const authenticationController = require('../controllers/authenticationController');

// Armazenar os nomes de usuário conectados
let authConnectedUsers = [];

module.exports = (io) => {

  // Ouvir o evento 'userConnected' emitido pelo Socket.IO
  io.on('userConnected', (username) => {
    // Adicionar o nome de usuário à lista de usuários conectados
    authConnectedUsers.push(username);
  });

  // Ouvir o evento 'userDisconnected' emitido pelo Socket.IO
  io.on('userDisconnected', (username) => {
    // Remover o nome de usuário da lista de usuários conectados
    authConnectedUsers = authConnectedUsers.filter(user => user !== username);
  });

  // Rota para verificar se um usuário está online
  router.get('/api/checkUserOnline/:username', (req, res) => {
    const username = req.params.username;

    // Verificar se o nome de usuário está na lista de usuários conectados
    const isOnline = authConnectedUsers.includes(username);

    // Responder com o status do usuário
    res.status(200).json({ online: isOnline });
  });

  return router;
};
