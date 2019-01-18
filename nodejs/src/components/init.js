import {initLCD} from './lcd';
import {initSonar} from './sonar';
import {initServo} from './servo';

export default (elevator) => {
    initLCD();
    initSonar();
    initServo(elevator.getElevatorFloor());
};