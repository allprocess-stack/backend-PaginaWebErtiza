import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import { setDynamicPool } from './utils/dbDynamic'; // IMPORTANTE: Importa tu gestor dinámico
import loginRoutes from './routes/login.routes';
import forgotPasswordRoutes from './routes/forgotPassword.routes';
import dbConfigRoutes from './routes/dbConfig.routes';
import scaleConfigRoutes from './routes/scaleConfig.routes';
import { setTcpConnection } from './utils/tcpDynamic.js';
import ticketPrefixConfigRoutes from './routes/ticketPrefixConfig.routes.js';
import adminRoutes from './routes/adminConfig.routes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Registro de rutas
app.use('/api/login', loginRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use("/api/db-config", dbConfigRoutes);
app.use("/api/scale-config", scaleConfigRoutes);
app.use("/api/ticket-prefix-config", ticketPrefixConfigRoutes);
app.use("api/admin", adminRoutes)

// Función para inicializar la conexión dinámica al arrancar
const initDynamicConnection = async () => {
    try {
        console.log("Intentando restaurar conexión dinámica...");
        const result = await pool.query(`
            SELECT * FROM "configuracionbd"
            ORDER BY "fechacreacion" DESC
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

// Restaurar conexión TCP (balanza)
const initTcpConnection = async () => {
    try {
        console.log("Intentando restaurar conexión TCP...");

        const result = await pool.query(`
            SELECT * FROM "configuraciontcp"
            ORDER BY "id" DESC
            LIMIT 1
        `);

        if (result.rows.length > 0) {
            const lastConfig = result.rows[0];

            await setTcpConnection({
                Ip: lastConfig.Ip,
                Puerto: lastConfig.Puerto
            });

            console.log("Conexión TCP restaurada.");
        } else {
            console.log("No hay configuración de balanza.");
        }

    } catch (err: any) {
        console.error("Error TCP:", err.message);
    }
};


const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

    // EJECUTAMOS LA INICIALIZACIÓN AQUÍ
    await initDynamicConnection();
    await initTcpConnection();
});