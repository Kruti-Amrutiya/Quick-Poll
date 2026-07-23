import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPolls, isPollExpired } from '../utils/pollService';

export default function PollsDirectory() {
  const [polls, setPolls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setPolls(getAllPolls());
  }, []);

  // Filter polls based on search question text
  const filteredPolls = polls.filter(poll => 
    poll.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Active & Expired Polls</h2>
        <p className="card-desc">Browse currently active polls or inspect final results of expired polls.</p>
      </div>

      {/* Search Filter */}
      <div className="search-wrapper">
        <input 
          type="text" 
          placeholder="🔍 Search polls by question..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Polls Listing */}
      <div className="polls-list">
        {filteredPolls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
            No polls match your search query. Try creating a new one!
          </div>
        ) : (
          filteredPolls.map(poll => {
            const expired = isPollExpired(poll);
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
            
            return (
              <Link key={poll.id} to={`/poll/${poll.id}`} className="poll-item-link">
                <div className="poll-item-card">
                  <div>
                    <h3 className="poll-item-question">{poll.question}</h3>
                    <div className="poll-item-meta">
                      <span>{poll.options.length} options</span>
                      <span>•</span>
                      <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast</span>
                      <span>•</span>
                      <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`badge-status ${expired ? 'expired' : 'active'}`}>
                    {expired ? 'Expired' : 'Active'}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
