import Elevator from "../models/elevator";

const storage = require('node-persist');

export default class persistElevator {

    /**
     * Constructor
     */
    constructor() {
        this.initializeStorage();
    }

    /**
     * Initialize storage
     * @return {Promise<void>}
     */
    async initializeStorage() {
        await storage.init({
            dir: './cache',
            stringify: JSON.stringify,
            parse: JSON.parse,
            encoding: 'utf8',
            logging: false,
            ttl: false,
            expiredInterval: 60 * 60 * 1000,
            forgiveParseErrors: false
        }).then(() => {
            console.log('Initialized storage');
        });
    };

    /**
     * Retrieve elevator from cache
     */
    async getElevatorFromCache() {
        let elevator = await storage.getItem('elevator');
        if (elevator === undefined) {
            elevator = new Elevator();
            console.log('New elevator instantiated');
            this.storeElevatorInCache(elevator);
        } else {
            console.log('Retrieved elevator from cache');
        }
        return elevator;
    };

    /**
     * Add elevator in cache
     */
    async storeElevatorInCache(elevator) {
        await storage.setItem('elevator', elevator);
    };

    /**
     * Update the stored elevator
     */
    async updateElevatorInCache(elevator) {
        await storage.setItem('elevator', elevator);
    };
};