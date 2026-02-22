const { Router } = require('express')
const User = require('../models/user')
const Blog = require('../models/blog')

const router = Router()

// Middleware: require ADMIN role
function requireAdmin(req, res, next) {
    if (!req.user) return res.redirect('/user/signin')
    if (req.user.role !== 'ADMIN') return res.status(403).render('403', { user: req.user })
    next()
}

router.use(requireAdmin)

// Dashboard
router.get('/', async (req, res) => {
    const totalUsers = await User.countDocuments()
    const totalBlogs = await Blog.countDocuments()
    const published = await Blog.countDocuments({ status: 'published' })
    const drafts = await Blog.countDocuments({ status: 'draft' })
    const scheduled = await Blog.countDocuments({ status: 'scheduled' })
    const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'fullName')
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5)
    res.render('admin/dashboard', {
        user: req.user,
        stats: { totalUsers, totalBlogs, published, drafts, scheduled },
        recentBlogs,
        recentUsers,
    })
})

// All Users
router.get('/users', async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 })
    res.render('admin/users', { user: req.user, users })
})

// Change user role
router.post('/users/:id/role', async (req, res) => {
    const { role } = req.body
    if (!['USER', 'ADMIN'].includes(role)) return res.redirect('/admin/users')
    await User.findByIdAndUpdate(req.params.id, { role })
    res.redirect('/admin/users')
})

// Delete user
router.post('/users/:id/delete', async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
    await Blog.deleteMany({ createdBy: req.params.id })
    res.redirect('/admin/users')
})

// All Blogs
router.get('/blogs', async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate('createdBy', 'fullName')
    res.render('admin/blogs', { user: req.user, blogs })
})

// Change blog status
router.post('/blogs/:id/status', async (req, res) => {
    const { status } = req.body
    const update = { status }
    if (status === 'published') update.publishedAt = new Date()
    await Blog.findByIdAndUpdate(req.params.id, update)
    res.redirect('/admin/blogs')
})

// Delete blog
router.post('/blogs/:id/delete', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id)
    res.redirect('/admin/blogs')
})

module.exports = router
