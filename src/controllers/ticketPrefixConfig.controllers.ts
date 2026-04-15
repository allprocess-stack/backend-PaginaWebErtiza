import type { Request, Response } from 'express';
import { pool } from '../config/db';

// Guardar configuración del prefijo del ticket
export const saveTicketPrefixConfig = async (req: Request, res: Response) => {
    try {

        const { Prefijo, Formato, Activo, IdUsuario } = req.body;
        if (!Prefijo || !Formato || typeof Activo !== "boolean" || !IdUsuario) {
            return res.status(400).json({ error: "Datos inválidos" });
        }
        // Lógica para guardar la configuración del prefijo del ticket
        await pool.query(`
            INSERT INTO "ConfiguracionTicket" ("Prefijo","Formato", "Activo", "FechaCreacion", "IdUsuario")
            VALUES ($1, $2, $3, NOW(), $4)
        `, [Prefijo, Formato, Activo, IdUsuario]);
        if (Activo) {
            await pool.query(`
        UPDATE "ConfiguracionTicket"
        SET "Activo" = false
        `);
        }

        res.status(201).json({ message: "Configuración guardada correctamente" });
    } catch (error) {
        console.error("Error en saveTicketPrefixConfig:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener la configuración de un ticket
export const getTicketPrefixConfig = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM "ConfiguracionTicket"
            WHERE "Activo" = true
            LIMIT 1
        `);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No hay configuración activa" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error en saveTicketPrefixConfig:", error);
        res.status(500).json({ error: "Error interno del servidor" });

    }
};

// Obtener todas las configuraciones del prefijo del ticket
export const getAllTicketPrefixConfig = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM "ConfiguracionTicket"
            ORDER BY "FechaCreacion" DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error en getAllTicketPrefixConfig:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Activar configuración del prefijo del ticket
export const activeTicketPrefixConfig = async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const { Id } = req.body;

        if (!Id) {
            return res.status(400).json({ error: "Id requerido" });
        }

        await client.query('BEGIN');

        await client.query(`
            UPDATE "ConfiguracionTicket"
            SET "Activo" = false
        `);

        await client.query(`
            UPDATE "ConfiguracionTicket"
            SET "Activo" = true
            WHERE "Id" = $1
        `, [Id]);

        await client.query('COMMIT');

        res.json({ success: true });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en activeTicketPrefixConfig:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    } finally {
        client.release();
    }
};

// Desactivar configuración del prefijo del ticket
export const deactivateTicketPrefixConfig = async (req: Request, res: Response) => {
    try {
        const { Id } = req.body;
        await pool.query(`
            UPDATE "ConfiguracionTicket"
            SET "Activo" = false
            WHERE "Id" = $1
        `, [Id]);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Error en deactivateTicketPrefixConfig:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};