import io_client from 'socket.io-client';
import {updateElevatorInCache} from '../helpers/persistElevator';
import building from "./building";
import log from '../helpers/advancedLog';
import printOnLcd from '../components/lcd';

export default class Elevator {

    /**
     * Constructor : elevator initialization
     */
    constructor(state) {
        this.doors = {};
        this.doors.command = null; // null | close | open
        this.setDoorsStatus('closed'); // closed | opened | closing | opening
        this.doors.percent = 100; // 100 : closed | 0 opened
        this.doors.timer_toggle = 2000;
        this.doors.timer_before_close = 2000;

        this.elevator = {};
        this.elevator.status = 'stopped'; // stopped | moving
        this.elevator.direction = null; // null | up | down
        this.elevator.timer_move = 1000;
        this.setElevatorFloor(state ? state.elevator.floor : 0);
        this.elevator.requested_floors = [];
        this.elevator.new_request = false;
    }

    /**
     * Update doors status
     */
    setDoorsStatus(status) {
        this.doors.status = status;
        let message = '';
        switch (status) {
            case 'closed':
                message = 'Closed doors';
                break;
            case 'opened':
                message = 'Opened doors';
                break;
            case 'closing':
                message = 'Closing doors';
                break;
            case 'opening':
                message = 'Opening doors';
                break;
            default:
                message = 'Unknown doors status';
        }
        printOnLcd(message, 2);
        console.log(message);
    }

    /**
     * Update elevator current floor
     */
    setElevatorFloor(floor) {
        this.elevator.floor = floor;
        printOnLcd('Floor: ' + parseInt(floor), 1);
        console.log('Floor: ' + floor);
    }

    /**
     * Observable : handle action progression
     * @return {{subscribe: subscribe}}
     * @private
     */
    _timerObservable() {
        return {
            subscribe: observer => {
                const error = observer.subscribeErrors();
                if (error) {
                    console.log(error);
                    return;
                }
                const start = Date.now();
                const handleTime = () => {
                    const error = observer.handleErrors();
                    if (error) {
                        console.log(error);
                    } else if (Date.now() - start >= observer.eventDuration) {
                        observer.complete();
                    } else {
                        observer.next(start, observer.eventDuration);
                        setTimeout(handleTime, this.doors.timer_toggle / 10);
                    }
                };
                handleTime();
            }
        };
    }

    /**
     * Update the elevator state
     */
    _updateState() {
        updateElevatorInCache(this).then(() => {
            const socket = io_client.connect('http://localhost:3000/');
            socket.emit('updated_elevator');
        });
    }

    /**
     * Add a requested floor to the list
     * @param floor
     */
    addRequest(data) {
        if (!building.existsFloor(data.floor)) {
            log('command', 'Requested floor not found');
        } else {
            this.elevator.requested_floors.push(data);
        }
        this.move();
    }

    /**
     * Remove the command after finished
     */
    removeRequest() {
        this.elevator.requested_floors.shift();
        this.elevator.status = 'stopped';
        this.elevator.direction = null;
    }

    /**
     * move the elevator
     */
    move() {
        if (this.elevator.requested_floors.length > 0) {
            this.optimize();
            if (this.elevator.status !== 'moving') {
                this.optimizedMove();
            }
        }
    }

    /**
     * Optimize the elevator movement
     */
    optimize() {
        // Stop the current movement
        if (this.elevator.status === 'moving') {
            this.elevator.status = 'stopped';
            this.elevator.new_request = true;
        }
        // Current information
        const from = parseFloat(this.elevator.floor);
        const to = parseInt(this.elevator.requested_floors[0].floor);
        const direction = (to > from) ? 'up' : 'down';
        // All on the way floors
        let floors = this.elevator.requested_floors.filter((element, index) => {
            const floor = parseInt(element.floor);
            const inTheWay = direction === 'up' ? from < floor && floor < to : from > floor && floor > to;
            const sameDirection = direction === element.action || element.action === null;
            if (inTheWay && sameDirection) {
                this.elevator.requested_floors.splice(index, 1);
                return true;
            }
        });
        // Sort
        const sortFloors = (a, b) => {
            if (parseInt(a.floor) < parseInt(b.floor)) {
                return direction === 'up' ? -1 : 1;
            }
            return direction === 'up' ? 1 : -1;
        };
        // Construct new optimized array
        if (floors.length > 0) {
            floors = floors.sort(sortFloors);
            for (let i = floors.length - 1; i >= 0; i--) {
                this.elevator.requested_floors.unshift(floors[i]);
            }
        }
    }

