import { Router } from "express";
import { disconnectScale, getConnectScale, getScaleConfig, saveScaleConfig, testScaleConnection } from "../controllers/scaleConfig.controllers";

const router = Router();

router.post("/save-config", saveScaleConfig);
router.get("/config", getScaleConfig);
router.post("/test-connection", testScaleConnection);
router.post("/connect-status", getConnectScale);
router.post("/disconnect", disconnectScale);

export default router;