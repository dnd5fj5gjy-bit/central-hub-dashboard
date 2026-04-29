import React, { useState, useEffect, useRef } from 'react';

const AUTH_KEY = 'ow-auth';
const PASSWORD = 'OW';

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [exiting, setExiting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === 'true') {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    if (!authed && !checking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [authed, checking]);

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim().toUpperCase() === PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      setExiting(true);
      setTimeout(() => setAuthed(true), 400);
    } else {
      setError(true);
      setValue('');
      setTimeout(() => setError(false), 600);
    }
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setExiting(false);
    setValue('');
  }

  if (checking) return null;

  if (authed) {
    return typeof children === 'function' ? children({ onLogout: handleLogout }) : children;
  }

  return (
    <div className={`password-gate ${exiting ? 'animate-gate-exit' : 'animate-fade-in'}`}>
      <div className="flex flex-col items-center">
        <div
          className="text-[64px] font-bold tracking-tight mb-8 animate-fade-slide-up"
          style={{ color: '#3B82F6' }}
        >
          OW
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 animate-fade-slide-up stagger-2">
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter password"
            autoComplete="off"
            className={`input-field w-[280px] text-center text-[15px] ${error ? 'animate-shake input-field-error' : ''}`}
            style={{ background: 'rgba(255,255,255,0.03)' }}
          />
          <button
            type="submit"
            className="btn-primary w-[280px] py-3"
          >
            Enter
          </button>
        </form>

        <p className="text-[12px] mt-6 animate-fade-slide-up stagger-4" style={{ color: '#6B6B7B' }}>
          Central Hub Dashboard
        </p>
      </div>
    </div>
  );
}
