const lcdLib = require('lcdi2c');

// LCD screen
const lcd = new lcdLib(1, 0x3f, 20, 4); // sudo i2cdetect -y 1 --> replace 0x27 par 0x3f
lcd.on();
lcd.clear();

export {lcd};
