const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authGuard = require('../middlewares/authMiddleware');

router.use(authGuard);

router.get('/active', auditController.getActiveAudit);
router.post('/verify', auditController.verifyAsset);
router.post('/close', auditController.closeAudit);

module.exports = router;
