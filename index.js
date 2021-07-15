const express = require('express')

const port = 3000
var logger = require('morgan');
var createError = require('http-errors');





const app = express()
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/nfupload', (req, res) => {
    res.json(1)
})

app.get('/', (req, res) => {
    res.send('ok')
})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})