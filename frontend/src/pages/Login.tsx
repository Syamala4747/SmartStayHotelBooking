import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/authApi';
import AuthNavbar from '../components/AuthNavbar';
import AuthFooter from '../components/AuthFooter';
import '../styles/auth-mobile.css';

// Add animations and fonts
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-60px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(60px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  .auth-container {
    animation: fadeIn 0.8s ease-out;
  }
  
  .auth-left-side {
    animation: slideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .auth-right-side {
    animation: slideInRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .auth-form-container {
    animation: scaleIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
  }
  
  .auth-form-title {
    animation: slideUp 0.6s ease-out 0.3s backwards;
  }
  
  .auth-input {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .auth-input:focus {
    transform: translateY(-2px);
  }
  
  .auth-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  
  .auth-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  .auth-button:hover::before {
    left: 100%;
  }
  
  .hotel-image {
    animation: scaleIn 1s ease-out 0.4s backwards;
    transition: transform 0.5s ease;
  }
  
  .hotel-image:hover {
    transform: scale(1.05);
  }
  
  .floating-badge {
    animation: float 3s ease-in-out infinite;
  }
  
  .stat-card {
    animation: slideUp 0.6s ease-out backwards;
  }
  
  .stat-card:nth-child(1) {
    animation-delay: 0.5s;
  }
  
  .stat-card:nth-child(2) {
    animation-delay: 0.6s;
  }
  
  .stat-card:nth-child(3) {
    animation-delay: 0.7s;
  }
  
  .stat-card:hover {
    animation: pulse 0.6s ease-in-out;
  }
  
  /* Mobile responsive animations */
  @media (max-width: 768px) {
    .auth-left-side {
      animation: none !important;
    }
    
    .auth-right-side {
      animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .auth-form-container {
      animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards;
    }
  }
`;
document.head.appendChild(styleSheet);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await loginApi({ email: email.trim().toLowerCase(), password });
      login(response.access_token, response.user);

      if (response.user.role === 'ADMIN') {
        navigate('/admin/rooms');
      } else {
        navigate('/rooms');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.response?.status === 404) {
        setError('Account not found. Please check your email or create a new account.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <>
      <AuthNavbar />
      <div style={styles.wrapper}>
        <div style={styles.container} className="auth-container">
          {/* Left Side - Hero Content */}
          <div style={styles.leftSide} className="auth-left-side">
            <div style={styles.leftContent}>
              <div style={styles.brandSection}>
                <h1 style={styles.brandLogo}>🥇 SmartStay</h1>
                <p style={styles.brandTagline}>Experience luxury accommodations with seamless booking</p>
              </div>

              <div style={styles.imageCard}>
                <img
                  src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80"
                  alt="Luxury Hotel Room"
                  style={styles.hotelImage}
                  className="hotel-image"
                />
                <div style={styles.floatingBadge} className="floating-badge">⭐ 4.9 Rating</div>
              </div>

              <div style={styles.features}>
                <div style={styles.feature} className="stat-card">
                  <div style={styles.featureIcon}>🏨</div>
                  <div style={styles.featureTitle}>200+</div>
                  <div style={styles.featureDesc}>Luxury Rooms</div>
                </div>
                <div style={styles.feature} className="stat-card">
                  <div style={styles.featureIcon}>😊</div>
                  <div style={styles.featureTitle}>50K+</div>
                  <div style={styles.featureDesc}>Happy Guests</div>
                </div>
                <div style={styles.feature} className="stat-card">
                  <div style={styles.featureIcon}>💬</div>
                  <div style={styles.featureTitle}>24/7</div>
                  <div style={styles.featureDesc}>Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div style={styles.rightSide} className="auth-right-side">
            <div style={styles.formContainer} className="auth-form-container">
              <div style={styles.formHeader}>
                <h2 style={styles.formTitle} className="auth-form-title">Welcome Back</h2>
                <p style={styles.formSubtitle}>Sign in to continue to SmartStay</p>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={styles.input}
                    className="auth-input"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667EEA';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    style={styles.input}
                    className="auth-input"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667EEA';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={styles.button}
                  className="auth-button"
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  Sign In
                </button>
              </form>

              <div style={styles.divider}>
                <span style={styles.dividerText}>or</span>
              </div>


              <p style={styles.footer}>
                Don't have an account? <Link to="/signup" style={styles.link}>Create one now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <AuthFooter />
    </>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    paddingTop: '70px',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  },
  container: {
    display: 'flex',
    flex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: '3rem 2rem',
    gap: '4rem',
    alignItems: 'center',
  } as React.CSSProperties,
  leftSide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  overlay: {
    display: 'none',
  },
  leftContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  brandSection: {
    marginBottom: '1rem',
  },
  abstractShape1: {
    display: 'none',
  },
  abstractShape2: {
    display: 'none',
  },
  brandLogo: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '1rem',
    color: 'white',
    letterSpacing: '-0.5px',
  },
  brandTagline: {
    fontSize: '1.25rem',
    fontWeight: '400',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  imageCard: {
    position: 'relative' as const,
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  hotelImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover' as const,
    display: 'block',
  },
  floatingBadge: {
    position: 'absolute' as const,
    top: '1.5rem',
    right: '1.5rem',
    backgroundColor: '#FFD700',
    color: '#1F2937',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  features: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  feature: {
    flex: 1,
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  featureIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
  },
  featureTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: '#FFFFFF',
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#FFFFFF',
    padding: '3rem 2.5rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  formHeader: {
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  formTitle: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: '0.5rem',
    letterSpacing: '-0.025em',
  },
  formSubtitle: {
    fontSize: '1rem',
    color: '#6B7280',
    fontWeight: '400',
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    border: '1px solid #FCA5A5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    padding: '0.875rem 1rem',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '1rem',
    backgroundColor: '#F9FAFB',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  },
  button: {
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  },
  divider: {
    position: 'relative' as const,
    textAlign: 'center' as const,
    margin: '1.5rem 0',
    borderTop: '1px solid #E5E7EB',
  },
  dividerText: {
    backgroundColor: '#FFFFFF',
    padding: '0 0.75rem',
    color: '#9CA3AF',
    fontSize: '0.875rem',
    position: 'relative' as const,
    top: '-0.625rem',
    display: 'inline-block',
  },
  footer: {
    textAlign: 'center' as const,
    color: '#6B7280',
    fontSize: '0.875rem',
  },
  link: {
    color: '#667EEA',
    textDecoration: 'none',
    fontWeight: '600',
  },
  testCredentials: {
    backgroundColor: '#EEF2FF',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #C7D2FE',
  },
  testTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4F46E5',
    margin: '0 0 0.5rem 0',
  },
  testInfo: {
    fontSize: '0.8rem',
    color: '#6B7280',
    margin: '0.25rem 0',
    fontFamily: 'monospace',
  },
};

export default Login;
