import { Router } from "express";
import {
    activeAdminWorkerConfig,
    getAdminConfig,
    getAllAdminWorker,
    saveAdminConfig
} from "../controllers/adminConfig.controllers";

const router = Router();

router.post("/save-config", saveAdminConfig);
router.get("/config/:id", getAdminConfig);
router.get("/all-configs", getAllAdminWorker);
router.post("/activate-config/:id", activeAdminWorkerConfig);