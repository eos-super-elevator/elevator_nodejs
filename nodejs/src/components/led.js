const Gpio = require('onoff').Gpio;

const leds = {
    green: new Gpio(12, 'out'),
    red: new Gpio(20, 'out')
};

const intervals = {
    green: null,
    red: null
};

const timeouts = {
    green: null,
    red: null
};

const turnOnGreen = (delay = null) => {
    stopRed();
    stopGreen();
    leds.green.writeSync(1);
    if (delay) {
        timeouts.green = setTimeout(stopGreen, delay);
    }
};

const turnOnRed = (delay = null) => {
    stopGreen();
    stopRed();
    leds.red.writeSync(1);
    if (delay) {
        timeouts.red = setTimeout(stopRed, delay);
    }
};

const redBlink = () => {
    stopRed();
    stopGreen();
    intervals.red = setInterval(blinkLED.bind(null, leds.red), 250);
};

const stopGreen = () => {
    clearInterval(intervals.green);
    clearTimeout(timeouts.green);
    leds.green.writeSync(0);
};

const stopRed = () => {
    clearInterval(intervals.red);
    clearTimeout(timeouts.red);
    leds.red.writeSync(0);
};

function blinkLED(LED) {
    if (LED.readSync() === 0) {
        LED.writeSync(1);
    } else {
        LED.writeSync(0);
    }
}

export {redBlink, stopRed, stopGreen, turnOnGreen, turnOnRed};