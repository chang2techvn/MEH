import { db } from '../lib/db'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await db.$connect()
    console.log('✅ Database connected successfully!')
    
    // Test query
    const userCount = await db.user.count()
    console.log(`📊 Current user count: ${userCount}`)
    
    // Test creating a sample user (you can delete this later)
    console.log('Creating sample user...')
    const sampleUser = await db.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER',
        studentId: 'TEST001'
      }
    })
    console.log('✅ Sample user created:', sampleUser.id)
    
    // Test reading the user
    const user = await db.user.findUnique({
      where: { email: 'test@example.com' }
    })
    console.log('✅ User retrieved:', user?.name)
    
    // Clean up - delete the test user
    if (user) {
      await db.user.delete({
        where: { id: user.id }
      })
      console.log('✅ Test user cleaned up')
    }
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testConnection()
