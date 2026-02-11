# Jeopardy! - Book of Mormon Edition
## Getting This Running Tonight (Step by Step for Non-Coders)

---

## OPTION A: Run on Your Laptop (Best if Everyone is in the Same Room)

This is the simplest approach. Your laptop runs the game, and everyone connects to it on their phones via Wi-Fi.

### Step 1: Install Node.js (one-time, takes 2 minutes)
1. Go to **https://nodejs.org**
2. Click the big green **LTS** download button
3. Run the installer, just click "Next" through everything until it finishes

### Step 2: Set up the game (takes 1 minute)
1. Download and unzip the `jeopardy` folder from this chat
2. Open **Terminal** (Mac) or **Command Prompt** (Windows):
   - **Mac**: Press Cmd+Space, type "Terminal", hit Enter
   - **Windows**: Press the Windows key, type "cmd", hit Enter
3. Type this command to navigate to the folder (adjust path if needed):
   ```
   cd Downloads/jeopardy
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the game:
   ```
   node server.js
   ```
6. You should see: **"Jeopardy server running on port 3000"**
7. Open your browser to **http://localhost:3000** and you should see the game!

### Step 3: Find your laptop's IP address so players can connect
- **Mac**: Click the Apple menu > System Settings > Wi-Fi > click "Details" next to your network > your IP is listed (looks like 192.168.x.x)
- **Windows**: In the same Command Prompt, open a new window and type `ipconfig`. Look for "IPv4 Address" under your Wi-Fi adapter (looks like 192.168.x.x)

### Step 4: Tell players to connect
- On their phones, open any browser (Safari, Chrome, etc.)
- Go to: **http://YOUR_IP:3000**
  - Example: if your IP is 192.168.1.42, they type **http://192.168.1.42:3000**
- They tap "Player," enter their name, and they're in!

**Important**: Everyone must be on the SAME Wi-Fi network.

---

## OPTION B: Deploy to Render.com (Best if Players are Remote)

Render.com gives you a free public URL that anyone can access from anywhere. It requires a GitHub account, but I'll walk you through it.

### Step 1: Create a GitHub account (skip if you have one)
1. Go to **https://github.com** and sign up (free)

### Step 2: Create a new repository
1. Once logged in, click the **"+"** button in the top right > **"New repository"**
2. Name it **jeopardy**
3. Make sure "Public" is selected
4. Click **"Create repository"**
5. On the next page, click **"uploading an existing file"** (it's a small link in the instructions)
6. Drag and drop ALL the files from the jeopardy folder:
   - `server.js`
   - `package.json`
   - The entire `public` folder (with index.html, admin.html, player.html, setup.html)
7. Click **"Commit changes"** at the bottom

### Step 3: Deploy on Render
1. Go to **https://render.com** and sign up using your GitHub account
2. Click **"New +"** in the top right > **"Web Service"**
3. It will ask to connect your GitHub. Allow it access to your jeopardy repo
4. Select your **jeopardy** repository
5. Fill in:
   - **Name**: anything you want (like "bom-jeopardy")
   - **Region**: pick the closest one to you
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Under "Instance Type," select **Free**
7. Click **"Deploy Web Service"**
8. Wait 2-3 minutes while it builds
9. You'll get a URL like **https://bom-jeopardy.onrender.com**
10. Share that URL with everyone!

**Note**: The free tier "sleeps" after 15 minutes of no activity. The first person to visit may wait 30-60 seconds for it to wake up. After that it stays active.

---

## How to Play Tonight

1. **You** open the Game Master view on your laptop (click "Game Master" or go to `/admin.html`)
2. **Project it** onto a TV/screen if you can, so everyone can see the board
3. **Players** open the Player view on their phones (click "Player" or go to `/player.html`)
4. Each player enters their name
5. You click a dollar value on the board to reveal the question
6. Read the question out loud, then click **"Open Buzzers"**
7. Players tap the big red button on their phone to buzz in
8. The buzz order panel on the right shows who was first
9. Click the green checkmark for correct, red X for wrong (deducts points)
10. Click **"Show Answer"** to reveal it, then **"Back to Board"** for the next question

### Quick Tips
- The scoreboard tracks everything automatically
- You can manually adjust scores with the +/- buttons next to each player's name
- "Reset Game" in the top right starts everything fresh
- You can edit questions live at the Setup page if you spot a typo

---

## Your Categories Tonight
1. "Ship" Happens
2. Dream a Little Dream
3. Weapons of War
4. Name That "City"
5. "A" is for Ancient
6. The "Small" Plates
