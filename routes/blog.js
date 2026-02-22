const { Router } = require('express')
const multer = require('multer')
const path = require('path')

const Blog = require('../models/blog')
const Comment = require('../models/comment')
const { generateSummary, getRecommendedBlogs } = require('../services/aiBlog')

const router = Router()

// Middleware: require authenticated user
function requireAuth(req, res, next) {
    if (!req.user) return res.redirect('/user/signin')
    next()
}

// Middleware: require blog ownership (for edit/update) — admins bypass
async function requireOwner(req, res, next) {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).send('Blog not found')
    if (req.user.role === 'ADMIN' || blog.createdBy.toString() === req.user._id.toString()) {
        req.blog = blog
        return next()
    }
    return res.status(403).send('Forbidden: You do not own this blog')
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads/`))
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`
        cb(null, fileName)
    }
})

const upload = multer({ storage: storage })

// Show add blog form (auth required)
router.get('/add-new', requireAuth, (req, res) => {
    return res.render('addBlog', { user: req.user })
})

// Show edit blog form (auth + ownership required)
router.get('/edit/:id', requireAuth, requireOwner, (req, res) => {
    return res.render('editBlog', { user: req.user, blog: req.blog })
})

// View a single blog
router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy').populate('recommendations', 'title _id')
    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy')
    return res.render('blog', { user: req.user, blog, comments })
})

// Post a comment (auth required)
router.post('/comment/:blogId', requireAuth, async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    })
    return res.redirect(`/blog/${req.params.blogId}`)
})

// Create a new blog (auth required)
router.post('/', requireAuth, upload.single('coverImage'), async (req, res) => {
    const { title, body, status, scheduledPublishAt } = req.body
    const summary = await generateSummary(body)
    const blogStatus = status || 'draft'
    const scheduledAt = scheduledPublishAt ? new Date(scheduledPublishAt) : null
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: req.file ? `/uploads/${req.file.filename}` : '',
        summary,
        status: blogStatus,
        scheduledPublishAt: scheduledAt,
        publishedAt: blogStatus === 'published' ? new Date() : null,
    })
    const allBlogs = await Blog.find({})
    const recommendations = await getRecommendedBlogs(blog, allBlogs)
    blog.recommendations = recommendations.map(b => b._id)
    await blog.save()
    return res.redirect(`/blog/${blog._id}`)
})

// Update an existing blog (auth + ownership required)
router.post('/update/:id', requireAuth, requireOwner, upload.single('coverImage'), async (req, res) => {
    const { title, body, status, scheduledPublishAt } = req.body
    const blog = req.blog
    blog.title = title
    blog.body = body
    blog.summary = await generateSummary(body)
    blog.status = status || blog.status
    blog.scheduledPublishAt = scheduledPublishAt ? new Date(scheduledPublishAt) : null
    if (req.file) blog.coverImageURL = `/uploads/${req.file.filename}`
    if (blog.status === 'published' && !blog.publishedAt) blog.publishedAt = new Date()
    const allBlogs = await Blog.find({})
    const recommendations = await getRecommendedBlogs(blog, allBlogs)
    blog.recommendations = recommendations.map(b => b._id)
    await blog.save()
    return res.redirect(`/blog/${blog._id}`)
})

module.exports = router
