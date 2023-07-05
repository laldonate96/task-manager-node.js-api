const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body) // CHANGED FOR THE ONE BELOW AFTER IMPLEMENTING AUTH AND OWNER TO RELATE USERS WITH TASKS
    const task = new Task({
        ...req.body, // THIS WILL COPY ALL THE PROPERTIES FROM THE TASK CREATED
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }


    // OLD PROMISE, CHANGED FOR THE ASYNC ABOVE!!
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((e) => {
    //     res.status(400).send()
    // })
})

// GET /tasks?completed=false
// GET /tasks?limit=10&skip=0 skip SKIPS THE FIRST X ELEMENTS
// GET /tasks?sortBy=createdAt_asc (can replace _ for : or wahtever symbol)
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true' // I HAVE TO SET COMPLETED INTO A STRING, NOT INTO A BOOLEAN
    }
    
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 // IF === IS TRUE IT TAKES THE -1 VALUE, ELSE IT TAKES THE 1 VALUE
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: { // options CAN BE USED FOR PAGINATION AND SORTING
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
        // OTHER WAY TO GET THESE TASKS
        // const tasks = await Task.find({ owner: req.user._id })
        // res.send(tasks)
    } catch(e) {
        res.status(500).send()
    }

    // OLD PROMISE, CHANGED FOR THE ASYNC ABOVE!!
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
})

router.get('/tasks/:id', auth, async (req, res) => { // REQUEST FOR A DYNAMIC VALUE (:id IS WHATEVER IT WAS PUT IN THE REQUEST)
    const _id = req.params.id

    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id }) // I WILL ONLY GET A TASK IF THE USER IS THE OWNER OF THAT TASK

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send()
    }
    

    // OLD PROMISE, CHANGED FOR THE ASYNC ABOVE!!
    // Task.findById(_id).then((task) => { // MONGOOSE CONVERTS THE STRINGS IDS TO OBJECT IDS AUTOMATICALLY
    //     if (!task) {
    //         return res.status(404).send()
    //     }

    //     res.send(task)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body) // SHOWS THE KEYS OF AN OBJECT 
    const allowedUpdates = ['description', 'completed'] // ONLY ELEMENTS THE USER CAN UPDATE
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // IT IS CALLED ONE TIME FOR EVERY ITEM IN THE ARRAY (RETURNS TRUE IF EVERY CALL RETURNS TRUE)

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        // const task = await Task.findById(req.params.id)

        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) // new: true RETURNS THE NEW USER OVERWRITING THE ORIGINAL ONE

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth,  async(req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)

        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

// 200 HTTP CODE: SUCCESS, 400 HTTP CODE: CLIENT ERROR, 500 HTTP CODE: SERVER ERROR

module.exports = router