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

module.exports.match_2arr = (arr1, arr2) => {
    let result = [];
    for (let i = 0; i < arr1.length; i++) {
        result.push({
            product_ID: arr1[i],
            quantity: arr2[i]
        })
    }

    return result;
}