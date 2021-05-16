const mongoose = require('mongoose')



const db = mongoose.connect(process.env.DB_URI, {useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true})
.then(() => console.log('mongodb connection established'))
.catch((err) => console.log(err.message))