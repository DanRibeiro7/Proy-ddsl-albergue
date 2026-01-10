const mysql=require('mysql2');
const pool = mysql.createPool({
    host:process.env.DB_HOST || 'localhost',
    user:process.env.DB_USER || 'root',
    password:process.env.DB_PASSWORD || 'admin',
    database:process.env.DB_NAME || 'albergue',
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0
});

const promisePool = pool.promise();

pool.getConnection((err, connection)=>{
    if(err){
        console.log('Error de conexión');
    }else{
        console.log('conexión exitosa');
        connection.release();
    }
})
module.exports = promisePool;