# SeedAI Event Planner

A retro-styled event planning tool that guides users through six phases to create comprehensive event proposals.

## 🚀 Deploy to Get a Shareable URL

### Option A: Using Vercel (Easiest - 5 minutes)

#### Step 1: Create a GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Click "Sign up" and follow the prompts
3. Verify your email

#### Step 2: Create a New Repository
1. Once logged into GitHub, click the **+** icon in the top right
2. Select **"New repository"**
3. Fill in:
   - Repository name: `seedai-event-planner`
   - Description: `Event planning tool for SeedAI team`
   - Select **Public** or **Private** (your choice)
4. Click **"Create repository"**

#### Step 3: Upload These Files
1. On your new repository page, click **"uploading an existing file"** link
2. Drag and drop ALL the files from this folder:
   - `package.json`
   - `.gitignore`
   - `public/` folder (with index.html inside)
   - `src/` folder (with index.js and App.js inside)
3. Click **"Commit changes"**

#### Step 4: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub
4. Click **"Add New..."** → **"Project"**
5. Find and select `seedai-event-planner` from the list
6. Click **"Deploy"**
7. Wait 1-2 minutes for the build
8. **Done!** You'll get a URL like: `https://seedai-event-planner.vercel.app`

#### Step 5: Share with Your Team
Send the URL to your team. They can bookmark it and use it anytime!

---

### Option B: Using Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select GitHub → Choose your `seedai-event-planner` repo
5. Build settings (should auto-detect, but verify):
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click **"Deploy site"**
7. Get URL like: `https://seedai-event-planner.netlify.app`

---

## 💾 How Save/Resume Works

### Where is data saved?
Data is saved in **localStorage** — this is storage built into every web browser.

### What does this mean for users?

| Scenario | What Happens |
|----------|--------------|
| Same person, same browser, same device | ✅ Can resume their work |
| Same person, different browser | ❌ Starts fresh (Chrome vs Firefox are separate) |
| Same person, different device | ❌ Starts fresh (phone vs laptop are separate) |
| Different people, same device | ⚠️ They share the same save slot |
| Clear browser data / cookies | ❌ Save is deleted |

### Key Points:
- **Auto-saves** every 2 seconds while working
- **CONTINUE button** appears if saved data exists
- **One save slot per browser** — starting a "New Event" erases the previous save
- **Data stays on the user's device** — it's never sent to a server

### Is this a problem?
For most use cases, no! Each team member uses their own device/browser, so they each have their own save. The typical workflow is:

1. Stuart starts a proposal on his laptop → auto-saves
2. Stuart closes browser, goes to lunch
3. Stuart returns, opens URL → clicks CONTINUE → resumes where he left off
4. Stuart finishes → exports → shares with team
5. Stuart clicks NEW EVENT → old save is cleared → starts next event

---

## 🔄 How to Update the App

After deployment, any changes you make will automatically go live:

1. Go to your GitHub repository
2. Navigate to the file you want to edit (e.g., `src/App.js`)
3. Click the **pencil icon** to edit
4. Make your changes
5. Click **"Commit changes"**
6. Vercel/Netlify automatically redeploys (1-2 minutes)
7. Refresh the URL to see changes

### Common Updates

#### Change Budget Assumptions
Edit `src/App.js`, find `BUDGET_CONFIG` near the top:

```javascript
const BUDGET_CONFIG = {
  venue: {
    "Under 25 (intimate)": 1500,  // ← Change these numbers
    "25-50 (small)": 3000,
    ...
  },
  ...
};
```

#### Add/Edit Questions
Find the `phases` array in `src/App.js`:

```javascript
const phases = [
  { id: 1, name: "THE SPARK", ..., questions: [
    { id: "event_name", label: "What would you call this event?", type: "text", placeholder: "..." },
    // Add new questions here
  ]},
  ...
];
```

#### Add a Team Member Character
1. Find `getCharacterSvg` function
2. Add new character SVG
3. Add name to `charNames` object
4. Add to character selection array

---

## 📁 File Structure

```
seedai-event-planner/
├── package.json          # Project config & dependencies
├── .gitignore            # Files to ignore in git
├── public/
│   └── index.html        # HTML template
└── src/
    ├── index.js          # React entry point
    └── App.js            # Main application (all the planner code)
```

---

## 🛠 Local Development (Optional)

If you want to run it locally for testing:

```bash
# Install Node.js from https://nodejs.org first

# Then in this folder:
npm install
npm start

# Opens at http://localhost:3000
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails on Vercel | Check for syntax errors in App.js |
| Changes not showing | Clear browser cache or wait 2 min |
| Sounds not working | Click anywhere on page first (browser security) |
| Save not working | Check if browser allows localStorage |
| "Module not found" error | Make sure all files are uploaded correctly |

---

## 📞 Support

Paste any error messages or code sections into Claude for help!
