const bcrypt = require('bcryptjs');

const password = '123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar o hash:', err);
    return;
  }
  console.log('O hash para a senha "123" é:');
  console.log(hash);
});