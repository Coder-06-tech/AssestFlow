const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createAssetSchema } = require('../utils/validationSchemas');

router.use(authMiddleware);

router.get('/', assetController.getAssets);
router.post('/', validate(createAssetSchema), assetController.createAsset);
router.get('/:id', assetController.getAssetById);

module.exports = router;
