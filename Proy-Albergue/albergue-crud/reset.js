const bcrypt = require('bcryptjs');

// Generamos el hash de '123456'
const hash = bcrypt.hashSync('123456', 10);

console.log("---------------- COPIA ESTO EN MYSQL ----------------");
console.log(`UPDATE usuario SET password = '${hash}' WHERE username = 'admin';`);
console.log("-----------------------------------------------------");