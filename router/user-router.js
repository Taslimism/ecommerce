const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('./../model/user-model');

const router = express.Router();
dotenv.config();

router.post('/register', async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            status: 'fail',
            data: {
                message: 'Please fill in all the fields'
            }
        })
    }

    try {
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(200).json({
                status: 'success',
                data: {
                    user: user
                }
            })
        }
    } catch (err) {

    }

    let newUser;
    try {
        const hash = await bcrypt.hash(password, 12);
        if (hash) {
            newUser = new User({
                name: name,
                email: email,
                password: hash
            })
            newUser.save()
                .then(data => console.log(data))
                .catch(err => {
                    throw err;
                });
        }

    } catch (err) {
        console.log(err)
        return res.json(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occured'
            }
        })
    }

    let token
    try {
        token = jwt.sign({ email: email }, process.env.MY_SUPER_SECRET_KEY, { expiresIn: '90d' });
    } catch (err) {
        console.log(err);
        return res.json(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occured'
            }
        })
    }

    return res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    })


})


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: 'fail',
            data: {
                message: 'Please fill in all the fields'
            }
        })
    }

    let user;
    let isAuthenticated
    try {
        user = await User.findOne({ email: email });
        if (!user) {
            throw new Error();
        }

        isAuthenticated = await bcrypt.compare(password, user.password);

    } catch (err) {

        return res.status(500).json({
            status: 'fail',

            data: {
                message: 'An unknown error occured'
            }
        })
    }
    if (!isAuthenticated) {
        return res.status(401).json({
            status: 'fail',
            data: {
                message: 'Please enter a valid password'
            }
        })
    }

    let token;
    try {
        token = await jwt.sign({ email: email }, process.env.MY_SUPER_SECRET_KEY, { expiresIn: '90d' });

    } catch (err) {
        return res.json(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occured'
            }
        })
    }

    res.status(200).json({
        status: 'success',
        token: token,
        data: {
            user: user
        }
    })

})


router.get('/:id', async (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params);
    try {
        const user = await User.find({ _id: id });
        const orders = await User.find({ _id: id });
        return res.status(200).json({
            status: 'success',
            data: {
                user: user,
                orders: orders
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "fail",
            data: {
                message: 'An unknown error occured'
            }
        })
    }
})


router.put('/:id', async (req, res) => {
    const id = mongoose.Types.ObjectId(req.params);
    const { name, password } = req.body;

    try {
        if (name) {
            const user = await User.findByIdAndUpdate(id, { $set: { name: name, updatedAt: new Date().getTime() } }, { new: true });
        }
        if (password) {
            const user = await User.findByIdAndUpdate(id, { $set: { password: password, updatedAt: new Date().getTime() } }, { new: true });
        }
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occured '
            }
        })
    }
})

router.delete('/:id', async (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params);
    try {
        await User.findByIdAndDelete(id);
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occured '
            }
        })
    }

    return res.status(204);
})

module.exports = router;