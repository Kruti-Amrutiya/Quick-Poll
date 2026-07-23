# QuickPoll - Real-Time Voting Dashboard

**Live Demo**: [https://quick-poll-two.vercel.app/](https://quick-poll-two.vercel.app/)

QuickPoll is a responsive, feature-rich React SPA built with **Vite**, **React 19**, and **React Router DOM**. It provides a glassmorphic dashboard for creating polls, casting votes with protection, and visualizing results via smooth, animated custom progress bars in real-time.

---

## 🎨 Features & Functionalities

### 1. Poll Creation & Validation
* **Options Count**: Dynamically add and remove choices (minimum 2, maximum 5 options).
* **Expiration Date**: Set an optional future expiration date/time.
* **Form Validation**:
  * All fields (Question and at least 2 options) are required.
  * Checks for duplicate option values (case-insensitive) to prevent voting confusion.
  * Ensures expiration dates, if set, are strictly in the future.
* **Link Generation**: Upon submit, generates a unique, shareable link (e.g. `/poll/:id`) and automatically copies it to the clipboard.

### 2. Single-Click Voting & Protection
* Render poll options with dynamic, hover-animated choice cards.
* Vote with one-click selection.
* **Double-Vote Protection**: Saves voted polls in browser `localStorage` to lock the device out of multiple votes on the same poll.

### 3. Live Updating Results (Simulation)
* When viewing a poll's results, a mock simulation runs in the background (every 5 seconds) randomly adding votes to other options.
* **SVG Animated Bars**: Custom styled SVG-like progress tracks transition fluidly (`transition: width 0.7s cubic-bezier(...)`) as vote counts grow live.
* **Voted Highlight**: Highlights the user's voted option in a distinct green gradient with a `"YOUR VOTE"` badge.

### 4. Interactive Polls Directory
* Navigate to `/polls` to search all created polls.
* Search filter checks questions in real-time.
* Displays status badges (Active vs. Expired) and total vote counts.

### 5. Bonus Polish
* **CSV Exporter**: Click "Export CSV" to download poll question, meta info, option breakdowns, and vote percentages in CSV format.
* **Theme Switcher**: Instant light/dark theme toggle utilizing CSS variables.
* **Voter Stats**: Computes total votes, leading options, and expiration countdown timers.
* **Mobile-First Responsive Layout**: Adapts gracefully to all smartphones, tablets, and desktop displays.

---

## 🚀 How to Run Locally

### 1. Prerequisite
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Installation
Navigate to the project folder and install dependencies:
```bash
cd /home/tntra/Projects/quick-poll
npm install
```

### 3. Run Development Server
Start the Vite local development server:
```bash
npm run dev
```
Open the printed URL (usually `http://localhost:5173`) in your browser to experience the application!

### 4. Compile Production Build
Ensure code compiles cleanly with no compiler warnings:
```bash
npm run build
```
The output will compile to `/home/tntra/Projects/quick-poll/dist/`.
