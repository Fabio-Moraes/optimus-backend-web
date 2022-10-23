const moment = require('moment');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const db = mysql.createPool({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b6e5116b10a3f3',
    password: 'f44c1bed',
    database: 'heroku_4e63847dfe579bb'
});

app.use(cors());
app.use(express.json());

// const business = 'barbearia_optimus';
const now = moment.utc().format('YYYY-MM-DD');

const selectDate = 'SELECT * FROM optimus WHERE business = ?;';
const deleteDate = 'DELETE FROM optimus WHERE service_date < ?;';

const checkDate = date => moment.utc(date.service_date).valueOf() < moment.utc().valueOf();

const validateLogin = {
    Optimus: {
        password: 'cubo',
        business: 'BARBEARIA OPTIMUS'
    },

    Fabio: {
        password: 'Asd123',
        business: 'SAMURAI BARBER SHOP'
    },

    Greenville: {
        password: 'ville2022',
        business: 'BARBEARIA GREENVILLE'
    },
}

app.get('/validate', (req, res) => {
    const { user, password } = req.query;

    if (validateLogin[user]?.password === password) {
        res.send(JSON.stringify([validateLogin[user]]))
    } else res.send('invalid password')

});

app.get('/select', (req, res) => {
    const { user, password } = req.query;

    const business = validateLogin[user]?.business.toLowerCase()
        .replace(/(\/)|(\s)/g, '_').normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (validateLogin[user]?.password === password) {
        db.query(selectDate, [business], (error, results) => {
            if (error) res.send(error);

            if (results.some(checkDate)) {
                db.query(deleteDate, [now], (error) => {
                    if (error) res.send(error);
                    res.send(JSON.stringify(results));
                });
                console.log('deleted');

            } else res.send(JSON.stringify(results));

            console.log('select');
            console.log(business);
        });
    } else res.send('invalid password')

});

app.listen(process.env.PORT || 3030, () => console.log('servidor rodando'));