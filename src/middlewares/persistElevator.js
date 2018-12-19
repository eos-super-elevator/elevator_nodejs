import Elevator from "../models/elevator";

const storage = require('node-persist');

export default async (req, res, next) => {
    // Initialize storage
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
    // Retrieve elevator from cache
    let elevator = await storage.getItem('elevator');
    if (elevator === undefined) {
        elevator = new Elevator();
        await storage.setItem('elevator', elevator);
    }
    // Add elevator in req parameters
    req.elevator = elevator;
    next();
}
