export default (category, message, important = false) => {
    // Current settings : yes | no | important
    const settings = {
        doors: 'yes',
        state: 'yes',
        elevator: 'yes',
        command: 'yes'
    };
    // Show logs
    if (settings[category] === 'yes' || (settings[category] === 'important' && important === true)) {
        console.log(message);
    }
};