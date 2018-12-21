import express from 'express';
import building from '../models/building';

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

/**
 * Get the JSON building description
 */
router.get('/building', function (req, res) {
    console.log('Returned the building structure');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(building));
});

export default router;