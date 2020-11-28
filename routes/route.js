const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', (req, res) => {
    res.send('server is up and running');
})

router.post('/signup', userController.signup);
 
router.post('/login', userController.login);

router.get('/course', userController.getCourse);
router.post('/addCourse', userController.addCourse);
router.post('/createCourse', userController.createCourse);

router.get('/user/:role', userController.getUser);
 
router.get('/users', userController.getUsers);
 
router.put('/user/:userId', userController.updateUser);
 
router.delete('/user/:userId', userController.deleteUser);
 
module.exports = router;