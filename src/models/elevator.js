export default class Elevator {

    /**
     * Constructor : elevator initialization
     */
    constructor() {
        this.floor = 1;
        this.stopped = true;
        this.closedDoors = true;
        this.openedDoors = false;
        this.timer_toggle_door = 4000;
        this.timer_change_floor = 4000;
    }

    /**
     * Open the elevator doors
     */
    openDoors() {
        this.closedDoors = false;
        setTimeout(() => {
            this.openedDoors = true;
        }, this.timer_toggle_door);
    }

    /**
     * Close the doors
     */
    closeDoors() {
        setTimeout(() => {
            this.closedDoors = true;
            this.openedDoors = false;
        }, this.timer_toggle_door);
    }
};
