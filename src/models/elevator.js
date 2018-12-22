import io_client from 'socket.io-client';
import persistElevator from '../helpers/persistElevator';

export default class Elevator {

    /**
     * Constructor : elevator initialization
     */
    constructor(state) {
        this.doors = {};
        this.doors.command = null; // null | close | open
        this.doors.status = 'opened'; // closed | opened | closing | opening
        this.doors.percent = 0; // 100 : closed | 0 opened
        this.doors.timer_toggle = 4000;

        this.elevator = {};
        this.elevator.status = 'stopped'; // stopped | moving
        this.elevator.floor = state ? state.elevator.floor : 0;
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
        new persistElevator().updateElevatorInCache(this).then(() => {
            const socket = io_client.connect('http://localhost:3000/');
            socket.emit('updated_elevator');
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
                this.doors.status = 'opening';
                this.doors.percent = Math.round(duration * 100 / this.doors.timer_toggle) - Math.round((Date.now() - startTime) * 100 / this.doors.timer_toggle);
                this._updateState();
                console.log(`Doors : ${100 - this.doors.percent}% opened`);
            },
            complete: () => {
                this.doors.status = 'opened';
                this.doors.command = null;
                this.doors.percent = 0;
                this._updateState();
                console.log('Doors 100% opened');
            }
        });
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
                this.doors.status = 'closing';
                this.doors.percent = 100 - Math.round(duration * 100 / this.doors.timer_toggle) + Math.round((Date.now() - startTime) * 100 / this.doors.timer_toggle);
                this._updateState();
                console.log(`Doors : ${this.doors.percent}% closed`);
            },
            complete: () => {
                this.doors.command = null;
                this.doors.status = 'closed';
                this.doors.percent = 100;
                this._updateState();
                console.log('Doors 100% closed');
            }
        });
    }
}
