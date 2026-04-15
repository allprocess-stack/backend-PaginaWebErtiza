import { Router } from 'express';
import {
    saveTicketPrefixConfig, getTicketPrefixConfig,
    activeTicketPrefixConfig,
    deactivateTicketPrefixConfig,
    getAllTicketPrefixConfig
} from '../controllers/ticketPrefixConfig.controllers';

const router = Router();

router.post('/save-config', saveTicketPrefixConfig);
router.get('/config', getTicketPrefixConfig);
router.post('/activate-config', activeTicketPrefixConfig);
router.post('/deactivate-config', deactivateTicketPrefixConfig);
router.get('/all-configs', getAllTicketPrefixConfig);

export default router;