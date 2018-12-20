const Gpio = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;
const trigger = new Gpio(23, {mode: Gpio.OUTPUT});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});
// Make sure trigger is low
trigger.digitalWrite(0);

/**
 * Sonar activation
 */
const watchHCSR04 = (opened_doors_width, timer_before_toogle_door) => {
    let startTick;
    echo.on('alert', (level, tick) => {
        if (level === 1) {
            startTick = tick;
        } else {
            const endTick = tick;
            const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            console.log(diff / 2 / MICROSECDONDS_PER_CM);
        }
    });

    // API call : open doors
    const api_call_open_doors = () => {
        // axios
    };

    // Set trigger high for 10 microseconds
    const watchDoor = () => {
        trigger.trigger(10, 1);
    };

    // Trigger a distance measurement once per second
    const i = setInterval(watchDoor ,1000);
    // The door is closed
    setTimeout(function( ) { clearInterval( i ); }, timer_before_close_door);
};

export default watchHCSR04;