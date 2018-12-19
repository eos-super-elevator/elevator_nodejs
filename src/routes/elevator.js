import express from 'express';
const router = express.Router();

router.get('/', function (req, res) {
    res.send('EOS Super Elevator v1.0');
});

export default router;