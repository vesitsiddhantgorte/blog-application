// AI Blog Summary & Recommendation Service
// Uses simple NLP for summary and keyword-based recommendations

async function generateSummary(text) {
    // Replace with OpenAI or other NLP API call
    // For demo, return first 40 words
    return text.split(' ').slice(0, 40).join(' ') + (text.split(' ').length > 40 ? '...' : '')
}

async function getRecommendedBlogs(currentBlog, allBlogs) {
    // Simple keyword-based recommendation
    const keywords = currentBlog.title.toLowerCase().split(' ').filter(w => w.length > 3)
    return allBlogs.filter(blog => {
        if (blog._id.toString() === currentBlog._id.toString()) return false
        if (blog.status && blog.status !== 'published') return false
        return keywords.some(word =>
            blog.title.toLowerCase().includes(word) || blog.body.toLowerCase().includes(word)
        )
    }).slice(0, 3)
}

module.exports = {
    generateSummary,
    getRecommendedBlogs,
}
