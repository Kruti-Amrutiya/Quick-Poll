import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getPollById, 
  castVote, 
  hasVoted, 
  getUserVotedOption, 
  isPollExpired, 
  simulateLiveVotes, 
  exportPollToCSV,
  deletePoll
} from '../utils/pollService';

export default function PollDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [poll, setPoll] = useState(null);
  const [userOptionId, setUserOptionId] = useState(null);
  const [voted, setVoted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Timer and simulation intervals refs
  const timerRef = useRef(null);
  const simulationRef = useRef(null);

  // Load poll details
  const refreshPollData = () => {
    const data = getPollById(id);
    if (data) {
      setPoll(data);
      const userChoice = getUserVotedOption(id);
      if (userChoice) {
        setUserOptionId(userChoice);
        setVoted(true);
      }
      const expStatus = isPollExpired(data);
      setExpired(expStatus);
    }
  };

  useEffect(() => {
    refreshPollData();
    
    // Cleanup on unmount or id change
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [id]);

  // Expiration and Time Left Ticker
  useEffect(() => {
    if (poll && poll.expiresAt) {
      const updateTimer = () => {
        const total = Date.parse(poll.expiresAt) - Date.parse(new Date());
        if (total <= 0) {
          setExpired(true);
          setTimeLeft('Expired');
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          const seconds = Math.floor((total / 1000) % 60);
          const minutes = Math.floor((total / 1000 / 60) % 60);
          const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
          const days = Math.floor(total / (1000 * 60 * 60 * 24));
          
          let parts = [];
          if (days > 0) parts.push(`${days}d`);
          if (hours > 0) parts.push(`${hours}h`);
          if (minutes > 0) parts.push(`${minutes}m`);
          parts.push(`${seconds}s`);
          
          setTimeLeft(parts.join(' ') + ' left');
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else if (poll) {
      setTimeLeft('Never expires');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [poll]);

  // Live incoming votes simulation interval
  useEffect(() => {
    // Only run simulation if voted OR expired AND is still active
    if (poll && (voted || expired) && !expired) {
      const runSimulation = () => {
        const updatedPoll = simulateLiveVotes(id, userOptionId);
        if (updatedPoll) {
          setPoll(updatedPoll);
        }
      };
      
      // Run every 5 seconds to simulate organic votes
      simulationRef.current = setInterval(runSimulation, 5000);
    }

    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [poll, voted, expired, userOptionId, id]);

  if (!poll) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <span style={{ fontSize: '3rem' }}>🔍</span>
        <h3 style={{ margin: '1rem 0' }}>Poll Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The poll with ID "{id}" does not exist, or has been removed.
        </p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
          Back to Creator
        </Link>
      </div>
    );
  }

  // Calculate statistics
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  // Find leading option
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const leadingOption = totalVotes > 0 ? sortedOptions[0].text : 'No votes cast yet';

  const handleVote = (optionId) => {
    if (expired) return;
    const updated = castVote(id, optionId);
    if (updated) {
      setPoll(updated);
      setUserOptionId(optionId);
      setVoted(true);
    }
  };

  const handleCopyLink = () => {
    const pollLink = `${window.location.origin}/poll/${poll.id}`;
    navigator.clipboard.writeText(pollLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
  };

  const handleCSVDownload = () => {
    const csvContent = exportPollToCSV(poll);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `poll-${poll.id}-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this poll? All voting data will be permanently lost.');
    if (confirmDelete) {
      deletePoll(poll.id);
      navigate('/polls');
    }
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`badge-status ${expired ? 'expired' : 'active'}`}>
            {expired ? 'Expired' : 'Active'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {timeLeft}
          </span>
        </div>
        <h2 className="card-title" style={{ marginTop: '0.5rem', lineHeight: '1.3' }}>
          {poll.question}
        </h2>
        <p className="card-desc">Created on {new Date(poll.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Mode A: Voting Options */}
      {!voted && !expired ? (
        <div className="vote-options-list">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Cast your vote with a single click:
          </p>
          {poll.options.map(opt => (
            <button 
              key={opt.id} 
              className="btn-vote-option"
              onClick={() => handleVote(opt.id)}
            >
              <span>{opt.text}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
          
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn-secondary" 
              style={{ borderColor: 'rgba(255, 82, 82, 0.2)', color: 'var(--danger)', width: '100%' }}
              onClick={handleDelete}
              title="Delete this poll"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete Poll
            </button>
          </div>
        </div>
      ) : (
        /* Mode B: Live Results Display (with animated custom progress bars) */
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {expired ? 'Voting has ended. View final results below:' : 'Live results updating in real-time:'}
          </p>
          
          {poll.options.map(opt => {
            const percentage = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : '0.0';
            const isUserVote = opt.id === userOptionId;
            
            return (
              <div 
                key={opt.id} 
                className={`result-progress-row ${isUserVote ? 'voted-for' : ''}`}
              >
                <div className="result-labels">
                  <span className="result-option-text">
                    {opt.text}
                    {isUserVote && <span className="user-vote-badge">Your Vote</span>}
                  </span>
                  <span className="result-vote-pct">
                    {opt.votes} ({percentage}%)
                  </span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}

          {/* Stats Badges Footer */}
          <div className="stats-summary-grid">
            <div className="stat-badge">
              <span className="stat-val">{totalVotes}</span>
              <div className="stat-lbl">Total Votes</div>
            </div>
            <div className="stat-badge">
              <span className="stat-val" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {leadingOption}
              </span>
              <div className="stat-lbl">Leading Option</div>
            </div>
            <div className="stat-badge">
              <span className="stat-val" style={{ fontSize: '0.95rem' }}>
                {poll.expiresAt ? new Date(poll.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Infinite'}
              </span>
              <div className="stat-lbl">End Time</div>
            </div>
          </div>
          
          {/* Action Row */}
          <div className="share-action-row">
            <button 
              className={`btn-secondary ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              title="Copy poll sharing link to clipboard"
              style={{ flex: 1 }}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Link Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Share Link
                </>
              )}
            </button>
            
            <button 
              className="btn-secondary"
              onClick={handleCSVDownload}
              title="Export results to CSV"
              style={{ flex: 1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>

            <button 
              className="btn-secondary" 
              style={{ borderColor: 'rgba(255, 82, 82, 0.2)', color: 'var(--danger)', flex: 1 }}
              onClick={handleDelete}
              title="Delete this poll"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
