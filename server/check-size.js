const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function checkDatabaseSize() {
    // Luôn sử dụng biến môi trường từ file .env để bảo mật
    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME || 'hospital_report';

    if (!host || !user || !password) {
        console.error('❌ Lỗi: Vui lòng cấu hình đầy đủ DB_HOST, DB_USER, DB_PASSWORD trong file .env trước khi chạy!');
        process.exit(1);
    }

    const connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database: dbName,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    try {
        const [rows] = await connection.query(`
            SELECT 
                table_name AS 'Table', 
                round(((data_length + index_length) / 1024 / 1024), 2) AS 'Size_MB' 
            FROM information_schema.TABLES 
            WHERE table_schema = ? 
            ORDER BY (data_length + index_length) DESC;
        `, [dbName]);

        console.log(`📊 Dung lượng các bảng trong database "${dbName}":`);
        console.table(rows);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await connection.end();
    }
}

checkDatabaseSize();
