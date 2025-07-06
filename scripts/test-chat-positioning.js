// Test the chat window positioning
console.log('Testing chat window positioning...')

// Simulate window dimensions
const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080
}

// Simulate chat window parameters
const windowWidth = Math.min(350, Math.max(300, mockWindow.innerWidth * 0.25)) // Should be 350
const windowHeight = 450
const padding = 20
const bottomPadding = 20

console.log('Window dimensions:', { windowWidth, windowHeight })
console.log('Screen dimensions:', mockWindow)

// Calculate how many windows can fit horizontally
const maxWindowsHorizontal = Math.floor((mockWindow.innerWidth - padding * 2) / (windowWidth + padding))
console.log('Max windows horizontal:', maxWindowsHorizontal)

// Test positioning for multiple windows
const testWindows = ['conversation1', 'conversation2', 'conversation3', 'conversation4', 'conversation5']

testWindows.forEach((conversationId, index) => {
  const horizontalIndex = index % maxWindowsHorizontal
  const verticalIndex = Math.floor(index / maxWindowsHorizontal)
  
  // Position from right to left, bottom to top
  const x = mockWindow.innerWidth - padding - (horizontalIndex + 1) * (windowWidth + padding)
  const y = mockWindow.innerHeight - bottomPadding - windowHeight - (verticalIndex * (windowHeight + padding))
  
  // Ensure window stays within screen bounds
  const finalX = Math.max(padding, Math.min(x, mockWindow.innerWidth - windowWidth - padding))
  const finalY = Math.max(padding, Math.min(y, mockWindow.innerHeight - windowHeight - bottomPadding))

  console.log(`Window ${index + 1} (${conversationId}):`, {
    horizontalIndex,
    verticalIndex,
    position: { x: finalX, y: finalY }
  })
})

console.log('✅ Chat window positioning test completed!')
