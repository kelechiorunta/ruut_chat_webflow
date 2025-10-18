import express from 'express';
import { listSites } from '../controllers/sitesController.js';

const router = express.Router();

// List all sites for a given access token. See listSites controller for logic.
router.delete('/', listSites);

export default router;
