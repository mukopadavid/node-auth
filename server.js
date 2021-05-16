require('dotenv').config()
const express = require("express")
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path');
const db = require('./db/connection')


const app = express()
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials:true
}))
app.use(cookieParser())
app.use(express.json())

// routes
app.use('/api/auth', require("./routes/auth.routes"))


if(process.env.NODE_ENV === 'production'){

  app.use(express.static(__dirname, 'client/build'))
  app.use("*", path.join(__dirname, 'client/build','index.html'))

}

const PORT = process.env.PORT || 5000
app.listen(PORT , () => console.log(`server running on http://localhost:${PORT}`))