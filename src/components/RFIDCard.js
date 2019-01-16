const rc522 = require("rc522");
let timeout = null;

const waitForBadge = () => {
    return new Promise((resolve, reject) => {
        rc522((rfidSerialNumber) => {
            console.log(rfidSerialNumber);
            clearTimeout(timeout);
            resolve(rfidSerialNumber);
        });
        timeout = setTimeout(() => {
            reject();
        }, 5000);
    });
};

const password = "35f84173";

export {waitForBadge, password};