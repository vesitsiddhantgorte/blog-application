const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
dotenv.config({ path: '.env' })

const userRoute = require('./routes/user')
const blogRoute = require('./routes/blog')
const adminRoute = require('./routes/admin')
const Blog = require('./models/blog')

const { checkForAuthenticationCookie } = require('./middlewares/authentication')

const app = express()
const PORT = process.env.PORT

// Import scheduler for scheduled publishing
require('./services/scheduler')

mongoose.connect(process.env.MONGO_URL)

.then(e => console.log('MongoDB connected'))

app.set('view engine', 'ejs')
app.set('views', path.resolve('./views'))

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(checkForAuthenticationCookie('token'))
app.use(express.static(path.resolve('./public')))

app.get('/', async (req, res) => {
    // Published blogs visible to everyone
    const publishedBlogs = await Blog.find({ status: 'published' }).populate('createdBy').sort({ publishedAt: -1 })
    // Drafts & scheduled visible only to their owner
    let myBlogs = []
    if (req.user) {
        myBlogs = await Blog.find({
            createdBy: req.user._id,
            status: { $in: ['draft', 'scheduled'] }
        }).sort({ updatedAt: -1 })
    }
    res.render('home', {
        user: req.user,
        blogs: publishedBlogs,
        myBlogs,
    })
})

app.use('/user', userRoute)
app.use('/blog', blogRoute)
app.use('/admin', adminRoute)

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))