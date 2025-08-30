#!/usr/bin/env node
/**
 * Interactive Reddit API setup script
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function setupRedditAPI() {
  console.log('🔍 Reddit API Setup for Test Worker');
  console.log('=' .repeat(40));
  
  console.log('\n📋 Before we start:');
  console.log('1. Go to https://www.reddit.com/prefs/apps');
  console.log('2. Create a new app (type: "script")');
  console.log('3. Note down your Client ID and Client Secret');
  console.log('4. Come back here with those credentials\n');
  
  const ready = await question('Are you ready with Reddit credentials? (y/n): ');
  if (ready.toLowerCase() !== 'y') {
    console.log('👋 Come back when you have your Reddit app credentials!');
    rl.close();
    return;
  }
  
  console.log('\n🔑 Setting up credentials...');
  
  // Get Client ID
  const clientId = await question('\n📝 Enter your Reddit Client ID: ');
  if (!clientId.trim()) {
    console.log('❌ Client ID is required');
    rl.close();
    return;
  }
  
  // Get Client Secret
  const clientSecret = await question('📝 Enter your Reddit Client Secret: ');
  if (!clientSecret.trim()) {
    console.log('❌ Client Secret is required');
    rl.close();
    return;
  }
  
  rl.close();
  
  console.log('\n🚀 Setting up Cloudflare Worker secrets...');
  
  try {
    // Set Client ID
    console.log('Setting REDDIT_CLIENT_ID...');
    execSync(`echo "${clientId}" | npx wrangler secret put REDDIT_CLIENT_ID --env test`, {
      stdio: 'inherit'
    });
    
    // Set Client Secret
    console.log('Setting REDDIT_CLIENT_SECRET...');
    execSync(`echo "${clientSecret}" | npx wrangler secret put REDDIT_CLIENT_SECRET --env test`, {
      stdio: 'inherit'
    });
    
    console.log('\n✅ Secrets configured successfully!');
    
    // Redeploy
    console.log('\n🚀 Redeploying worker...');
    execSync('npm run deploy', { stdio: 'inherit' });
    
    console.log('\n🎉 Setup complete!');
    console.log('\n🧪 Testing Reddit API...');
    
    // Run test
    setTimeout(() => {
      try {
        execSync('node test-reddit-api.js', { stdio: 'inherit' });
      } catch (error) {
        console.log('\n⚠️  Test failed, but you can run it manually:');
        console.log('   node test-reddit-api.js');
      }
    }, 2000);
    
  } catch (error) {
    console.log(`\n❌ Setup failed: ${error.message}`);
    console.log('\n🔧 Manual setup:');
    console.log(`   npx wrangler secret put REDDIT_CLIENT_ID --env test`);
    console.log(`   npx wrangler secret put REDDIT_CLIENT_SECRET --env test`);
    console.log(`   npm run deploy`);
  }
}

setupRedditAPI().catch(console.error);
















