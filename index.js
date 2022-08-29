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

const business = 'barbearia_optimus';
const now = moment.utc().format('YYYY-MM-DD');

const select = 'SELECT * FROM optimus WHERE business = ?;';
const clear = 'DELETE FROM optimus WHERE service_date < ?;';

const checkDate = (date) => {
    return moment.utc(date.service_date).format('YYYY-MM-DD') < now;
}

app.get('/select', (req, res) => {
    db.query(select, [business], (error, results) => {
        if (error) {
            res.send(error);
        }

        if (results.some(checkDate)) {
            db.query(clear, [now], (error) => {
                if (error) {
                    res.send(error);
                }
            });

            db.query(select, [business], (error, results) => {
                if (error) {
                    res.send(error);
                }

                res.send(JSON.stringify(results));
            });

        } else res.send(JSON.stringify(results));
    });
});

app.listen(process.env.PORT || 3030);