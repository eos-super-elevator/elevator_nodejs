import Elevator from "../models/elevator";
import storage from 'node-persist';

/**
 * Retrieve elevator from cache
 */
async function storageInit() {
    await storage.init({
        dir: './cache',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,
        ttl: false,
        expiredInterval: 60 * 60 * 1000,
        forgiveParseErrors: false
    });
}

/**
 * Retrieve elevator from cache
 */
async function getElevatorFromCache() {
    const elevatorState = await storage.getItem('elevator');
    let elevator;
    if (elevatorState === undefined) {
        elevator = new Elevator();
        storeElevatorInCache(elevator).then(() => {
            console.log('New elevator instantiated and stored');
        });
    } else {
        elevator = new Elevator(elevatorState);
        console.log('Retrieved elevator from cache');
    }
    return elevator;
}

/**
 * Add elevator in cache
 */
async function storeElevatorInCache(elevator) {
    await storage.setItem('elevator', elevator);
}

/**
 * Update the stored elevator
 */
async function updateElevatorInCache(elevator) {
    await storage.setItem('elevator', elevator);
}

export {storageInit, getElevatorFromCache, updateElevatorInCache};
