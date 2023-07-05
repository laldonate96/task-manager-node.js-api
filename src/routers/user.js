const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()


router.post('/users', async (req, res) => { // SENDS DATA TO THE SERVER
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

    // OLD PROMISE, CHANGED FOR THE ASYNC ABOVE!!
    // user.save().then(() => {
    //     res.status(201).send(user) // SETS THE HTTP CODE TO 201: "CREATED"
    // }).catch((e) => {
    //     res.status(400).send() // STATUS SHOULD BE BEFORE SEND
    // })

})

router.post('/users/login', async (req, res) => { // ENDPOINT FOR LOGIN
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) // I CREATE THE METHOD findByCredentials IN USER MODEL
        const token = await user.generateAuthToken()
        res.send({ user, token }) // I SHALL NOT EXPOSE PRIVATE DATA SUCH AS PASSWORD OR TOKENS, ONLY SHOW PUBLIC DATA
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => { // ENDPOINT FOR LOGOUT
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token // WILL REMOVE THE TOKEN FROM THE ARRAY WHEN IT MATCHES WITH THE TOKEN AUTH THAT WAS USED TO LOGIN
        })
        await req.user.save()

        res.sendStatus(200)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => { // ENDPOINT FOR LOGOUT ALL INSTANCES
    try {
        req.user.tokens = [] // EMPTIES THE TOKENS ARRAY

        await req.user.save()

        res.sendStatus(200)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => { // I PASS AUTH AS AN AGRUMENT TO AUTHENTICATE THIS REQUEST
    res.send(req.user)

    // OLD FUNCTION TO GET ALL USERS BEFORE IMPLEMENTING AUTHENTICATION (CHANGED POSTMAN REQUEST FROM 'Read users' to 'Read profile')
    // THE CHANGE IS BECAUSE A USER SHOULD NOT BE ABLE TO SEE THE OTHER USERS INFO BUT JUST HIS OWN PROFILE
    // try {
    //     const users = await User.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send()
    // }


    // OLD PROMISE, CHANGED FOR THE ASYNC ABOVE!!
    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
})

// THIS REQUEST IS NOT NEEDED ANYMORE SINCE IT IS DONE BY THE REQUEST ABOVE (A USER SHOULD NOT BE ABLE TO GET ANOTHER USER BY ID)
// router.get('/users/:id', async (req, res) => { // REQUEST FOR A DYNAMIC VALUE (:id IS WHATEVER IT WAS PUT IN THE REQUEST)
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
    

//     // OLD PROMISE, CHANGED FOR THE ASYNC ABOVE!!
//     // User.findById(_id).then((user) => { // MONGOOSE CONVERTS THE STRINGS IDS TO OBJECT IDS AUTOMATICALLY
//     //     if (!user) {
//     //         return res.status(404).send()
//     //     }

//     //     res.send(user)
//     // }).catch((e) => {
//     //     res.status(500).send()
//     // })
// })

// BEFORE AUTH IT WAS '/users/:id'
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body) // SHOWS THE KEYS OF AN OBJECT 
    const allowedUpdates = ['name', 'email', 'password', 'age'] // ONLY ELEMENTS THE USER CAN UPDATE
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // IT IS CALLED ONE TIME FOR EVERY ITEM IN THE ARRAY (RETURNS TRUE IF EVERY CALL RETURNS TRUE)

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        // THIS WAS BEFORE REFACTORING WITH AUTH
        // const user = await User.findById(req.params.id) 

        updates.forEach((update) => req.user[update] = req.body[update]) // WILL UPDATE THE VALUE OF THE ACTUAL FIELD OF THE UPDATES ARRAY THAT IS GONNA BE UPDATED 
        await req.user.save()

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) // new: true RETURNS THE NEW USER OVERWRITING THE ORIGINAL ONE (THIS WAS CHANGE FOR THE CODE ABOVE SO IT CAN RUN THE MIDDLEWARE FUNCTIONS)

        // THIS WAS BEFORE REFACTORING WITH AUTH
        // if (!user) {
        //     return res.status(404).send()
        // }

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// BEFORE AUTH IT WAS '/users/:id'
router.delete('/users/me', auth, async(req, res) => {
    try {
        // THIS WAS BEFORE REFACTORING WITH AUTH
        // const user = await User.findByIdAndDelete(req.user._id) 

        // if (!user) {
        //     return res.status(404).send()
        // }

        await req.user.deleteOne() // DOES THE SAME THAN ABOVE
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
})

const upload = multer({
    // dest: 'avatars', // upload WILL NO LONGER STORE DATA LOCALLY BUT PASS THE DATA TO THE FUNCTION CALL IN THE POST REQUEST BELOW SO I CAN MANIPULATE IT
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => { // auth SHOULD BE BEFORE upload SO ONLY AUTHENTICATED USERS CAN UPLOAD FILES
    // CONVERTS THE FILE TO PNG FORMAT, REZISES IT, AND SETS THE FILE TO BINARY DATA
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avatar = buffer // STORES THE FILE ON THE USER PROFILE 
    await req.user.save()
    res.send()
}, (error, req, res, next) => { // HANDLES THE ERROR AND SENDS BACK THE ERROR MESSAGE AS A JSON
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => { // THIS WILL RENDER THE PROFILE PICTURE TO THE WEB FOR AN SPECIFIC USER ID
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png') // HEADER SET
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

// 200 HTTP CODE: SUCCESS, 400 HTTP CODE: CLIENT ERROR, 500 HTTP CODE: SERVER ERROR

module.exports = router 