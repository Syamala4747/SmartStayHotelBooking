import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms } from '../api/roomsApi';
import { getRoomBookings } from '../api/bookingsApi';
import Chatbot from '../components/Chatbot';
import '../styles/filter-styles.css';

// Enhanced CSS animations and fonts
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.3); }
    50% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.6); }
  }
  
  @keyframes wiggle {
    0%, 7% { transform: rotateZ(0); }
    15% { transform: rotateZ(-15deg); }
    20% { transform: rotateZ(10deg); }
    25% { transform: rotateZ(-10deg); }
    30% { transform: rotateZ(6deg); }
    35% { transform: rotateZ(-4deg); }
    40%, 100% { transform: rotateZ(0); }
  }
  
  @keyframes heartbeat {
    0% { transform: scale(1); }
    14% { transform: scale(1.1); }
    28% { transform: scale(1); }
    42% { transform: scale(1.1); }
    70% { transform: scale(1); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes rotateIn {
    from {
      opacity: 0;
      transform: rotate(-200deg);
    }
    to {
      opacity: 1;
      transform: rotate(0);
    }
  }
  
  @keyframes flipInX {
    from {
      opacity: 0;
      transform: perspective(400px) rotateX(90deg);
    }
    40% {
      transform: perspective(400px) rotateX(-20deg);
    }
    60% {
      transform: perspective(400px) rotateX(10deg);
    }
    80% {
      transform: perspective(400px) rotateX(-5deg);
    }
    to {
      opacity: 1;
      transform: perspective(400px) rotateX(0deg);
    }
  }
  
  @keyframes rubberBand {
    from { transform: scale3d(1, 1, 1); }
    30% { transform: scale3d(1.25, 0.75, 1); }
    40% { transform: scale3d(0.75, 1.25, 1); }
    50% { transform: scale3d(1.15, 0.85, 1); }
    65% { transform: scale3d(0.95, 1.05, 1); }
    75% { transform: scale3d(1.05, 0.95, 1); }
    to { transform: scale3d(1, 1, 1); }
  }
  
  /* Hero animations */
  .dashboard-hero {
    animation: fadeIn 1s ease-out;
  }
  
  .dashboard-hero-title {
    animation: slideInLeft 1.2s ease-out 0.3s both;
  }
  
  .dashboard-hero-desc {
    animation: slideInRight 1.2s ease-out 0.5s both;
  }
  
  .hero-badge {
    animation: bounceIn 0.8s ease-out 0.1s both;
  }
  
  .hero-stats {
    animation: fadeInUp 1s ease-out 0.7s both;
  }
  
  .stat-item {
    animation: scaleIn 0.6s ease-out both;
  }
  
  .stat-item:nth-child(1) { animation-delay: 0.8s; }
  .stat-item:nth-child(3) { animation-delay: 0.9s; }
  .stat-item:nth-child(5) { animation-delay: 1s; }
  
  /* Content section animations */
  .dashboard-content-section {
    animation: fadeInUp 1s ease-out 0.8s both;
  }
  
  .section-title {
    animation: slideInLeft 0.8s ease-out 0.2s both;
  }
  
  .section-desc {
    animation: slideInRight 0.8s ease-out 0.4s both;
  }
  
  .availability-checker {
    animation: slideUp 0.8s ease-out 0.6s both;
  }
  
  .search-container {
    animation: zoomIn 0.6s ease-out 0.8s both;
  }
  
  /* Modern room card animations */
  .dashboard-rooms-grid > div:nth-child(1) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both;
  }
  
  .dashboard-rooms-grid > div:nth-child(2) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
  }
  
  .dashboard-rooms-grid > div:nth-child(3) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both;
  }
  
  .dashboard-rooms-grid > div:nth-child(4) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both;
  }
  
  .dashboard-rooms-grid > div:nth-child(5) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both;
  }
  
  .dashboard-rooms-grid > div:nth-child(6) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s both;
  }
  
  .dashboard-rooms-grid > div:nth-child(7) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s both;
  }
  
  .dashboard-rooms-grid > div:nth-child(8) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s both;
  }
  
  .dashboard-rooms-grid > div:nth-child(9) {
    animation: slideUpFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s both;
  }
  
  @keyframes slideUpFade {
    from {
      opacity: 0;
      transform: translateY(60px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  /* Clean card animations */
  .clean-room-card {
    transition: all 0.3s ease;
  }
  
  .clean-room-card:hover {
    transform: translateY(-8px);
  }
  
  .clean-room-card:hover .clean-image {
    transform: scale(1.05);
  }
  

  
  .loading-spinner {
    animation: spin 1s linear infinite;
  }
  
  /* Shimmer effect for loading states */
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
  
  /* Stagger animations for multiple elements */
  .stagger-animation:nth-child(1) { animation-delay: 0.1s; }
  .stagger-animation:nth-child(2) { animation-delay: 0.2s; }
  .stagger-animation:nth-child(3) { animation-delay: 0.3s; }
  .stagger-animation:nth-child(4) { animation-delay: 0.4s; }
  .stagger-animation:nth-child(5) { animation-delay: 0.5s; }
  .stagger-animation:nth-child(6) { animation-delay: 0.6s; }
  
  /* Hover effects */
  .animated-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .animated-hover:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
  
  /* Button animations */
  .animated-button {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .animated-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  .animated-button:hover::before {
    left: 100%;
  }
`;
document.head.appendChild(styleSheet);

const RoomsList = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<number[]>([]);
  const [checkingGlobalAvailability, setCheckingGlobalAvailability] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await getRooms();
      console.log('🏨 RAW DATA from API:', JSON.stringify(data, null, 2));

      // Ensure images is always an array
      const processedRooms = data.map((room: any) => {
        console.log(`\n📋 Processing Room ${room.room_number}:`);
        console.log('  - Raw images:', room.images);
        console.log('  - Type:', typeof room.images);
        console.log('  - Is Array:', Array.isArray(room.images));

        let processedImages;
        if (Array.isArray(room.images)) {
          processedImages = room.images;
          console.log('  ✅ Already array:', processedImages);
        } else if (typeof room.images === 'string') {
          processedImages = room.images.split(',').map((img: string) => img.trim()).filter((img: string) => img);
          console.log('  🔄 Converted from string:', processedImages);
        } else {
          processedImages = [];
          console.log('  ❌ No images, using empty array');
        }

        return {
          ...room,
          images: processedImages
        };
      });

      console.log('\n✅ FINAL PROCESSED ROOMS:', JSON.stringify(processedRooms, null, 2));
      setRooms(processedRooms);
      setFilteredRooms(processedRooms);
    } catch (error) {
      console.error('❌ Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms based on selected criteria
  useEffect(() => {
    let filtered = [...rooms];

    // Filter by availability if dates are selected
    if (availableRooms.length > 0 && (checkInDate || checkOutDate)) {
      filtered = filtered.filter(room => availableRooms.includes(room.id));
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(room => {
        const query = searchQuery.toLowerCase();
        const roomNumber = room.room_number.toLowerCase();
        const description = room.description.toLowerCase();
        const types = Array.isArray(room.room_type) ? room.room_type : [room.room_type];
        const typeString = types.join(' ').toLowerCase();

        return roomNumber.includes(query) ||
          description.includes(query) ||
          typeString.includes(query);
      });
    }

    // Sort by price
    if (sortOrder === 'low-to-high') {
      filtered.sort((a, b) => a.cost - b.cost);
    } else if (sortOrder === 'high-to-low') {
      filtered.sort((a, b) => b.cost - a.cost);
    }

    setFilteredRooms(filtered);
  }, [searchQuery, sortOrder, rooms, availableRooms, checkInDate, checkOutDate]);

  const checkGlobalAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    if (diffHours < 6) {
      alert('Minimum stay duration is 6 hours');
      return;
    }

    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }

    setCheckingGlobalAvailability(true);
    try {
      const availabilityPromises = rooms.map(async (room) => {
        try {
          const bookings = await getRoomBookings(room.id, checkInDate);
          // Check if room is available for the entire duration
          const isAvailable = bookings.every((booking: any) => {
            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);
            return (checkOut <= bookingStart || checkIn >= bookingEnd);
          });
          return isAvailable ? room.id : null;
        } catch (error) {
          console.error(`Failed to check availability for room ${room.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(availabilityPromises);
      const available = results.filter(id => id !== null) as number[];
      setAvailableRooms(available);

      if (available.length === 0) {
        alert('No rooms available for the selected dates. Please try different dates.');
      }
      // Remove the success alert - just filter the rooms silently
    } catch (error) {
      console.error('Failed to check availability:', error);
      alert('Failed to check availability. Please try again.');
    } finally {
      setCheckingGlobalAvailability(false);
    }
  };

  const clearAvailabilityFilter = () => {
    setCheckInDate('');
    setCheckOutDate('');
    setAvailableRooms([]);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading amazing rooms...</p>
      </div>
    );
  }



  return (
    <div style={styles.wrapper}>
      {/* Hero Section */}
      <section style={styles.hero} className="dashboard-hero">
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <span style={styles.badge} className="hero-badge">🏨 Premium Accommodations</span>
          <h1 style={styles.heroTitle} className="dashboard-hero-title">
            Discover Your
            <br />
            <span style={styles.gradient}>Perfect Room</span>
          </h1>
          <p style={styles.heroDesc} className="dashboard-hero-desc">
            Browse our collection of luxury rooms designed for your comfort and convenience
          </p>
          <div style={styles.heroStats} className="hero-stats">
            <div style={styles.statItem} className="stat-item">
              <div style={styles.statNumber}>{filteredRooms.length}+</div>
              <div style={styles.statLabel}>Available Rooms</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem} className="stat-item">
              <div style={styles.statNumber}>24/7</div>
              <div style={styles.statLabel}>Support</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem} className="stat-item">
              <div style={styles.statNumber}>100%</div>
              <div style={styles.statLabel}>Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section style={styles.roomsSection} className="dashboard-content-section">
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle} className="section-title">
              {availableRooms.length > 0 ? `Available Rooms (${filteredRooms.length})` : 'Available Rooms'}
            </h2>
            <p style={styles.sectionDesc} className="section-desc">
              {availableRooms.length > 0
                ? `Showing only rooms available for your selected dates`
                : 'Choose from our handpicked selection of premium rooms'
              }
            </p>

            {/* Availability Check Message */}
            <div style={styles.availabilityMessage}>
              <div style={styles.messageIcon}>📅</div>
              <div style={styles.messageContent}>
                <h4 style={styles.messageTitle}>Check Room Availability</h4>
                <p style={styles.messageText}>
                  Select your preferred check-in and check-out dates to see how many rooms are available for your stay
                </p>
                <p >
                  ⏰ Duration should be more than 6 hours
                </p>
              </div>
            </div>

            {/* Unified Search & Filter Panel */}
            <div style={styles.unifiedPanel} className="search-container">
              <div style={styles.panelGrid}>
                {/* Search Section */}
                <div style={styles.searchSection}>
                  <div style={styles.searchWrapper}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search rooms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={styles.searchInput}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={styles.clearButton}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Date Selection */}
                <div style={styles.dateSection}>
                  <input
                    type="datetime-local"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    style={styles.compactDateInput}
                    placeholder="Check-in"
                  />
                  <input
                    type="datetime-local"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().slice(0, 16)}
                    style={styles.compactDateInput}
                    placeholder="Check-out"
                  />
                </div>

                {/* Sort & Actions */}
                <div style={styles.actionsSection}>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={styles.compactSelect}
                  >
                    <option value="default">Sort by</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                  </select>

                  <button
                    onClick={checkGlobalAvailability}
                    disabled={!checkInDate || !checkOutDate || checkingGlobalAvailability}
                    style={{
                      ...styles.compactButton,
                      opacity: (!checkInDate || !checkOutDate) ? 0.5 : 1,
                    }}
                  >
                    {checkingGlobalAvailability ? '⏳' : '🔍'}
                  </button>

                  {(checkInDate || checkOutDate || availableRooms.length > 0) && (
                    <button
                      onClick={clearAvailabilityFilter}
                      style={styles.compactClearButton}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {availableRooms.length > 0 && (
                <div style={styles.compactResults}>
                  <span>✅ {filteredRooms.length} rooms available for selected dates</span>
                </div>
              )}
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div style={styles.noResults}>
              <div style={styles.noResultsIcon}>🔍</div>
              <h3 style={styles.noResultsTitle}>No rooms found</h3>
              <p style={styles.noResultsText}>Try a different search term</p>
            </div>
          ) : (
            <div style={styles.grid} className="dashboard-rooms-grid">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  style={styles.cleanCard}
                  className="clean-room-card"
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(79, 70, 229, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={styles.cleanImageSection}>
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={room.room_number}
                        style={styles.cleanImage}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div style={styles.cleanNoImage}>
                        <span style={styles.noImageText}>🏨 No Image</span>
                      </div>
                    )}

                    <div style={styles.cleanImageBadges}>
                      <span style={styles.cleanCapacityBadge}>👥 {room.capacity}</span>
                      {room.images && room.images.length > 1 && (
                        <span style={styles.cleanImageCount}>📷 {room.images.length}</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.cleanContent}>
                    <div style={styles.cleanHeader}>
                      <div>
                        <h3 style={styles.cleanRoomTitle}>Room {room.room_number}</h3>
                        <div style={styles.cleanRating}>
                          <span style={styles.cleanStars}>★★★★★</span>
                          <span style={styles.cleanRatingText}>4.8</span>
                        </div>
                      </div>
                      <div style={styles.cleanPriceSection}>
                        <span style={styles.cleanPrice}>₹{room.cost}</span>
                        <span style={styles.cleanPriceUnit}>/day</span>
                      </div>
                    </div>

                    <div style={styles.cleanFeatures}>
                      {(Array.isArray(room.room_type) ? room.room_type : [room.room_type])
                        .slice(0, 3)
                        .map((type: string, idx: number) => (
                          <span key={idx} style={styles.cleanFeatureTag}>
                            {type.replace('_', ' ')}
                          </span>
                        ))}
                    </div>

                    <div style={styles.cleanActions}>
                      <button
                        onClick={() => navigate(`/rooms/${room.id}?mode=view`)}
                        style={styles.cleanViewBtn}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#667EEA';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#667EEA';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/rooms/${room.id}?mode=book`)}
                        style={styles.cleanBookBtn}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
  },
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #4F46E5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
  },
  loadingText: {
    marginTop: '1.5rem',
    fontSize: '1.1rem',
    color: '#6B7280',
    fontWeight: '600',
  },
  wrapper: {
    width: '100%',
    minHeight: '100vh',
    background: `
      linear-gradient(rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0.95)),
      url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover fixed
    `,
  },
  // Hero Section
  hero: {
    marginTop: '120px', // Increased margin to ensure content is visible below navbar
    paddingTop: window.innerWidth <= 768 ? '3rem' : '4rem',
    paddingBottom: window.innerWidth <= 768 ? '3rem' : '4rem',
    paddingLeft: '2rem',
    paddingRight: '2rem',
    background: `
      linear-gradient(135deg, rgba(79, 70, 229, 0.85) 0%, rgba(99, 102, 241, 0.85) 100%),
      url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover
    `,
    textAlign: 'center' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    pointerEvents: 'none' as const,
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative' as const,
    zIndex: 1,
  },
  badge: {
    display: 'inline-block',
    padding: '0.5rem 1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    borderRadius: '25px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  heroTitle: {
    fontSize: window.innerWidth <= 768 ? '2rem' : '3.5rem',
    fontWeight: '800',
    color: 'white',
    lineHeight: '1.2',
    marginBottom: '1.5rem',
    textShadow: '0 2px 20px rgba(0,0,0,0.2)',
  },
  gradient: {
    color: 'white',
    textShadow: '0 0 30px rgba(255,255,255,0.5)',
  },
  heroDesc: {
    fontSize: '1.15rem',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: '1.8',
    maxWidth: '600px',
    margin: '0 auto 2.5rem',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: window.innerWidth <= 768 ? '1.5rem' : '3rem',
    marginTop: '2rem',
    flexWrap: 'wrap' as const,
  },
  statItem: {
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem',
    fontWeight: '800',
    color: 'white',
    lineHeight: '1',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    display: window.innerWidth <= 768 ? 'none' : 'block',
  },
  // Rooms Section
  roomsSection: {
    padding: window.innerWidth <= 768 ? '2rem 1rem' : '4rem 2rem',
    backgroundColor: 'transparent',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: window.innerWidth <= 768 ? '1.75rem' : '2.75rem',
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: '0.75rem',
  },
  sectionDesc: {
    fontSize: '1.1rem',
    color: '#6B7280',
    marginBottom: '2rem',
  },
  searchWrapper: {
    position: 'relative' as const,
    width: '100%',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1rem',
    pointerEvents: 'none' as const,
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    color: '#1F2937',
    transition: 'all 0.2s',
    outline: 'none',
  },
  clearButton: {
    position: 'absolute' as const,
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: '#DC2626',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '16px',
    border: '2px dashed #E5E7EB',
  },
  noResultsIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  noResultsTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.5rem',
  },
  noResultsText: {
    fontSize: '1.1rem',
    color: '#6B7280',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : window.innerWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
    gap: window.innerWidth <= 768 ? '1.5rem' : '2rem',
  },
  cleanCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    border: 'none',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  cleanImageSection: {
    width: '100%',
    height: '240px',
    overflow: 'hidden',
    position: 'relative' as const,
    borderRadius: '20px 20px 0 0',
  },
  cleanImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  cleanNoImage: {
    width: '100%',
    height: '100%',
    background: `
      linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%),
      url('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') center/cover
    `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
  },
  noImageText: {
    fontSize: '1rem',
    fontWeight: '600',
  },
  cleanImageBadges: {
    position: 'absolute' as const,
    top: '1rem',
    left: '1rem',
    display: 'flex',
    gap: '0.5rem',
  },
  cleanCapacityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1F2937',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  cleanImageCount: {
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  cleanContent: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    gap: '1.25rem',
  },
  cleanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cleanRoomTitle: {
    margin: 0,
    color: '#111827',
    fontSize: '1.5rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    letterSpacing: '-0.025em',
    fontFamily: 'Inter, sans-serif',
  },
  cleanRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cleanStars: {
    color: '#FCD34D',
    fontSize: '0.875rem',
  },
  cleanRatingText: {
    fontSize: '0.875rem',
    color: '#6B7280',
    fontWeight: '600',
  },
  cleanPriceSection: {
    textAlign: 'right' as const,
  },
  cleanPrice: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#667EEA',
    display: 'block',
    lineHeight: '1',
  },
  cleanPriceUnit: {
    fontSize: '0.75rem',
    color: '#6B7280',
    fontWeight: '500',
  },
  cleanFeatures: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  cleanFeatureTag: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'capitalize' as const,
    border: '1px solid #E2E8F0',
  },
  cleanActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: 'auto',
  },
  cleanViewBtn: {
    flex: 1,
    padding: '0.375rem 0.5rem',
    backgroundColor: 'white',
    color: '#667EEA',
    border: '1px solid #667EEA',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  cleanBookBtn: {
    flex: 2,
    padding: '0.375rem 0.5rem',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)',
  },

  description: {
    color: '#6B7280',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },





  // Availability Message Styles
  availabilityMessage: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  messageIcon: {
    fontSize: '2rem',
    backgroundColor: '#EEF2FF',
    padding: '0.75rem',
    borderRadius: '12px',
    color: '#4F46E5',
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.25rem',
  },
  messageText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#6B7280',
    lineHeight: '1.5',
  },
  durationRequirement: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.8rem',
    color: '#667EEA',
    fontWeight: '600',
    backgroundColor: '#EEF2FF',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #C7D2FE',
  },

  // Unified Panel Styles
  unifiedPanel: {
    backgroundColor: 'white',
    padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
  },
  panelGrid: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '2fr 2fr 1fr',
    gap: window.innerWidth <= 768 ? '1.25rem' : '1rem',
    alignItems: 'center',
  },
  searchSection: {
    position: 'relative' as const,
  },
  dateSection: {
    display: 'flex',
    gap: window.innerWidth <= 768 ? '0.75rem' : '0.5rem',
    flexDirection: window.innerWidth <= 480 ? 'column' as const : 'row' as const,
  },
  actionsSection: {
    display: 'flex',
    gap: window.innerWidth <= 768 ? '0.75rem' : '0.5rem',
    alignItems: 'center',
    flexDirection: window.innerWidth <= 480 ? 'column' as const : 'row' as const,
  },
  compactDateInput: {
    flex: 1,
    padding: window.innerWidth <= 768 ? '1rem' : '0.75rem',
    border: '1px solid #E5E7EB',
    borderRadius: window.innerWidth <= 768 ? '12px' : '8px',
    fontSize: window.innerWidth <= 768 ? '16px' : '0.875rem', // 16px prevents zoom on iOS
    outline: 'none',
    transition: 'border-color 0.2s',
    minHeight: window.innerWidth <= 768 ? '48px' : 'auto',
  },
  compactSelect: {
    padding: window.innerWidth <= 768 ? '1rem' : '0.75rem',
    border: '1px solid #E5E7EB',
    borderRadius: window.innerWidth <= 768 ? '12px' : '8px',
    fontSize: window.innerWidth <= 768 ? '16px' : '0.875rem',
    backgroundColor: 'white',
    outline: 'none',
    cursor: 'pointer',
    minWidth: window.innerWidth <= 768 ? '100%' : '120px',
    minHeight: window.innerWidth <= 768 ? '48px' : 'auto',
  },
  compactButton: {
    padding: window.innerWidth <= 768 ? '1rem 1.5rem' : '0.75rem',
    backgroundColor: '#667EEA',
    color: 'white',
    border: 'none',
    borderRadius: window.innerWidth <= 768 ? '12px' : '8px',
    cursor: 'pointer',
    fontSize: window.innerWidth <= 768 ? '1rem' : '1rem',
    minWidth: window.innerWidth <= 768 ? '100%' : '44px',
    minHeight: window.innerWidth <= 768 ? '48px' : 'auto',
    transition: 'all 0.2s',
    fontWeight: window.innerWidth <= 768 ? '600' : '400',
  },
  compactClearButton: {
    padding: window.innerWidth <= 768 ? '1rem 1.5rem' : '0.75rem',
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    border: 'none',
    borderRadius: window.innerWidth <= 768 ? '12px' : '8px',
    cursor: 'pointer',
    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
    minWidth: window.innerWidth <= 768 ? '100%' : '44px',
    minHeight: window.innerWidth <= 768 ? '48px' : 'auto',
    transition: 'all 0.2s',
    fontWeight: window.innerWidth <= 768 ? '600' : '400',
  },
  compactResults: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#F0FDF4',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#166534',
    textAlign: 'center' as const,
  },

};

