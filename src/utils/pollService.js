// Key for localStorage
const POLLS_STORAGE_KEY = 'quick_poll_polls_db';

// Helper to generate clean, short unique IDs
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Get all polls stored in localStorage
 */
export function getAllPolls() {
  try {
    const data = localStorage.getItem(POLLS_STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    // Dynamically filter out any old cached mock entries
    const filtered = parsed.filter(p => p.id !== 'react19' && p.id !== 'cssnext');
    if (filtered.length !== parsed.length) {
      localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Failed to parse polls database:', e);
    return [];
  }
}

/**
 * Save the entire polls array to localStorage
 */
function saveAllPolls(polls) {
  try {
    localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(polls));
  } catch (e) {
    console.error('Failed to save polls database:', e);
  }
}

/**
 * Find a specific poll by ID
 */
export function getPollById(id) {
  const polls = getAllPolls();
  return polls.find(p => p.id === id) || null;
}

/**
 * Create a new poll
 */
export function createPoll({ question, options, expiresAt }) {
  const polls = getAllPolls();
  const newPoll = {
    id: generateUniqueId(),
    question: question.trim(),
    options: options.map((opt, idx) => ({
      id: `opt-${idx}-${generateUniqueId()}`,
      text: opt.trim(),
      votes: 0
    })),
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
  };
  
  polls.unshift(newPoll);
  saveAllPolls(polls);
  return newPoll;
}

/**
 * Cast a vote on a poll
 */
export function castVote(pollId, optionId) {
  const polls = getAllPolls();
  const pollIndex = polls.findIndex(p => p.id === pollId);
  
  if (pollIndex === -1) return null;
  
  const poll = polls[pollIndex];
  
  // Check if already voted
  if (hasVoted(pollId)) return poll;
  
  // Check if expired
  if (isPollExpired(poll)) return poll;
  
  // Find option and increment vote
  const option = poll.options.find(opt => opt.id === optionId);
  if (option) {
    option.votes += 1;
    // Mark as voted in localStorage (value is the selected option ID)
    localStorage.setItem(`voted_poll_${pollId}`, optionId);
    
    polls[pollIndex] = poll;
    saveAllPolls(polls);
  }
  
  return poll;
}

/**
 * Check if the current device/user has voted on a poll
 */
export function hasVoted(pollId) {
  return localStorage.getItem(`voted_poll_${pollId}`) !== null;
}

/**
 * Get the option ID that the user voted for
 */
export function getUserVotedOption(pollId) {
  return localStorage.getItem(`voted_poll_${pollId}`);
}

/**
 * Check if a poll is expired
 */
export function isPollExpired(poll) {
  if (!poll.expiresAt) return false;
  return new Date() > new Date(poll.expiresAt);
}

/**
 * Simulate live incoming votes on other options
 */
export function simulateLiveVotes(pollId, userOptionId) {
  const polls = getAllPolls();
  const pollIndex = polls.findIndex(p => p.id === pollId);
  
  if (pollIndex === -1) return null;
  
  const poll = polls[pollIndex];
  if (isPollExpired(poll)) return poll;
  
  // Randomly choose 1 or 2 options to increment (excluding user option to keep it realistic!)
  let updated = false;
  poll.options.forEach(opt => {
    if (opt.id !== userOptionId && Math.random() > 0.6) {
      const extraVotes = Math.floor(Math.random() * 2) + 1; // 1 or 2 votes
      opt.votes += extraVotes;
      updated = true;
    }
  });
  
  if (updated) {
    polls[pollIndex] = poll;
    saveAllPolls(polls);
  }
  
  return poll;
}

/**
 * Convert poll data to CSV format
 */
export function exportPollToCSV(poll) {
  const headers = ['Option ID', 'Option Text', 'Votes Count', 'Percentage'];
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  const rows = poll.options.map(opt => {
    const pct = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) + '%' : '0%';
    return [
      `"${opt.id}"`,
      `"${opt.text.replace(/"/g, '""')}"`,
      opt.votes,
      `"${pct}"`
    ];
  });
  
  const csvContent = [
    `"Poll Question: ${poll.question.replace(/"/g, '""')}"`,
    `"Created At: ${new Date(poll.createdAt).toLocaleString()}"`,
    `"Expiration: ${poll.expiresAt ? new Date(poll.expiresAt).toLocaleString() : 'Never'}"`,
    `"Total Votes: ${totalVotes}"`,
    [], // empty spacer row
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Delete a specific poll by ID
 */
export function deletePoll(id) {
  const polls = getAllPolls();
  const filtered = polls.filter(p => p.id !== id);
  saveAllPolls(filtered);
  localStorage.removeItem(`voted_poll_${id}`);
}


