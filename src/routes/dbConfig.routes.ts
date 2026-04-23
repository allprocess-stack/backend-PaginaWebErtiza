import { Router } from "express";
import {
    saveDBConfig,
    getDBConfig,
    testDynamicConnection,
    getConnectionStatus,
    // disconnectDB,
    activateDBConfig,
    getAllDBConfig,
    updateDBConfig,
} from "../controllers/dbConfig.controllers";

const router = Router();

router.post("/save-config", saveDBConfig);
router.get("/config", getDBConfig);
router.post("/update-config/:id", updateDBConfig); // Reutilizamos la misma función para actualizar
router.get("/all-config", getAllDBConfig);
router.post("/test-dynamic", testDynamicConnection);
router.get("/connection-status", getConnectionStatus);
// router.post("/disconnect", disconnectDB);
router.post("/activate", activateDBConfig);

export default router;