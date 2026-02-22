// Usage: node scripts/makeAdmin.js <email>
// Example: node scripts/makeAdmin.js john@example.com

const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: '.env' })

const User = require('../models/user')

const email = process.argv[2]

if (!email) {
    console.error('❌ Please provide an email.\n   Usage: node scripts/makeAdmin.js <email>')
    process.exit(1)
}

mongoose.connect(process.env.MONGO_URL).then(async () => {
    const user = await User.findOneAndUpdate(
        { email },
        { role: 'ADMIN' },
        { new: true }
    )
    if (!user) {
        console.error(`❌ No user found with email: ${email}`)
    } else {
        console.log(`✅ ${user.fullName} (${user.email}) is now an ADMIN.`)
    }
    process.exit(0)
}).catch(err => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
})
