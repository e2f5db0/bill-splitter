#!/usr/bin/env node

const bcrypt = require('bcrypt')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Hide password input
function hideInput() {
  const stdin = process.stdin
  if (stdin.isTTY) {
    stdin.setRawMode(true)
  }
}

function showInput() {
  const stdin = process.stdin
  if (stdin.isTTY) {
    stdin.setRawMode(false)
  }
}

async function promptPassword(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt)
    hideInput()
    
    let password = ''
    
    // Remove all existing 'data' listeners to prevent accumulation
    process.stdin.removeAllListeners('data')
    
    // Resume stdin in case it was paused by a previous call
    process.stdin.resume()
    
    const onData = (char) => {
      char = char.toString()
      
      if (char === '\n' || char === '\r' || char === '\u0004') {
        showInput()
        process.stdin.removeListener('data', onData)  // Clean up this listener
        process.stdin.pause()
        process.stdout.write('\n')
        resolve(password)
      } else if (char === '\u0003') {
        // Ctrl+C
        showInput()
        process.stdin.removeListener('data', onData)
        process.stdout.write('\n')
        process.exit(0)
      } else if (char === '\u007f' || char === '\b') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1)
          process.stdout.write('\b \b')
        }
      } else {
        password += char
        process.stdout.write('*')
      }
    }
    
    process.stdin.on('data', onData)
  })
}

async function setupPassword() {
  console.log('========================================')
  console.log('Bill Splitter - Password Setup')
  console.log('========================================')
  console.log('')
  console.log('This utility will help you set up a secure login password.')
  console.log('The password will be hashed using bcrypt and stored in your .env file.')
  console.log('')
  
  try {
    // Get password
    const password = await promptPassword('Enter new login password: ')
    
    if (!password || password.length === 0) {
      console.error('\nError: Password cannot be empty')
      process.exit(1)
    }
    
    if (password.length < 8) {
      console.log('\nWarning: Password is shorter than 8 characters. Consider using a longer password.')
      const answer = await new Promise((resolve) => {
        rl.question('Continue anyway? (y/N) ', resolve)
      })
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Password setup cancelled.')
        process.exit(0)
      }
    }
    
    // Confirm password
    const confirmPassword = await promptPassword('Confirm password: ')
    
    if (password !== confirmPassword) {
      console.error('\nError: Passwords do not match')
      process.exit(1)
    }
    
    console.log('\nGenerating bcrypt hash...')
    
    // Generate hash
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    
    console.log('\n========================================')
    console.log('Password hash generated successfully!')
    console.log('========================================')
    console.log('')
    console.log('Add this line to your backend/.env file:')
    console.log('')
    console.log(`LOGIN_PASSWORD_HASH=${hash}`)
    console.log('')
    console.log('Note: You may see a Docker Compose warning about undefined variables.')
    console.log('This is harmless and can be safely ignored - the hash will work correctly.')
    console.log('')
    
    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\nError:', error.message)
    rl.close()
    process.exit(1)
  }
}

// Run the setup
setupPassword()
