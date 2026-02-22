// Scheduled publishing job using node-cron
const cron = require('node-cron')
const Blog = require('../models/blog')

// Runs every minute
cron.schedule('* * * * *', async () => {
    const now = new Date()
    // Find blogs scheduled for publishing
    const scheduledBlogs = await Blog.find({ status: 'scheduled', scheduledPublishAt: { $lte: now } })
    for (const blog of scheduledBlogs) {
        blog.status = 'published'
        blog.publishedAt = now
        await blog.save()
        console.log(`Published scheduled blog: ${blog.title}`)
    }
})

module.exports = {}