export default class Elevator {

    /**
     * Constructor : elevator initialization
     */
    constructor(state) {
        this.floor = state ? state.floor : 0;
        this.stopped = state ? state.stopped : true;
        this.closedDoors = state ? state.closedDoors : true;
        this.openedDoors = state ? state.openedDoors : false;
        this.timer_toggle_door = state ? state.timer_toggle_door : 4000;
        this.timer_change_floor = state ? state.openedDoors : 4000;
    }

    /**
     * Open the elevator doors
     */
    openDoors() {
        this.closedDoors = false;
        setTimeout(() => {
            this.openedDoors = true;
            console.log('Door opened');
        }, this.timer_toggle_door);
    }

    /**
     * Close the doors
     */
    closeDoors() {
        setTimeout(() => {
            this.closedDoors = true;
            this.openedDoors = false;
            console.log('Door closed');
        }, this.timer_toggle_door);
    }
};
