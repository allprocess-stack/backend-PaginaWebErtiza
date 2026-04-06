import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import loginRoutes from './routes/login.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// AQUÍ REGISTRAS LAS RUTAS
app.use('/api/login', loginRoutes);

// Ruta de prueba (opcional pero MUY útil)
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: "Conexión exitosa", time: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error de conexión" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});