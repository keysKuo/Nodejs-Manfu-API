module.exports.queryString = (type, options) => {
    let query = '';
    switch (type) {
        case 'select':
            query = 'Select ' + options.select + ' ' + 'From ' + options.table + ' ';
            break;
        case 'insert':
            query = 'Insert into ' + options.table + ' values ' + `(${options.values})`;
            break;
        case 'delete':
            query = 'Delete From ' + options.table + ' ';
            break;
        case 'update':
            query = 'Update ' + options.table + ' ' + 'Set ' + options.set + ' ';
            break;
        default:
            return '';
    }

    return options.where
        ? query + ' Where ' + options.where + ' ' + (options.optional || '')
        : query + ' ' + (options.optional || '');
}


