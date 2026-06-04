# Diet Intervention Chat — Setup Guide

This guide walks you through getting the chat app live on the internet,
step by step. No programming experience needed beyond copy-pasting.

---

## What you will end up with

Your site is live at: `https://stirring-pudding-6c5283.netlify.app` that you can
link to from Positly and formr. The URL will include a condition parameter:

- Condition A (food/animal products): `https://stirring-pudding-6c5283.netlify.app?condition=A&pid=PARTICIPANT_ID`
- Condition B (firefighters/control): `https://stirring-pudding-6c5283.netlify.app?condition=B&pid=PARTICIPANT_ID`

---

## Overview of the steps

1. Create a GitHub account and upload the files
2. Create a Netlify account and connect it to GitHub
3. Add your Anthropic API key to Netlify
4. Edit `index.html` to point back to your formr survey
5. Test it
6. Link it from Positly and formr

---

## Step 1 — GitHub (storing your files)

GitHub is a website that stores code files. Think of it like a Google Drive
folder for code. Netlify will read your files from here.

1. Go to https://github.com and click **Sign up**. Create a free account.

2. Once logged in, click the **+** button in the top right → **New repository**.

3. Name it something like `diet-study-chat`. Leave all other settings as default.
   Click **Create repository**.

4. You will see a page with your empty repository. Click **uploading an existing file**.

5. Drag and drop ALL THREE items from this folder onto the upload area:
   - `index.html`
   - `netlify.toml`
   - The `netlify` folder (which contains `functions/chat.js`)

   **Important:** GitHub can't upload folders directly in the browser.
   For the `netlify/functions/chat.js` file, you need to upload it manually:
   - After uploading `index.html` and `netlify.toml`, click **Add file → Upload files** again
   - Before dropping the file, you need to create the folder path. In the file path
     box at the top, type `netlify/functions/` before the filename.
   - Alternatively: use GitHub Desktop (see tip below).

   **Easier alternative — GitHub Desktop:**
   - Download https://desktop.github.com (free app for Mac/Windows)
   - Sign in, clone your new repository to your computer
   - Copy all files into the folder on your computer
   - In GitHub Desktop, click **Commit to main** → **Push origin**
   - This handles folders correctly.

6. Click **Commit changes** (green button). Your files are now on GitHub.

---

## Step 2 — Netlify (hosting the website)

Netlify is a free hosting service. It reads your files from GitHub and
makes them into a real website.

1. Go to https://netlify.com and click **Sign up**.
   Choose **Sign up with GitHub** — this links the two accounts automatically.

2. Once logged in, click **Add new site → Import an existing project**.

3. Choose **GitHub** and find your `diet-study-chat` repository.

4. On the next screen, leave all settings as they are and click **Deploy site**.

5. Netlify will build your site in about 30 seconds. You will see a URL like
   `https://stirring-pudding-6c5283.netlify.app`. You can rename this later under
   Site settings → Change site name.

---

## Step 3 — Add your Anthropic API key (the secure part)

This is what keeps your API key safe — it lives on Netlify's servers,
not in your code files.

1. In the Netlify dashboard for your site, go to **Site configuration →
   Environment variables**.

2. Click **Add a variable**.

3. Set:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (starts with `sk-ant-...`)
     Get this from https://console.anthropic.com → API keys

4. Click **Save**.

5. Go back to your site's main page and click **Trigger deploy → Deploy site**
   so Netlify picks up the new environment variable.

**Creating a separate API key for this study (recommended):**
- Go to https://console.anthropic.com → API keys → Create key
- Name it "diet pilot study" so you can track its usage separately
- In the Usage dashboard, you can filter by this key to see exact costs
- Set a spending limit under Billing → Spend limits (e.g. $10 to be safe)

---

## Step 4 — Edit index.html to point to your formr survey

After the conversation, participants are sent back to your formr survey.
You need to tell the app where that is.

1. Open `index.html` in a text editor (Notepad on Windows, TextEdit on Mac,
   or any code editor).

2. Find this line (around line 130):
   ```
   returnUrl: "https://your-formr-survey-url-here.com",
   ```

3. Replace the URL with the actual URL of your formr post-measures run.

4. You can also change `totalRounds: 3` to a different number if you want
   more or fewer conversation exchanges.

5. Save the file, then re-upload it to GitHub (or push via GitHub Desktop).
   Netlify will automatically redeploy within about 30 seconds.

---

## Step 5 — Test it

Open these two URLs in your browser and check that both work:

- Condition A: `https://stirring-pudding-6c5283.netlify.app?condition=A&pid=test123`
- Condition B: `https://stirring-pudding-6c5283.netlify.app?condition=B&pid=test123`

You should see different intro texts and the AI should start with a different
opening message. After 3 rounds, you should see the completion code screen.

---

## Step 6 — Linking from formr and Positly

### In formr (pre-measures survey, at the very end):

Add a final page that redirects participants to the chat app.
The trick is passing their participant ID so it comes back to formr later.

In formr, you can use a pipe to pass the participant's session code.
Add a note item at the end of your pre-measures run with this as the label:

```
Please click the link below to continue to the next part of the study.
```

And this as a button or redirect URL (formr supports piping with `{{session_code}}`):

```
https://stirring-pudding-6c5283.netlify.app?condition=A&pid={{session_code}}
```

For randomisation between conditions, formr can assign condition in a hidden
variable and pipe it into the URL. Ask for help setting this up if needed.

### In Positly:

When setting up your Positly study, set the study URL to:
```
https://stirring-pudding-6c5283.netlify.app?condition=A&pid={{PROLIFIC_PID}}
```
(Positly/Prolific uses `{{PROLIFIC_PID}}` for participant IDs.)

Set the completion code to match what the app generates, or use URL-based
completion tracking.

---

## File structure overview

```
diet-study-chat/
├── index.html                  ← The chat interface participants see
├── netlify.toml                ← Tells Netlify how to run the project
└── netlify/
    └── functions/
        └── chat.js             ← The secure middleman that calls Claude
```

---

## Customising the AI prompts

The instructions given to Claude are in `index.html` in the `CONFIG` section,
under `systemPrompts`. You can edit the text there to adjust what the AI says.
Changes take effect after you re-upload to GitHub and Netlify redeploys.

---

## Troubleshooting

**"Something went wrong" error in the chat:**
- Check that your API key is correctly saved in Netlify environment variables
- Make sure you triggered a new deploy after adding the key
- Check the Netlify function logs: Functions tab → chat → View logs

**The AI gives very long responses:**
- Reduce `max_tokens: 300` to `200` in `netlify/functions/chat.js`

**I want to use a stronger model:**
- In `chat.js`, change `claude-haiku-4-5` to `claude-sonnet-4-6`
- This costs roughly 10–15× more but is more capable

---

## Questions?

Paste any error messages you see and ask for help — this guide covers the
main steps but every setup is slightly different.
