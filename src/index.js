const express = require('express')
require('./db/mongoose')
// const User = require('./models/user') // THESE TWO ARE NO LONGER USED HERE, THEY ARE DECLARED IN THE ROUTERS 
// const Task = require('./models/task') // THESE TWO ARE NO LONGER USED HERE, THEY ARE DECLARED IN THE ROUTERS 
const userRouter = require('./routers/user') // CREATES THE USER ROUTER FROM FILE '/routers/user.js' TO HAVE SEPARATED FILES FRO EVERY SINGLE ROUTER
const taskRouter = require('./routers/task') // CREATES THE TASK ROUTER FROM FILE '/routers/task.js' TO HAVE SEPARATED FILES FRO EVERY SINGLE ROUTER

const app = express()
const port = process.env.PORT 

// const multer = require('multer')
// const upload = multer({ // BELOW WHEN upload IS CALLED, IT IS GONNA SAVE THE FILE IN THE DIRECTORY images
//     dest: 'images',
//     limits: {
//         fileSize: 1000000 // FILE SIZE LIMIT IN BYTES
//     },
//     fileFilter(req, file, cb) { // cb STANDS FOR CALLBACK. fileFilter SETS WHICH TYPE OF FILES ARE ACCEPTED
//         if (!file.originalname.match(/\.(doc|docx)$/)) { // RETURNS TRUE IF THE FILE IS OF ANY OF THE SPECIFIED TYPES
//             return cb(new Error('Please upload a Word document'))
//         }

//         cb(undefined, true) // SAVES THE FILE
//     }
// })

// app.post('/upload', upload.single('upload'), (req,res) => { // TELL MULTER TO FIND A FILE NAMED upload WHEN THE REQUEST COMES IN
//     res.send()
// }, (error, req, res, next) => { // HANDLES THE ERROR AND SENDS BACK THE ERROR MESSAGE AS A JSON
//     res.status(400).send({ error: error.message })
// })

// app.use((req, res, next) => { // THIS FUNCTION WILL RUN BETWEEN THE REQUEST TO THE SERVER AND THE ROUTE HANDLER
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next() // LETS EXPRESS KNOW WE ARE DONE WITH THIS MIDDLEWARE FUNCTION
//     }
// })

// MAINTENANCE MIDDLEWARE
// app.use((req, res, next) => {
//     if (req.method === 'GET' || 'POST' || 'PATCH' || 'DELETE') {
//         res.status(503).send('Site is currently down. Check back soon!')
//     }
// })

app.use(express.json()) // AUTOMATICALLY PARSE THE INFO TO AN OBJECT
app.use(userRouter) // REGISTER THE USER ROUTER
app.use(taskRouter) // REGISTER THE TASK ROUTER



app.listen(port, () => {
    console.log('Sever is up on port ' + port)
})

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('64a343c1844a7d004f9e75a2')
//     // await task.populate('owner')
//     // console.log(task.owner)

//     const user = await User.findById('64a342f50ece9548fc41a412')
//     await user.populate('tasks')
//     console.log(user.tasks)
// }

// main()

// EXAMPLE OF HOW toJSON WORKS
// const pet = {
//     name: 'Hal'
// }

// pet.toJSON = function () {
//     return {}
// }

// console.log(JSON.stringify(pet))

// ENCRYPTING PASSWORDS
// const bcrypt = require('bcryptjs')

// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     // JWT CREATES DATA THAT IS VERIFIABLE BY THE SIGNATURE (string)
//     const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' }) // THE OBJECT IS WHAT IS EMBEDDED IN THE TOKEN
//     console.log(token)

//     const data = jwt.verify(token, 'thisismynewcourse') // VERIFIES THE TOKEN FROM ABOVE
//     console.log(data)

//     // const password = 'Red12345!'
//     // const hashedPassword = await bcrypt.hash(password, 8)

//     // console.log(password)
//     // console.log(hashedPassword)

//     // const isMatch = await bcrypt.compare('Red12345!', hashedPassword)
//     // console.log(isMatch)
// }

// myFunction()

// mypass -> asdasdsadadsadjkzcxn  -> CANNOT GO BACK TO ORIGINAL PASSWORD