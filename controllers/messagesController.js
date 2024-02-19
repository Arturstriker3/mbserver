// controllers/messagesController.js
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const addMessage = (data, io) => {
  // console.log('Dados da mensagem recebida no controlador:', data);

  // Adiciona a mensagem no banco de dados
  db.query(
    'INSERT INTO messages (user, text, date, time) VALUES (?, ?, ?, ?)',
    [data.user, data.text, data.date, data.time],
    (err, results) => {
      if (err) {
        console.error(err);
      } else {
        // Emitir a mensagem para todos os clientes conectados
        io.emit('message:received', data);
      }
    }
  );
};

const getMessages = (callback) => {
  // Recupera mensagens antigas do banco de dados
  db.query('SELECT * FROM messages ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error(err);
      callback(err, null);
    } else {
      // Inverte a ordem das mensagens
      const reversedResults = results.reverse();
      callback(null, reversedResults);
    }
  });
};

module.exports = { addMessage, getMessages };
