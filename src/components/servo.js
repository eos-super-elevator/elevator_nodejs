const Gpio = require('pigpio').Gpio;
import building from '../models/building';

// Servo
const motor = new Gpio(5, {mode: Gpio.OUTPUT});

// Pulse per floor
const minPulse = 600, maxPulse = 2400;
const pulsePerFloor = (maxPulse - minPulse) / building.getMaxFloor();

// Previous floor
let previousFloor = 0;

/**
 * Initiate the servo-motor
 */
const initServo = (floor) => {
    console.log('Servo initialization');
    moveMotor(0);
};

const moveMotor = (floor) => {
    previousFloor = parseInt(floor);
    const currentPulse = minPulse + floor * pulsePerFloor;
    console.log(`pulse position for floor ${floor} : ${currentPulse}`);
    motor.servoWrite(currentPulse);
};

export {initServo, moveMotor}