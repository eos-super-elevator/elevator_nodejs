/**
 * Packages import
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import http from 'http';
import {normalizePort, onError, onListening} from './helpers/serverHelper';
import persistElevator from './helpers/persistElevator';

const socketio = require('socket.io');

/**
 * Elevator simulation
 */
const elevator = (new persistElevator()).getElevatorFromCache();

/**
 * Routes import
 */
import elevatorRouter from './routes/elevator';
import pageNotFoundRouter from './routes/pageNotFound'
import errorsHandlerRouter from './routes/errorsHandler'

/**
 * Express
 * @type {*|Function}
 */
const app = express();
const server = http.createServer(app);

/**
 * Middlewares
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

/**
 * Sockets
 */
const io = socketio(server);
io.on('connection', function (socket) {

    console.log('Accepted connection to the socket server');

    /**
     * Open doors command
     */
    socket.on('action_open_doors', function () {
        console.log('Open the doors');
    });

    /**
     * Close doors command
     */
    socket.on('action_close_doors', function () {
        console.log('Close the doors');
    });
});

/**
 * Routes
 */
app.use('/', elevatorRouter);
app.use('/', pageNotFoundRouter);
app.use(errorsHandlerRouter);

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server and listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening.bind(this, server));
