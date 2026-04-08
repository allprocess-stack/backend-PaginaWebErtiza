import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import { setDynamicPool } from './utils/dbDynamic'; // IMPORTANTE: Importa tu gestor dinámico
import loginRoutes from './routes/login.routes';
import forgotpasswordRoutes from './routes/forgotpassword.routes';
import dbRoutes from './routes/db.routes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Registro de rutas
app.use('/api/login', loginRoutes);
app.use('/api/forgot-password', forgotpasswordRoutes);
app.use("/api/db-config", dbRoutes);

// Función para inicializar la conexión dinámica al arrancar
const initDynamicConnection = async () => {
    try {
        console.log("Intentando restaurar conexión dinámica...");
        const result = await pool.query(`
            SELECT * FROM "ConfiguracionBD"
            ORDER BY "FechaCreacion" DESC
            LIMIT 1
        `);

        if (result.rows.length > 0) {
            const lastConfig = result.rows[0];
            await setDynamicPool(lastConfig);
            console.log("Conexión dinámica restaurada con éxito.");
        } else {
            console.log("No se encontró configuración previa en la BD.");
        }
    } catch (err: any) {
        console.error("Error al restaurar conexión dinámica inicial:", err.message);
    }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

    // EJECUTAMOS LA INICIALIZACIÓN AQUÍ
    await initDynamicConnection();
});