import { Router } from "express";
import {
    saveDBConfig,
    getDBConfig,
    testDynamicConnection,
    getConnectionStatus,
    disconnectDB,
    activateDBConfig,
    getAllDBConfig,
} from "../controllers/dbConfig.controllers";

const router = Router();

router.post("/save-config", saveDBConfig);
router.get("/config", getDBConfig);
router.get("/all-configs", getAllDBConfig);
router.post("/test-dynamic", testDynamicConnection);
router.get("/connection-status", getConnectionStatus);
router.post("/disconnect", disconnectDB);
router.post("/activate", activateDBConfig);

export default router;