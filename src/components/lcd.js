const lcdLib = require('lcdi2c');

/**
 * LCD Screen
 */
const lcd = new lcdLib(1, 0x3f, 20, 4); // sudo i2cdetect -y 1 --> replace 0x27 par 0x3f

const initLCD = () => {
    lcd.clear();
    lcd.on();
};

const printOnLcd = (message, line = 1) => {
    lcd.println(message, line);
    if (lcd.error) {
        console.log('Unable to print to LCD display on bus 1 at address 0x27');
    }
};

export {initLCD, printOnLcd}