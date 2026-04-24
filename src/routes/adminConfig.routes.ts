import { Router } from "express";
import {
    activeAdminWorkerConfig,
    deleteAdmin,
    getAdminConfig,
    getAllAdminWorker,
    saveAdminConfig,
    updateAdminConfig
} from "../controllers/adminConfig.controllers";

const router = Router();

router.post("/save-config", saveAdminConfig);
router.get("/config/:id", getAdminConfig);
router.get("/all-config", getAllAdminWorker);
router.post("/activate-config/:id", activeAdminWorkerConfig);
router.post("/update-config/:id", updateAdminConfig)
router.post("/delete-user/:id", deleteAdmin)

export default router;