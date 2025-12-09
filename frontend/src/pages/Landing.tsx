import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/rooms');
      } else {
        navigate('/rooms');
      }
    }
  }, [user, navigate]);

  return (
    <div style={styles.wrapper}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>🥇 SmartStay</div>
          <div style={styles.navLinks} className="landing-navbar-links">
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#rooms" style={styles.navLink}>Rooms</a>
            <a href="#testimonials" style={styles.navLink}>Reviews</a>
            <button onClick={() => navigate('/login')} style={styles.loginBtn}>Login</button>
            <button onClick={() => navigate('/signup')} style={styles.signupBtn}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent} className="landing-hero-content">
          <div style={styles.heroLeft}>
            <span style={styles.badge}>✨ Premium Hotel Booking</span>
            <h1 style={styles.heroTitle} className="landing-hero-title">
              Experience
              <br />
              <span style={styles.gradient}>Luxury Redefined</span>
            </h1>
            <p style={styles.heroDesc}>
              Your gateway to premium accommodations with AI-powered recommendations.
              Book hourly, daily, or extended stays with flexible pricing and instant confirmation.
              Experience seamless booking with multiple payment options and 24/7 support.
            </p>
            <div style={styles.heroButtons}>
              <button onClick={() => navigate('/signup')} style={styles.ctaBtn}>
                Start Booking
                <span style={styles.arrow}>→</span>
              </button>
              <button onClick={() => navigate('/rooms')} style={styles.exploreBtn}>
                <span style={styles.playIcon}>▶</span>
                Explore Rooms
              </button>
            </div>
            <div style={styles.stats} className="landing-stats">
              <div style={styles.stat}>
                <div style={styles.statNumber}>50K+</div>
                <div style={styles.statLabel}>Happy Guests</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>200+</div>
                <div style={styles.statLabel}>Luxury Rooms</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>4.9★</div>
                <div style={styles.statLabel}>Rating</div>
              </div>
            </div>
          </div>
          <div style={styles.heroRight} className="landing-hero-right">
            <div style={styles.imageCard}>
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=95"
                alt="Luxury Hotel"
                style={styles.heroImage}
                loading="eager"
                decoding="async"
              />
              <div style={styles.floatingCard}>
                <div style={styles.floatingIcon}>🏆</div>
                <div>
                  <div style={styles.floatingTitle}>Best Choice</div>
                  <div style={styles.floatingText}>Award Winning Service</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorks}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>SIMPLE PROCESS</span>
            <h2 style={styles.sectionTitle}>Book Your Perfect Room in 3 Easy Steps</h2>
            <p style={styles.sectionDesc}>Experience hassle-free booking from start to finish</p>
          </div>

          <div style={styles.stepsContainer}>
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Browse & Select',
                desc: 'Explore our curated collection of luxury rooms. Filter by capacity, price, and amenities to find your perfect match.',
                color: '#6C5CE7'
              },
              {
                step: '02',
                icon: '📅',
                title: 'Choose Duration',
                desc: 'Select your check-in and check-out dates. Book hourly (minimum 6 hours), half-day, or full-day stays with flexible pricing.',
                color: '#A29BFE'
              },
              {
                step: '03',
                icon: '💳',
                title: 'Secure Payment',
                desc: 'Complete your booking with multiple payment options: Credit Card, Debit Card, UPI, or Cash. Your stay is confirmed instantly!',
                color: '#6C5CE7'
              },
            ].map((step, idx) => (
              <div
                key={idx}
                style={styles.stepCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = step.color;
                  e.currentTarget.style.boxShadow = `0 12px 30px ${step.color}30`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ ...styles.stepNumber, backgroundColor: step.color }}>{step.step}</div>
                <div style={{ ...styles.stepIcon, backgroundColor: step.color + '20' }}>{step.icon}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
                {idx < 2 && <div style={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.features}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>WHY SMARTSTAY</span>
            <h2 style={styles.sectionTitle}>Everything You Need for a Perfect Stay</h2>
            <p style={styles.sectionDesc}>Experience world-class service and cutting-edge technology</p>
          </div>

          <div style={styles.featuresGrid} className="landing-features-grid">
            {[
              {
                icon: '🤖',
                title: 'AI Assistant',
                desc: 'Get personalized room recommendations from our intelligent chatbot based on your preferences and budget',
                color: '#10B981'
              },
              {
                icon: '⏰',
                title: 'Flexible Booking',
                desc: 'Book by the hour, half-day, or full-day. Minimum 6-hour stays with transparent pricing for every duration',
                color: '#6C5CE7'
              },
              {
                icon: '🖼️',
                title: 'Visual Gallery',
                desc: 'Browse up to 20 high-quality images per room. See exactly what you\'re booking before you arrive',
                color: '#F59E0B'
              },
              {
                icon: '💎',
                title: 'Premium Rooms',
                desc: 'Choose from Single, Double, Suite, and Deluxe rooms. Each handpicked for comfort and luxury',
                color: '#EC4899'
              },
              {
                icon: '🔐',
                title: 'Secure Payment',
                desc: 'Multiple payment options with bank-level security. Credit/Debit cards, UPI, or Cash on arrival',
                color: '#8B5CF6'
              },
              {
                icon: '⭐',
                title: 'Guest Reviews',
                desc: 'Read authentic reviews from verified guests. Leave your own feedback to help future travelers',
                color: '#EF4444'
              },
              {
                icon: '📱',
                title: 'Instant Confirmation',
                desc: 'Get immediate booking confirmation. Track your reservation status in real-time from your dashboard',
                color: '#3B82F6'
              },
              {
                icon: '🌟',
                title: '24/7 Support',
                desc: 'Round-the-clock customer service. Our team is always ready to assist with any questions or concerns',
                color: '#14B8A6'
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{ ...styles.featureCard, borderTop: `4px solid ${feature.color}` }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{ ...styles.featureIcon, backgroundColor: feature.color + '20' }}>
                  {feature.icon}
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Gallery */}
      <section id="rooms" style={styles.gallery}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>EXPLORE</span>
            <h2 style={styles.sectionTitle}>Featured Rooms</h2>
            <p style={styles.sectionDesc}>Discover our most popular accommodations</p>
          </div>

          <div style={styles.roomsGrid} className="landing-rooms-grid">
            {[
              {
                img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80',
                title: 'Deluxe Suite',
                price: '₹2999',
                rating: '4.9'
              },
              {
                img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
                title: 'Ocean View',
                price: '₹3999',
                rating: '5.0'
              },
              {
                img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
                title: 'Presidential',
                price: '₹5999',
                rating: '4.8'
              },
            ].map((room, idx) => (
              <div
                key={idx}
                style={styles.roomCard}
                onMouseOver={(e) => {
                  const imgEl = e.currentTarget.querySelector('img') as HTMLImageElement;
                  if (imgEl) imgEl.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  const imgEl = e.currentTarget.querySelector('img') as HTMLImageElement;
                  if (imgEl) imgEl.style.transform = 'scale(1)';
                }}
              >
                <div style={styles.roomImageWrapper}>
                  <img
                    src={room.img}
                    alt={room.title}
                    style={styles.roomImage}
                    loading="lazy"
                    decoding="async"
                  />
                  <div style={styles.roomBadge}>{room.rating} ★</div>
                </div>
                <div style={styles.roomInfo}>
                  <h3 style={styles.roomTitle}>{room.title}</h3>
                  <div style={styles.roomPrice}>
                    <span style={styles.priceAmount}>{room.price}</span>
                    <span style={styles.priceLabel}>/night</span>
                  </div>
                  <button
                    onClick={() => navigate('/signup')}
                    style={styles.roomBtn}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5B4FE9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6C5CE7'}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={styles.benefits}>
        <div style={styles.container}>
          <div style={styles.benefitsContent}>
            <div style={styles.benefitsLeft}>
              <span style={styles.sectionBadge}>WHY CHOOSE US</span>
              <h2 style={styles.benefitsTitle}>The SmartStay Advantage</h2>
              <p style={styles.benefitsDesc}>
                We're not just another booking platform. We're your partner in creating unforgettable travel experiences.
              </p>

              <div style={styles.benefitsList}>
                {[
                  {
                    icon: '✓',
                    title: 'Best Price Guarantee',
                    desc: 'Find a lower price? We\'ll match it and give you an extra 10% off'
                  },
                  {
                    icon: '✓',
                    title: 'No Hidden Fees',
                    desc: 'Transparent pricing with no surprise charges at checkout'
                  },
                  {
                    icon: '✓',
                    title: 'Instant Booking',
                    desc: 'Confirm your reservation in seconds with real-time availability'
                  },
                  {
                    icon: '✓',
                    title: 'Flexible Cancellation',
                    desc: 'Plans change? Contact our support team for assistance'
                  },
                ].map((benefit, idx) => (
                  <div key={idx} style={styles.benefitItem}>
                    <div style={styles.benefitIcon}>{benefit.icon}</div>
                    <div>
                      <div style={styles.benefitItemTitle}>{benefit.title}</div>
                      <div style={styles.benefitItemDesc}>{benefit.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/signup')}
                style={styles.benefitsBtn}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Start Your Journey
                <span style={styles.arrow}>→</span>
              </button>
            </div>

            <div style={styles.benefitsRight}>
              <div style={styles.statsGrid}>
                {[
                  { number: '50K+', label: 'Happy Guests', icon: '😊' },
                  { number: '200+', label: 'Luxury Rooms', icon: '🏨' },
                  { number: '4.9/5', label: 'Average Rating', icon: '⭐' },
                  { number: '24/7', label: 'Support Available', icon: '💬' },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={styles.statCard}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = '#6C5CE7';
                      e.currentTarget.style.backgroundColor = '#F8F9FF';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                  >
                    <div style={styles.statCardIcon}>{stat.icon}</div>
                    <div style={styles.statCardNumber}>{stat.number}</div>
                    <div style={styles.statCardLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={styles.testimonials}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>TESTIMONIALS</span>
            <h2 style={styles.sectionTitle}>What Our Guests Say</h2>
            <p style={styles.sectionDesc}>Real experiences from real travelers</p>
          </div>

          <div style={styles.testimonialsGrid} className="landing-testimonials-grid">
            {[
              {
                text: 'Absolutely amazing experience! The room was spotless and the service was impeccable.',
                name: 'Sarah Johnson',
                role: 'Travel Blogger',
                avatar: '👩'
              },
              {
                text: 'Best hotel booking platform I\'ve used. Simple, fast, and reliable. Highly recommend!',
                name: 'Michael Chen',
                role: 'Business Executive',
                avatar: '👨'
              },
              {
                text: 'The attention to detail and customer service exceeded all my expectations. Will book again!',
                name: 'Emma Williams',
                role: 'Photographer',
                avatar: '👩‍🦰'
              },
            ].map((testimonial, idx) => (
              <div key={idx} style={styles.testimonialCard}>
                <div style={styles.starRating}>
                  {'⭐'.repeat(5)}
                </div>
                <p style={styles.testimonialText}>"{testimonial.text}"</p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.avatar}>{testimonial.avatar}</div>
                  <div>
                    <div style={styles.authorName}>{testimonial.name}</div>
                    <div style={styles.authorRole}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <div style={styles.ctaBox}>
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>Ready to Book Your Dream Stay?</h2>
            <p style={styles.ctaText}>
              Join thousands of happy travelers and experience luxury like never before
            </p>
            <button
              onClick={() => navigate('/signup')}
              style={styles.ctaButton}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(108, 92, 231, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(108, 92, 231, 0.3)';
              }}
            >
              Get Started Free
              <span style={styles.arrow}>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent} className="landing-footer-content">
          <div style={styles.footerBrand}>
            <div style={styles.footerLogo}>🥇 SmartStay</div>
            <p style={styles.footerTagline}>Your gateway to luxury accommodations</p>
          </div>
          <div style={styles.footerLinks}>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerHeading}>Company</h4>
              <a href="#" style={styles.footerLink}>About Us</a>
              <a href="#" style={styles.footerLink}>Careers</a>
              <a href="#" style={styles.footerLink}>Press</a>
            </div>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerHeading}>Support</h4>
              <a href="#" style={styles.footerLink}>Help Center</a>
              <a href="#" style={styles.footerLink}>Contact Us</a>
              <a href="#" style={styles.footerLink}>FAQ</a>
            </div>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerHeading}>Legal</h4>
              <a href="#" style={styles.footerLink}>Privacy Policy</a>
              <a href="#" style={styles.footerLink}>Terms of Service</a>
              <a href="#" style={styles.footerLink}>Cookie Policy</a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>© 2024 SmartStay Hotel Booking System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '100%',
    overflowX: 'hidden' as const,
    backgroundColor: '#FFFFFF',
  },
  // Navbar
  navbar: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #E5E7EB',
    zIndex: 1000,
    padding: '1rem 0',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1F2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    color: '#6B7280',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.95rem',
    transition: 'color 0.3s',
  },
  loginBtn: {
    padding: '0.6rem 1.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    color: '#374151',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.95rem',
  },
  signupBtn: {
    padding: '0.6rem 1.5rem',
    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.95rem',
  },
  // Hero Section
  hero: {
    marginTop: '80px',
    padding: '5rem 2rem',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    alignItems: 'center',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.5rem 1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    borderRadius: '25px',
    fontSize: '0.85rem',
    fontWeight: '600',
    width: 'fit-content',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: 'white',
    lineHeight: '1.2',
    margin: 0,
  },
  gradient: {
    color: '#FFD700',
  },
  heroDesc: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.7',
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  ctaBtn: {
    padding: '1rem 2rem',
    background: '#FFD700',
    border: 'none',
    borderRadius: '8px',
    color: '#1F2937',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
  },
  arrow: {
    fontSize: '1.2rem',
  },
  exploreBtn: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    border: '2px solid white',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
  },
  playIcon: {
    fontSize: '0.8rem',
  },
  stats: {
    display: 'flex',
    gap: '3rem',
    marginTop: '2rem',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  heroRight: {
    position: 'relative' as const,
  },
  imageCard: {
    position: 'relative' as const,
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  heroImage: {
    width: '100%',
    height: '500px',
    objectFit: 'cover' as const,
    display: 'block',
    imageRendering: '-webkit-optimize-contrast' as const,
    backfaceVisibility: 'hidden' as const,
  },
  floatingCard: {
    position: 'absolute' as const,
    bottom: '2rem',
    left: '2rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  floatingIcon: {
    fontSize: '2rem',
  },
  floatingTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1F2937',
  },
  floatingText: {
    fontSize: '0.85rem',
    color: '#6B7280',
  },
  // How It Works Section
  howItWorks: {
    padding: '6rem 2rem',
    backgroundColor: '#FFFFFF',
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    position: 'relative' as const,
  },
  stepCard: {
    padding: '3rem 2.5rem',
    background: 'white',
    borderRadius: '24px',
    textAlign: 'center' as const,
    position: 'relative' as const,
    transition: 'all 0.4s',
    border: '2px solid transparent',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
  },
  stepNumber: {
    position: 'absolute' as const,
    top: '-25px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '900',
    fontSize: '1.5rem',
    boxShadow: '0 8px 25px rgba(108, 92, 231, 0.4)',
    border: '4px solid white',
  },
  stepIcon: {
    width: '100px',
    height: '100px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    margin: '2.5rem auto 1.5rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  },
  stepTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: '1rem',
  },
  stepDesc: {
    fontSize: '1.05rem',
    color: '#6B7280',
    lineHeight: '1.8',
  },
  stepArrow: {
    position: 'absolute' as const,
    top: '50%',
    right: '-2rem',
    transform: 'translateY(-50%)',
    fontSize: '2rem',
    color: '#E5E7EB',
    fontWeight: '700',
  },
  // Features Section
  features: {
    padding: '6rem 2rem',
    backgroundColor: '#F9FAFB',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '4rem',
  },
  sectionBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: '#EEF2FF',
    color: '#667EEA',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1F2937',
    marginTop: '1rem',
  },
  sectionDesc: {
    fontSize: '1.1rem',
    color: '#6B7280',
    marginTop: '0.5rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  featureIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    marginBottom: '1.5rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.75rem',
  },
  featureDesc: {
    fontSize: '0.95rem',
    color: '#6B7280',
    lineHeight: '1.6',
  },
  // Rooms Gallery
  gallery: {
    padding: '6rem 2rem',
    backgroundColor: '#F9FAFB',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  roomImageWrapper: {
    position: 'relative' as const,
    height: '250px',
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transition: 'transform 0.5s',
    imageRendering: '-webkit-optimize-contrast' as const,
    backfaceVisibility: 'hidden' as const,
  },
  roomBadge: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    backgroundColor: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1F2937',
  },
  roomInfo: {
    padding: '1.5rem',
  },
  roomTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1rem',
  },
  roomPrice: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  priceAmount: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#6C5CE7',
  },
  priceLabel: {
    fontSize: '1rem',
    color: '#9CA3AF',
  },
  roomBtn: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#6C5CE7',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  // Benefits Section
  benefits: {
    padding: '6rem 2rem',
    backgroundColor: '#FFFFFF',
  },
  benefitsContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    alignItems: 'center',
  },
  benefitsLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  benefitsTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: '1.2',
  },
  benefitsDesc: {
    fontSize: '1.1rem',
    color: '#6B7280',
    lineHeight: '1.7',
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    marginTop: '1rem',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  benefitIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  benefitItemTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.25rem',
  },
  benefitItemDesc: {
    fontSize: '0.95rem',
    color: '#6B7280',
    lineHeight: '1.6',
  },
  benefitsBtn: {
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
    width: 'fit-content',
    marginTop: '1rem',
  },
  benefitsRight: {
    display: 'flex',
    justifyContent: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    padding: '2rem',
    borderRadius: '16px',
    textAlign: 'center' as const,
    border: '2px solid #E5E7EB',
    transition: 'all 0.3s',
  },
  statCardIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  statCardNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#6C5CE7',
    marginBottom: '0.5rem',
  },
  statCardLabel: {
    fontSize: '0.9rem',
    color: '#6B7280',
    fontWeight: '600',
  },
  // Testimonials
  testimonials: {
    padding: '8rem 2rem',
    background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)',
  },
  testimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2.5rem',
  },
  testimonialCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  starRating: {
    fontSize: '1rem',
    marginBottom: '1rem',
    color: '#FFA500',
  },
  testimonialText: {
    fontSize: '1rem',
    color: '#374151',
    lineHeight: '1.7',
    marginBottom: '1.5rem',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #F3F4F6',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#667EEA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  authorName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.25rem',
  },
  authorRole: {
    fontSize: '0.9rem',
    color: '#6B7280',
    fontWeight: '500',
  },
  // CTA Section
  cta: {
    padding: '6rem 2rem',
    backgroundColor: '#F9FAFB',
  },
  ctaBox: {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    borderRadius: '16px',
    padding: '4rem 3rem',
    textAlign: 'center' as const,
  },
  ctaContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '1rem',
  },
  ctaText: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  ctaButton: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '700',
    backgroundColor: 'white',
    color: '#667EEA',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  // Footer
  footer: {
    backgroundColor: '#1F2937',
    padding: '3rem 2rem 2rem',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '3rem',
    marginBottom: '2rem',
  },
  footerBrand: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  footerLogo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
  },
  footerTagline: {
    color: '#9CA3AF',
    fontSize: '0.95rem',
    lineHeight: '1.6',
  },
  footerLinks: {
    display: 'contents',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  footerHeading: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  footerLink: {
    color: '#9CA3AF',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'color 0.3s',
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '2rem',
    borderTop: '1px solid #374151',
    textAlign: 'center' as const,
  },
  copyright: {
    color: '#6B7280',
    fontSize: '0.9rem',
  },
};

export default Landing;
