const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL)// ALL I NEED TO CONNECT TO THE DATABASE

// const task = new Task({
//     description: '    Eat lunch'
// })

// task.save().then((task) => {
//     console.log(task)
// }).catch((error) => {
//     console.log(error)
// })

// const me = new User({
//     name: '   Lucas   ',
//     email: 'MYEMAIL@GMAIL.COM   ',
//     password: 'phone098!'
// })

// me.save().then((me) => { // SAVES THE DATA TO THE DATABASE AND RETURNS A PROMISE
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })