// SCRIPT TO SEND WELCOME AND CANCELATION EMAILS
const mailgun = require('mailgun-js')
const DOMAIN = 'sandbox3e4b76abe76440eaa42b6f796d041e18.mailgun.org'
const api_key = process.env.MAILGUN_API_KEY

const mg = mailgun({ apiKey: api_key, domain: DOMAIN })

const sendWelcomeEmail = (email, name) => {
    mg.messages().send({
        to: email,
        from: 'me@samples.mailgun.org',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`, // SIMILAR TO print(f'') IN PYTHON
    })
}

const sendCancelationEmail = (email, name) => {
    mg.messages().send({
        to: email,
        from: 'me@samples.mailgun.org',
        subject: 'Account cancelation',
        text: `Goodbye, ${name}! Is there anything we could have done to kept you on board?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}


// EXAMPLE
// const data = {
//     from: 'Excited User <me@samples.mailgun.org>',
//     to: 'cryptokradd@gmail.com',
//     subject: 'Hello',
//     text: 'Testing some Mailgun awesomeness!'
// }

// mg.messages().send(data, function (error, body) {
//     console.log(body)
// })