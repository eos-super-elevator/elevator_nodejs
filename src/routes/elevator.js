import express from 'express';
import building from '../models/building';
import io_client from 'socket.io-client';

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

/**
 * Open the elevator's doors
 */
router.get('/doors/open', function (req, res) {
    const socket = io_client.connect('http://localhost:3000/');
    socket.emit('action_open_doors');
    res.sendStatus(204);
});

/**
 * Close the elevator's doors
 */
router.get('/doors/close', function (req, res) {
    const socket = io_client.connect('http://localhost:3000/');
    socket.emit('action_close_doors');
    res.sendStatus(204);
});

export default router;