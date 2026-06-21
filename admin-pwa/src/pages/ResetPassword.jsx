import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeRecoveryCode, requestPasswordReset, signOut, updatePassword } from '../lib/auth';
import { supabase } from '../lib/supabase';
import './Login.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const recoveryCode = searchParams.get('code');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    const initializeRecovery = async () => {
      setLoading(true);
      setError('');
      try {
        if (recoveryCode) {
          await exchangeRecoveryCode(recoveryCode);
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!cancelled) {
          setMode(session ? 'set-password' : 'request');
          if (session) {
            setMessage('Recovery link confirmed. Set a new password below.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Recovery link is invalid or expired.');
          setMode('request');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!cancelled && event === 'PASSWORD_RECOVERY' && session) {
        setMode('set-password');
        setMessage('Recovery link confirmed. Set a new password below.');
        setError('');
        setLoading(false);
      }
    });

    initializeRecovery();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [recoveryCode]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await requestPasswordReset(email);
      setMessage('Password reset email sent. Check your inbox and follow the link.');
    } catch (err) {
      setError(err.message || 'Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(password);
      await signOut();
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated. Please sign in with your new password.' }
      });
    } catch (err) {
      setError(err.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="container">
        <div className="card reset-card">
          <h1>FairFare Admin</h1>
          <p className="reset-note">
            {mode === 'set-password'
              ? 'Create a new password for your account.'
              : 'Reset your password by email.'}
          </p>

          {error && <div className="error">{error}</div>}
          {message && <div className="reset-success">{message}</div>}

          {mode === 'checking' ? (
            <p className="reset-note">Checking recovery link...</p>
          ) : mode === 'set-password' ? (
            <form className="reset-form" onSubmit={handleSetPassword}>
              <div className="form-group">
                <label>New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          ) : (
            <form className="reset-form" onSubmit={handleRequestReset}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@fairfare.com"
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="helper-text">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
