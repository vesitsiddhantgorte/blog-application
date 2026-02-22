const { Schema, model } = require('mongoose')

const blogSchema = new Schema({
    title: { 
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    coverImageURL: {
        type: String,
        required: false,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    summary: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'published'],
        default: 'draft',
    },
    scheduledPublishAt: {
        type: Date,
        default: null,
    },
    publishedAt: {
        type: Date,
        default: null,
    },
    recommendations: [{
        type: Schema.Types.ObjectId,
        ref: 'blog',
    }],
}, { timestamps : true}
)

const Blog = model('blog', blogSchema)

module.exports = Blog