// Add mobile-specific CSS improvements
if (typeof document !== 'undefined') {
  const mobileRoomsStyles = document.createElement('style');
  mobileRoomsStyles.textContent = `
    @media (max-width: 768px) {
      /* Prevent zoom on input focus */
      input[type="datetime-local"],
      input[type="text"],
      select {
        font-size: 16px !important;
      }
      
      /* Better touch targets for mobile */
      .search-container input,
      .search-container select,
      .search-container button {
        min-height: 48px !important;
        padding: 1rem !important;
      }
      
      /* Improved card hover effects for mobile */
      .room-card:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }
      
      /* Better spacing for mobile panels */
      .unified-panel {
        padding: 1.25rem !important;
        margin: 1rem 0 !important;
      }
      
      /* Stack elements vertically on very small screens */
      @media (max-width: 480px) {
        .date-section,
        .actions-section {
          flex-direction: column !important;
          gap: 0.75rem !important;
        }
        
        .date-section input,
        .actions-section select,
        .actions-section button {
          width: 100% !important;
        }
      }
      
      /* Better button styling */
      button {
        -webkit-appearance: none;
        -webkit-tap-highlight-color: transparent;
      }
    }
  `;
  
  if (!document.head.querySelector('#rooms-list-mobile-styles')) {
    mobileRoomsStyles.id = 'rooms-list-mobile-styles';
    document.head.appendChild(mobileRoomsStyles);
  }
}

export default RoomsList;