    /**
     * Move to nth floor
     */
    optimizedMove() {
        // next floor to reach
        const nextStep = this.elevator.requested_floors[0];
        let from = parseFloat(this.elevator.floor), to = parseInt(nextStep.floor);
        this.elevator.direction = (to > from) ? 'up' : 'down';
        // already present elevator
        if (from === to) {
            console.log(`Elevator is already present floor ${this.elevator.floor}. Opening doors`);
            this.removeRequest();
            this.openDoors();
            return;
        }
        // close doors before moving
        this.waitClosedDoors().then(() => {
            this._timerObservable().subscribe({
                eventDuration: this.elevator.timer_move * Math.abs(to - from),
                subscribeErrors: () => {
                    if (this.elevator.status === 'moving') {
                        let error = false;
                        if (this.elevator.status === 'moving') {
                            error = "Already moving elevator";
                        }
                        return error;
                    }
                },
                handleErrors: () => {
                    let error = false;
                    if (this.elevator.new_request) {
                        this.elevator.new_request = false;
                        error = "New command detected";
                    }
                    return error;
                },
                next: (startTime, duration) => {
                    this.elevator.status = 'moving';
                    const progress = parseFloat((Date.now() - startTime) / this.elevator.timer_move);
                    this.setElevatorFloor(this.elevator.direction === 'up' ? from + progress : from - progress);
                    this._updateState();
                },
                complete: () => {
                    this.setElevatorFloor(to);
                    this.removeRequest();
                    this._updateState();
                    this.openDoors();
                    this.move();
                }
            });
        }).catch(() => {
            this.elevator.status = 'stopped';
            this.elevator.direction = null;
            this.move();
        });
    }

    /**
     * Open the elevator doors
     */
    openDoors() {
        this.doors.command = 'open';
        this._timerObservable().subscribe({
            eventDuration: Math.round(this.doors.percent * this.doors.timer_toggle / 100),
            subscribeErrors: () => {
                let error = false;
                // check doors status
                switch (this.doors.status) {
                    case 'opening':
                        error = 'Already opening doors';
                        break;
                    case 'opened':
                        error = 'Already opened doors';
                        break;
                }
                // check elevator status
                switch (this.elevator.status) {
                    case 'moving':
                        error = 'Cannot open the doors : elevator is moving';
                }
                return error;
            },
            handleErrors: () => {
                let error = false;
                // check doors command
                switch (this.doors.command) {
                    case 'close':
                        error = 'Open command cancelled';
                }
                return error;
            },
            next: (startTime, duration) => {
                this.setDoorsStatus('opening');
                this.doors.percent = Math.round(duration * 100 / this.doors.timer_toggle) - Math.round((Date.now() - startTime) * 100 / this.doors.timer_toggle);
                this._updateState();
                log('doors', `Doors : ${100 - this.doors.percent}% opened`);
            },
            complete: () => {
                this.setDoorsStatus('opened');
                this.doors.command = null;
                this.doors.percent = 0;
                this.delayCloseDoors();
                this._updateState();
            }
        });
    }

    /**
     * Request close door after timer
     */
    delayCloseDoors() {
        setTimeout(() => {
            if (this.doors.status === "opened") {
                this.closeDoors();
            }
        }, this.doors.timer_before_close);
    }

    /**
     * Close the elevator doors
     */
    closeDoors() {
        this.doors.command = 'close';
        this._timerObservable().subscribe({
            eventDuration: Math.round((100 - this.doors.percent) * this.doors.timer_toggle / 100),
            subscribeErrors: () => {
                let error = false;
                // check doors status
                switch (this.doors.status) {
                    case 'closing':
                        error = 'Already closing doors';
                        break;
                    case 'closed':
                        error = 'Already closed doors';
                        break;
                }
                return error;
            },
            handleErrors: () => {
                let error = false;
                // check doors command
                switch (this.doors.command) {
                    case 'open':
                        error = 'Close command cancelled';
                        break;
                }
                return error;
            },
            next: (startTime, duration) => {
                this.setDoorsStatus('closing');
                this.doors.percent = 100 - Math.round(duration * 100 / this.doors.timer_toggle) + Math.round((Date.now() - startTime) * 100 / this.doors.timer_toggle);
                this._updateState();
                log('doors', `Doors : ${this.doors.percent}% closed`);
            },
            complete: () => {
                this.doors.command = null;
                this.setDoorsStatus('closed');
                this.doors.percent = 100;
                this._updateState();
            }
        });
    }

    /**
     * Resolve on closed doors
     */
    waitClosedDoors() {
        return new Promise((resolve, reject) => {
            const checkDoors = setInterval(() => {
                if (this.doors.status === 'closed') {
                    clearTimeout(failToClose);
                    clearInterval(checkDoors);
                    resolve();
                }
            }, 500);
            const failToClose = setTimeout(() => {
                clearInterval(checkDoors);
                reject();
            }, this.doors.timer_toggle + this.doors.timer_before_close);
        });
    }
}
