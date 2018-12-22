export default class Elevator {

    /**
     * Constructor : elevator initialization
     */
    constructor(state) {
        this.doors = {};
        this.doors.status = state ? state.doors.status : 'closed'; // closed | opened | closing | opening
        this.doors.percent = 100; // 100 : closed | 0 opened
        this.doors.timer_toggle = 4000;

        this.elevator = {};
        this.elevator.status = state ? state.elevator.status : 'stopped'; // stopped | moving
    }

    /**
     * Observable : handle action progression
     * @return {{subscribe: subscribe}}
     * @private
     */
    _timerObservable() {
        return {
            subscribe: observer => {
                const error = observer.error();
                if (error) {
                    console.log(error);
                    return;
                }
                const start = Date.now();
                const handleTime = () => {
                    if (Date.now() - start >= observer.eventDuration) {
                        observer.complete();
                    } else {
                        observer.next(start);
                        setTimeout(handleTime, 400);
                    }
                };
                handleTime();
            }
        };
    }

    /**
     * Open the elevator doors
     */
    openDoors() {
        this._timerObservable().subscribe({
            eventDuration: this.doors.timer_toggle,
            error: () => {
                let error = false;
                // check doors status
                switch (this.doors['status']) {
                    case 'opening':
                        error = 'Already opening doors';
                        break;
                    case 'opened':
                        error = 'Already opened doors';
                        break;
                }
                // check elevator status
                switch (this.elevator['status']) {
                    case 'moving':
                        error = 'Cannot open the doors : elevator is moving';
                        break;
                }
                return error;
            },
            next: (startTime) => {
                this.doors.status = 'opening';
                this.doors.percent = Math.round(100 - (Date.now() - startTime) * 100 / this.doors.timer_toggle);
                console.log(`Doors ${this.doors.percent}% closed`);
            },
            complete: () => {
                this.doors.status = 'opened';
                this.doors.percent = 0;
                console.log('Doors opened');
            }
        });
    }
}
