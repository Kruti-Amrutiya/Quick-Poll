import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoll } from '../utils/pollService';

export default function CreatePoll() {
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
      setErrors({ ...errors, options: '' });
    }
  };

  const handleRemoveOption = (indexToRemove) => {
    if (options.length > 2) {
      const filtered = options.filter((_, idx) => idx !== indexToRemove);
      setOptions(filtered);
      setErrors({ ...errors, options: '' });
    }
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
    if (errors.options) {
      setErrors({ ...errors, options: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // 1. Validate Question
    if (!question.trim()) {
      newErrors.question = 'Poll question is required.';
    }

    // 2. Validate Options
    const cleanedOptions = options.map(opt => opt.trim());
    const filledOptions = cleanedOptions.filter(opt => opt !== '');
    
    if (filledOptions.length < 2) {
      newErrors.options = 'Please fill out at least 2 options.';
    } else {
      // Check for duplicates
      const uniqueOptions = new Set(filledOptions.map(o => o.toLowerCase()));
      if (uniqueOptions.size !== filledOptions.length) {
        newErrors.options = 'Option values must be unique. Duplicates are not allowed.';
      }
    }

    // 3. Validate Expiration
    if (expiresAt) {
      const expDate = new Date(expiresAt);
      if (expDate <= new Date()) {
        newErrors.expiresAt = 'Expiration time must be in the future.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Process valid form
    const newPoll = createPoll({
      question,
      options: cleanedOptions.filter(opt => opt !== ''),
      expiresAt: expiresAt || null
    });

    // Copy unique link to clipboard
    const pollLink = `${window.location.origin}/poll/${newPoll.id}`;
    navigator.clipboard.writeText(pollLink)
      .then(() => {
        setSuccessMsg('Poll created successfully! Share link copied to clipboard.');
      })
      .catch(() => {
        setSuccessMsg('Poll created successfully! Redirecting...');
      });

    // Redirect to the newly created poll after a brief delay
    setTimeout(() => {
      navigate(`/poll/${newPoll.id}`);
    }, 1500);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Create a New Poll</h2>
        <p className="card-desc">Fill in the details below to publish an interactive, real-time poll.</p>
      </div>

      {successMsg && (
        <div style={{
          background: 'rgba(0, 230, 118, 0.08)',
          border: '1px solid rgba(0, 230, 118, 0.2)',
          color: 'var(--success)',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Poll Question */}
        <div className="form-group">
          <label htmlFor="pollQuestion" class="field-label">Poll Question</label>
          <input 
            type="text" 
            id="pollQuestion" 
            value={question} 
            onChange={(e) => {
              setQuestion(e.target.value);
              setErrors({ ...errors, question: '' });
            }}
            placeholder="e.g., Which JS framework is best in 2026?"
          />
          {errors.question && <span className="error-text">{errors.question}</span>}
        </div>

        {/* Options */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label class="field-label">Poll Options (Min 2, Max 5)</label>
          
          <div className="options-container" style={{ marginTop: '0.5rem' }}>
            {options.map((option, idx) => (
              <div key={idx} className="option-row">
                <input 
                  type="text" 
                  value={option} 
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                />
                {options.length > 2 && (
                  <button 
                    type="button" 
                    className="btn-remove-option"
                    onClick={() => handleRemoveOption(idx)}
                    title="Remove this option"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.options && <span className="error-text">{errors.options}</span>}

          {options.length < 5 && (
            <button 
              type="button" 
              className="btn-add-option" 
              onClick={handleAddOption}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Option
            </button>
          )}
        </div>

        {/* Optional Expiration Time */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label htmlFor="pollExpiration" class="field-label">Expiration Time (Optional)</label>
          <input 
            type="datetime-local" 
            id="pollExpiration" 
            value={expiresAt} 
            onChange={(e) => {
              setExpiresAt(e.target.value);
              setErrors({ ...errors, expiresAt: '' });
            }}
          />
          {errors.expiresAt && <span className="error-text">{errors.expiresAt}</span>}
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary" disabled={successMsg !== ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create & Copy Poll Link
        </button>
      </form>
    </div>
  );
}
