const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', assetController.getAssets);
router.post('/', assetController.createAsset);

module.exports = router;
