import { Router } from "express";
import {
    saveDBConfig,
    getDBConfig,
    testDynamicConnection,
} from "../controllers/dbConfig.controllers";

const router = Router();

router.post("/save-config", saveDBConfig);
router.get("/config", getDBConfig);
router.post("/test-dynamic", testDynamicConnection);

export default router;