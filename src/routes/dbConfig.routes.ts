import { Router } from "express";
import {
    saveDBConfig,
    getDBConfig,
    testDynamicConnection,
    getConnectionStatus,
    disconnectDB,
} from "../controllers/dbConfig.controllers";

const router = Router();

router.post("/save-config", saveDBConfig);
router.get("/config", getDBConfig);
router.post("/test-dynamic", testDynamicConnection);
router.get("/connection-status", getConnectionStatus);
router.post("/disconnect", disconnectDB);

export default router;