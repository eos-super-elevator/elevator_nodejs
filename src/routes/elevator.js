import express from 'express';

const fs = require('fs');
const showdown = require('showdown');
const router = express.Router();

/**
 * API documentation
 */
router.get('/', function (req, res) {
    const converter = new showdown.Converter();
    fs.readFile('README.md', 'utf-8', function (err, data) {
        if (err) throw err;
        res.send(converter.makeHtml(data));
    });
});

export default router;