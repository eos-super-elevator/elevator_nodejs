import express from 'express';

const router = express.Router();

/**
 * Catch 404 and forward to error handler
 */
router.get('/', function (req, res) {
    res.status(404).send('Not found');
});

export default router;