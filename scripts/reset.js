// reset.js

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const deleteMessages = () => {
  db.query('DELETE FROM messages WHERE id > 1', (err, results) => {
    if (err) {
      console.error('Erro ao apagar mensagens:', err);
    } else {
      console.log('Mensagens excluídas com sucesso!');
      
      // Redefinir o valor do índice autoincrementável para 1
      db.query('ALTER TABLE messages AUTO_INCREMENT = 2', (err, results) => {
        if (err) {
          console.error('Erro ao redefinir o índice:', err);
        } else {
          console.log('Índice redefinido com sucesso!');
        }
      });
    }

    // Fechar a conexão com o banco de dados
    db.end();
  });
};

module.exports = {
  deleteMessages,
};