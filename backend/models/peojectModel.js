const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    project_id: {
        type: String,
        required: true,
        unique: true,
    },
    project_title: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        enum: ['Designing', 'Development', 'Testing', 'Marketing', 'Accounts'],
        required: true,
    },
    project_priority: {
        type: Number,
        required: true,
    },
    client: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    project_start_date: {
        type: Date,
        required: true,
    },
    project_end_date: {
        type: Date,
        required: true,
    },
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    }],
    work_status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        required: true,
    },
    descriptions: {
        type: String,
    },
    image: {
        type: String,
    }
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
