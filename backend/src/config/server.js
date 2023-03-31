const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const flash = require('flash');
const cors = require('cors');
require('dotenv').config();

const init = () => {
    app.use(cors());
    app.set('view engine', 'hbs');
    app.engine(
        'hbs',
        handlebars.engine({
            extname: 'hbs',
            defaultView: 'main',
            layoutsDir: path.join(__dirname, '../resources/views/layouts/'),
            partialsDir: path.join(__dirname, '../resources/views/partials/'),
            helpers: {
                formatCurrency: (number) => {
                    return number.toLocaleString('vi', { style: 'currency', currency: 'VND' });
                },

                equal: (left, right, options) => {
                    return (left === right) ? options.fn(this) : options.inverse(this); 
                },
                when: function (operand_1, operator, operand_2, options) {
                    let operators = {
                        //  {{#when <operand1> 'eq' <operand2>}}
                        eq: (l, r) => l == r, //  {{/when}}
                        noteq: (l, r) => l != r,
                        gt: (l, r) => +l > +r, // {{#when var1 'eq' var2}}
                        gteq: (l, r) => +l > +r || l == r, //               eq
                        lt: (l, r) => +l < +r, // {{else when var1 'gt' var2}}
                        lteq: (l, r) => +l < +r || l == r, //               gt
                        or: (l, r) => l || r, // {{else}}
                        and: (l, r) => l && r, //               lt
                        '%': (l, r) => l % r === 0, // {{/when}}
                    };
                    let result = operators[operator](operand_1, operand_2);
                    if (result) return options.fn(this);
                    return options.inverse(this);
                },
            }
        })
    );

    app.set('views', path.join(__dirname, '../resources/views'));
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookie('SUD'));
    app.use(session({
        cookie: { maxAge: 30000000 },
        saveUninitialized: true
    }));
    app.use(flash());
    app.use(bodyParser.urlencoded({ extended: false }));
    return app;

}

module.exports = { init };