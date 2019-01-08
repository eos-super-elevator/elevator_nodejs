import {initLCD} from './lcd';
import {initSonar} from './sonar';

export default () => {
    initLCD();
    initSonar();
};