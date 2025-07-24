const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user.js')


router.get('/', (req, res) => {
    res.send('✅ Auth route is working')
})


router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs')
})

router.post('/sign-up', async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username })
        if (existingUser) {
            return res.send(' Username already taken.')
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.send(' Password and confirm password must match.')
        }

        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        const newUser = await User.create({
            username: req.body.username,
            password: hashedPassword
        })

        req.session.user = {
            username: newUser.username,
            _id: newUser._id,
        }

        req.session.save(() => {
            res.redirect('/recipes') 
        })

    } catch (error) {
        console.error(error)
        res.send(' Somethig wrong.')
    }
})


router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in.ejs')
})


router.post('/sign-in', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        if (!user) {
            return res.send(' Login failed. User not found.')
        }

        const passwordMatch = bcrypt.compareSync(req.body.password, user.password)
        if (!passwordMatch) {
            return res.send(' Login failed. Incorrect password.')
        }

        req.session.user = {
            username: user.username,
            _id: user._id,
        }

        req.session.save(() => {
            res.redirect('/recipes') 
        })

    } catch (error) {
        console.error(error)
        res.send(' Error logging in.')
    }
})


router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

module.exports = router
