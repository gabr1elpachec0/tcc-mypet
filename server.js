const express    = require('express')
const path       = require('path')
const router     = require('./src/routes')
const session    = require('express-session')
const port       = 3000
const app        = express()

app.use(session({
  secret: '2C44-4D44-WppQ38S',
  resave: false,
  saveUninitialized: true
}))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.use(router)


app.listen(port, () => {
  console.log('Server running at port 3000!')
})
