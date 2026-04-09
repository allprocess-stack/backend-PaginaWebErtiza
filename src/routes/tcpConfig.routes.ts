import type { Request, Response } from "express";
import { pool } from "../config/db";

export const saveTCPConfig = async (req: Request, res: Response) => {
    try {
        const {
            Ip, Puerto, Protocolo, IdUsuario
        } = req.body;

        const isMasterUser = { IdUsuario: IdUsuario ? null : 1 };

    } catch (error) {

    }
}