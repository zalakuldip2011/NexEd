const express = require('express');
const router = express.Router();
const { verifyCertificate } = require('../controllers/certificateController');

/**
 * @route   GET /api/certificates/verify/:certificateId
 * @desc    Verify certificate (Public)
 * @access  Public
 */
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
