const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    courseTeacher: {
        type: String,
        required: true,
    },
    courseId: {
        type: String,
        required: true,
    },
    courseCredit: {
        type: String,
        required: true,
    }
});

const Course = mongoose.model('course', CourseSchema);

module.exports = Course;