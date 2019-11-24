const express = require('express');
const users = require('./routes/users')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = express();

app.use(bodyParser.json());
app.use(cors())
app.use(morgan())
app.use('/users', users);
app.listen(4000, () => {
    console.log('Server is running on 4000');

});



