var LCD = require('lcdi2c');
var lcd = new LCD(1, 0x3f, 20, 4); // sudo i2cdetect -y 1 --> replace 0x27 par 0x3f

lcd.println('This is line 1...', 1);
if (lcd.error) {
    lcdErrorHandler(lcd.error);
} else {
    lcd.println('This is line 2...', 2);
    if (lcd.error) {
        lcdErrorHandler(lcd.error);
    }
    lcd.clear();
    // lcd.on() lcd.off()
}

function lcdErrorHandler(err) {
    console.log('Unable to print to LCD display on bus 1 at address 0x27');
}