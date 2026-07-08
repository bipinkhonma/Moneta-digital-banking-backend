const db = require('./config/db');

async function test() {
    try{
        const [rows] = await db.query('SELECT role_name FROM roles');
        console.log('Connected! Roles found:', rows);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

test();