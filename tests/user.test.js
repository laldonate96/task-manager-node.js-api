// NO NEED TO LISTEN WITH EXPRESS TO TEST THE HTTP REQUESTS, THAT IS WHY I REQUIRE APP AND NOT INDEX
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase) // BEFORE EACH TEST

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Lucas',
        email: 'lucas@example.com',
        password: 'Mypass777!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull() // CHECKS THAT THE USER EXISTS IN THE DATABASE

    // Assertions about the response
    expect(response.body).toMatchObject({ // CHECKS THAT THE WRITTEN USER FIELDS MATCH THE ONE STORED IN THE DATABASE
        user: {
            name: 'Lucas',
            email: 'lucas@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('Mypass777!') // THIS CHECKS THAT THE PASSWORD WAS CORRECTLY ENCRYPTED
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token) // CHECKS THAT THE LOGIN TOKEN OF THE RESPONDE MATCHES THE SECOND TOKEN IN THE USER'S TOKENS ARRAY
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'Jess', // Jess IS A NONEXISTENT USER IN THE DATABASE
        password: userOne.password
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`) // SETS THE AUTHORIZATION HEADER
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user).toBeNull() // CHECKS THAT THE USER IS NULL, THAT MEANS IT WAS DELETED 
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jess'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Jess')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Buenos Aires'
        })
        .expect(400)
})