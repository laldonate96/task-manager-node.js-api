// STARTS THE SERVER WITH EXPRESS BY CALLING app.listen
const app = require('./app')
const port = process.env.PORT 

app.listen(port, () => {
    console.log('Sever is up on port ' + port)
})