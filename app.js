const express = require('express')
const path =require('path')

const app = express()

app.set('views', path.join(__dirname + '/views'))
app.set('view engine', 'html')

let scraper = require('./routes/scraper')

//app.use('/', (req, res, next) => {})

app.use('/', scraper)

app.listen(3000)
console.log('Server running on http://localhost:3000')
