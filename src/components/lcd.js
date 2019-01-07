import {lcd} from './init';

export default (message, line = 1) => {
    lcd.println(message, line);
    if (lcd.error) {
        console.log('Unable to print to LCD display on bus 1 at address 0x27');
    }
}