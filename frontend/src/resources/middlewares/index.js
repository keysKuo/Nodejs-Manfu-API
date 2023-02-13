const { uuid } = require('uuidv4');

module.exports.generatePID = (cate) => {
    let pid = '';
    switch (cate) {
        case 'buffet':
            pid = 'BF';
            break;
        case 'alacarte':
            pid = 'AL';
            break;
        case 'extra':
            pid = 'EX';
            break;
        default:
            return '';
    }

    return pid + uuid().substring(0,8);
}