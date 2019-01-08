const Gpio = require('pigpio').Gpio;
import io_client from 'socket.io-client';

// Sonar's pins
const sonar = {
    trigger: new Gpio(23, {mode: Gpio.OUTPUT}),
    echo: new Gpio(24, {mode: Gpio.INPUT, alert: true})
};

// open doors measure
let watchDoorsInterval = null;
const minimalWidthToOpen = 50;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

// Socket to stop the doors closing
const socket = io_client.connect('http://localhost:3000/');

/**
 * Sonar initialisation
 */
const initSonar = () => {
    // Make sure trigger is low
    sonar.trigger.digitalWrite(0);
    // Define trigger alert on echo
    let startTick;
    sonar.echo.on('alert', (level, tick) => {
        if (level == 1) {
            startTick = tick;
        } else {
            const endTick = tick;
            const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            const width = diff / 2 / MICROSECDONDS_PER_CM;
            console.log('Doors opened : ' + width + ' cm');
            if (width < minimalWidthToOpen) {
                socket.emit('action_open_doors_obstacle');
            }
        }
    });
};

/**
 * Trigger a distance measurement once per second
 */
const watchDoors = () => {
    watchDoorsInterval = setInterval(() => {
        sonar.trigger.trigger(10, 1); // Set trigger high for 10 microseconds
    }, 200);
};

/**
 * Detect sonar
 */
const stopWatchDoors = () => {
    clearInterval(watchDoorsInterval);
};

export {initSonar, watchDoors, stopWatchDoors};