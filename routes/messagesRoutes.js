// messagesRoutes.js
const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const cors = require('cors'); // Importe o módulo CORS aqui

router.use(cors());

// Rota para obter mensagens
router.get('/api/getMessages', (req, res) => {
  messagesController.getMessages((err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao recuperar mensagens antigas' });
    } else {
      res.json(results);
    }
  });
});

//  Rota para inserção mensagens
router.post('/api/sendMessage', (req, res) => {
  const data = req.body;
  // console.log('Dados recebidos na rota sendMessage:', data);

  // Adiciona a mensagem usando o controller
  messagesController.addMessage(data, req.app.get('socketio'));

  res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
});

module.exports = router;