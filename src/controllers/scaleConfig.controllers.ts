import type { Request, Response } from "express";
import { pool } from "../config/db";
import { MASTER_USER } from "./masterUser";
import { disconnectTcp, setTcpConnection } from "../utils/tcpDynamic";

// Guardar configuración de la balanza
export const saveScaleConfig = async (req: Request, res: Response) => {
    try {
        // Extraer datos del cuerpo de la solicitud
        const {
            Ip, Puerto, Protocolo, IdUsuario, Usuario, Contrasena, Rol
        } = req.body;
        // Verificar si el usuario es master
        const isMasterUser =
            Usuario === MASTER_USER.username &&
            Contrasena === MASTER_USER.password;

        // Bloquea a TRABAJADOR directamente
        if (!isMasterUser && Rol === "TRABAJADOR") {
            return res.status(403).json({
                error: "No tienes permisos para guardar configuración"
            });
        }
        // Si es master → no guarda usuario
        const idFinal = isMasterUser ? null : IdUsuario;
        // Guardar configuración en la base de datos
        await pool.query(
            "INSERT INTO ConfiguracionTcp (Ip, Puerto, Protocolo, IdUsuario) VALUES (?, ?, ?, ?)",
            [Ip, Puerto, Protocolo, idFinal]
        );
        // Responder al cliente
        res.json({
            ok: true,
            tipo: isMasterUser ? "MASTER" : "ADMIN"
        });
    } catch (error) {
        console.error("Error en saveScaleConfig:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener última configuración de la balanza
export const getScaleConfig = async (req: Request, res: Response) => {
    try {
        // Obtener la última configuración de la balanza desde la base de datos
        const result = await pool.query(`
            SELECT * FROM "ConfiguracionTcp"
            ORDER BY "Id" DESC
            LIMIT 1
        `);
        // Responder con la configuración encontrada
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error en getScaleConfig:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Test conexión TCP a la balanza
export const testScaleConnection = async (req: Request, res: Response) => {
    try {
        // Lógica para probar conexión TCP a la balanza usando la función del gestor TCP dinámico
        const { Ip, Puerto } = req.body;

        // Validar que se reciban los datos necesarios
        await setTcpConnection({ Ip, Puerto });

        // Si la conexión es exitosa, respondemos con éxito
        res.json({ ok: true, message: "Conexión TCP exitosa" });
    } catch (error) {
        console.error("Error en testScaleConnection:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Conectar a la balanza
export const getConnectScale = async (req: Request, res: Response) => {
    try {
        // Lógica para conectar a la balanza
        const { Ip, Puerto } = req.body;

        // Validar que se reciban los datos necesarios
        if (!Ip || !Puerto) {
            return res.status(400).json({
                error: "Ip y Puerto son requeridos"
            });
        }

        // Conectar a la balanza usando la función del gestor TCP dinámico
        await setTcpConnection({ Ip, Puerto });

        // Si la conexión es exitosa, respondemos con éxito
        res.json({ ok: true, message: "Conectado a la balanza" });
    } catch (error) {
        console.error("Error en getConnectScale:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Desconectar conexión TCP 
export const disconnectScale = async (req: Request, res: Response) => {
    try {
        // Lógica para desconectar la balanza usando la función del gestor TCP dinámico
        const disconnected = disconnectTcp();

        // Responder según el resultado de la desconexión
        if (disconnected) {
            res.json({ ok: true, message: "Conexión TCP desconectada" });
        } else {
            res.status(404).json({ error: "No hay conexión TCP activa" });
        }
    } catch (error) {
        console.error("Error en disconnectScale:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};