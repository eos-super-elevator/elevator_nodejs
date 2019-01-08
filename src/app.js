import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import http from 'http';
import elevatorRouter from './routes/elevator';
import pageNotFoundRouter from './routes/pageNotFound'
import errorsHandlerRouter from './routes/errorsHandler'
import {normalizePort, onError, onListening} from './helpers/serverHelper';
import {storageInit, getElevatorFromCache} from './helpers/persistElevator';
import io_server from 'socket.io';
import log from './helpers/advancedLog';
import initComponent from './components/init';

/**
 * Express : Elevator simulation
 * @type {*|Function}
 */
let elevator;
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
 * Routes : handles command via API
 */
app.use('/', elevatorRouter);
app.use('/', pageNotFoundRouter);
app.use(errorsHandlerRouter);

/**
 * Sockets : handle command via sockets communication
 */
const io = io_server(server);
io.on('connection', function (socket) {

    /**
     * Emit the initial elevator state on connection
     */
    socket.emit('new_elevator_state', elevator);

    /**
     * Emit the new elevator state
     */
    socket.on('updated_elevator', function () {
        log('state', 'Updated elevator state');
        socket.emit('new_elevator_state', elevator);
    });

    /**
     * Open doors command
     */
    socket.on('action_open_doors', function () {
        log('command', 'Open the doors command');
        elevator.openDoors();
    });

    /**
     * Open doors if an obstacle is detected
     */
    socket.on('action_open_doors_obstacle', function () {
        log('command', 'Obstacle detected');
        elevator.openDoorsBecauseOfObstacle();
    });

    /**
     * Close doors command
     */
    socket.on('action_close_doors', function () {
        log('command', 'Close the doors command');
        elevator.closeDoors();
    });

    /**
     * Go to the nth floor
     */
    socket.on('action_move_to', function (data) {
        log('command', `Move to floor ${data.floor} command`);
        elevator.addRequest(data);
    });
});

/**
 * Storage
 */
storageInit().then(() => {
    console.log('Initialized storage');
});

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server and listen on provided port, on all network interfaces.
 */
getElevatorFromCache().then((elevatorInstance) => {
    // Elevator
    elevator = elevatorInstance;
    // Components
    initComponent(elevator);
    // Server
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening.bind(this, server));
});
