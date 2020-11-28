const User = require('../models/userModel');
const Course = require('../models/courseModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { roles } = require('../roles');
const { ObjectId } = require('mongodb');

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res, next) => {
    try {
        const { username, password, role } = req.body
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ username, password: hashedPassword, role: role || "student" });
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        newUser.accessToken = accessToken;
        await newUser.save();
        res.json({
            data: newUser,
            accessToken
        })
    } catch (error) {
        next(error)
    }
}


exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return next(new Error('Username does not exist'));
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return next(new Error('Password is not correct'))
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        await User.findByIdAndUpdate(user._id, { accessToken })
        res.status(200).json({
            data: { username: user.username, role: user.role, success: true },
            accessToken
        })
    } catch (error) {
        next(error);
    }
}

exports.getUsers = async (req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        data: users
    });
}

exports.getUser = async (req, res, next) => {
    try {
        const role = req.params.role;
        const user = await User.find({role: role});
        if (!user) return next(new Error('User does not exist'));
        res.status(200).json({
            data: user
        });
    } catch (error) {
        next(error)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const update = req.body
        const userId = req.params.userId;
        await User.findByIdAndUpdate(userId, update);
        const user = await User.findById(userId)
        res.status(200).json({
            data: user,
            message: 'User has been updated'
        });
    } catch (error) {
        next(error)
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        await User.findByIdAndDelete({_id: ObjectId(userId)});
        res.status(200).json({
            data: null,
            message: 'User has been deleted'
        });
    } catch (error) {
        next(error)
    }
}

exports.grantAccess = function (action, resource) {
    return async (req, res, next) => {
        try {
            const permission = roles.can(req.user.role)[action](resource);
            if (!permission.granted) {
                return res.status(401).json({
                    error: "You don't have enough permission to perform this action"
                });
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

exports.allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if (!user)
            return res.status(401).json({
                error: "You need to be logged in to access this route"
            });
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

exports.addCourse = async (req, res, next) => {
    try {
        const { name, instructor, img } = req.body
        const newCourse = new Course({ name, instructor, img });
        await newCourse.save();
        res.json({
            data: newCourse,
            success: 'course created successfully!'
        })
    } catch (error) {
        next(error);
    }
}

exports.createCourse = async (req, res, next) => {
    try {
        console.log(req.body);
        const { courseName, courseId, courseTeacher, courseCredit } = req.body
        const newCourse = new Course({ courseName, courseId, courseTeacher, courseCredit });
        await newCourse.save();
        res.json({
            data: newCourse,
            success: true
        })
    } catch (error) {
        res.json({
            success: false
        })
        next(error);
    }
}

exports.getCourse = async (req, res, next) => {
    try {
        const courses = await Course.find({});
        res.status(200).json({
        data: courses
    });
    } catch (error) {
        next(error)
    }
}