import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getRoomById, getRoomFeedback } from '../api/roomsApi';
import { createBooking } from '../api/bookingsApi';
import { useAuth } from '../context/AuthContext';

const RoomDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'view'; // 'view' or 'book'
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  
  // Customization options
  const [customizations, setCustomizations] = useState({
    extraBed: false,
    breakfast: false,
    airportPickup: false,
    lateCheckout: false,
    roomDecoration: false,
  });

  // Force re-render when customizations change
  const [, forceUpdate] = useState({});
  const [currentTotal, setCurrentTotal] = useState(0);

  const customizationPrices = {
    extraBed: 500,
    breakfast: 300,
    airportPickup: 800,
    lateCheckout: 200,
    roomDecoration: 1000,
  };
  const [loading, setLoading] = useState(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    startTime: string;
    endTime: string;
    total: number;
  } | null>(null);

  useEffect(() => {
    loadRoomData();
  }, [id]);

  // Force re-render when customizations change
  useEffect(() => {
    forceUpdate({});
    setCurrentTotal(calculateTotal());
  }, [customizations, startTime, endTime, room]);

  const loadRoomData = async () => {
    try {
      const roomData = await getRoomById(Number(id));
      const feedbackData = await getRoomFeedback(Number(id));
      setRoom(roomData);
      setFeedbacks(feedbackData);
    } catch (err) {
      console.error('Failed to load room', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return { hours: 0, days: 0, halfDays: 0 };

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffTime = end.getTime() - start.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    // Calculate half days (12-hour periods)
    const halfDays = Math.ceil(diffHours / 12);

    return {
      hours: diffHours,
      days: Math.floor(diffDays),
      halfDays: halfDays
    };
  };

  const calculateTotal = () => {
    const duration = calculateDuration();
    // Ensure costPerDay is a number, not a string
    const costPerDay = Number(room?.cost) || 0;

    // If less than 6 hours, return 0 (invalid)
    if (duration.hours < 6) return 0;

    let basePrice = 0;
    // If 6-12 hours: half the daily cost
    if (duration.hours <= 12) basePrice = Math.round(costPerDay / 2);
    // If 12-24 hours: full daily cost
    else if (duration.hours <= 24) basePrice = costPerDay;
    // For multiple days: calculate full days
    else {
      const fullDays = Math.ceil(duration.hours / 24);
      basePrice = fullDays * costPerDay;
    }

    // Calculate customization costs - ensure all are numbers
    let customizationCost = 0;
    if (customizations.extraBed) customizationCost += Number(customizationPrices.extraBed);
    if (customizations.breakfast) customizationCost += Number(customizationPrices.breakfast);
    if (customizations.airportPickup) customizationCost += Number(customizationPrices.airportPickup);
    if (customizations.lateCheckout) customizationCost += Number(customizationPrices.lateCheckout);
    if (customizations.roomDecoration) customizationCost += Number(customizationPrices.roomDecoration);

    // Ensure final calculation is done with numbers
    const finalTotal = Number(basePrice) + Number(customizationCost);
    
    // Debug logging
    console.log('🔍 Calculate Total Debug:', {
      basePrice: Number(basePrice),
      basePriceType: typeof basePrice,
      customizations,
      customizationCost: Number(customizationCost),
      customizationCostType: typeof customizationCost,
      finalTotal: Number(finalTotal),
      finalTotalType: typeof finalTotal,
      startTime,
      endTime,
      roomCost: room?.cost,
      roomCostType: typeof room?.cost
    });

    return Number(finalTotal);
  };



  const getBaseRoomCost = () => {
    const duration = calculateDuration();
    // Ensure costPerDay is a number
    const costPerDay = Number(room?.cost) || 0;

    // If less than 6 hours, return 0 (invalid)
    if (duration.hours < 6) return 0;

    let basePrice = 0;
    // If 6-12 hours: half the daily cost
    if (duration.hours <= 12) basePrice = Math.round(costPerDay / 2);
    // If 12-24 hours: full daily cost
    else if (duration.hours <= 24) basePrice = costPerDay;
    // For multiple days: calculate full days
    else {
      const fullDays = Math.ceil(duration.hours / 24);
      basePrice = fullDays * costPerDay;
    }

    return basePrice;
  };

  const getDurationText = () => {
    const duration = calculateDuration();

    if (duration.hours < 6) return `${Math.round(duration.hours)} hours (minimum 6 hours required)`;
    if (duration.hours <= 12) return `${Math.round(duration.hours)} hours (Half day rate)`;
    if (duration.hours <= 24) return `${Math.round(duration.hours)} hours (Full day rate)`;

    return `${Math.round(duration.hours)} hours (${Math.ceil(duration.hours / 24)} day${Math.ceil(duration.hours / 24) > 1 ? 's' : ''})`;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate dates
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start < now) {
      setError('Check-in date cannot be in the past');
      return;
    }

    if (end <= start) {
      setError('Check-out date must be after check-in date');
      return;
    }

    // Check phone number
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    // Check minimum 6-hour stay requirement
    const duration = calculateDuration();
    if (duration.hours < 6) {
      setError('⚠️ Minimum stay requirement: 6 hours\n\nAs per our hotel policy, you must book for at least 6 hours. Please adjust your check-out time.');
      return;
    }

    // Directly proceed with booking (Pay at Check-in)
    await handleDirectBooking();
  };

  const handleDirectBooking = async () => {

    try {
      // Store booking details before clearing
      setBookingDetails({
        startTime,
        endTime,
        total: calculateTotal(),
      });

      await createBooking({
        roomId: Number(id),
        startTime,
        endTime,
        phoneNumber: phoneNumber,
        customizations: customizations,
      });

      setShowSuccessModal(true);
      setStartTime('');
      setEndTime('');
      setPhoneNumber('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };



  if (loading) return <div style={styles.loadingContainer}>Loading...</div>;
  if (!room) return <div style={styles.loadingContainer}>Room not found</div>;

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, fb) => acc + fb.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  return (
    <div style={styles.wrapper}>
      {/* Success Modal */}
      {showSuccessModal && bookingDetails && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.modalTitle}>Room Booked Successfully!</h2>
            <p style={styles.modalText}>
              Your booking for Room {room.room_number} has been confirmed.
            </p>
            <div style={styles.modalDetails}>
              <p>📅 Check-in: {new Date(bookingDetails.startTime).toLocaleString()}</p>
              <p>📅 Check-out: {new Date(bookingDetails.endTime).toLocaleString()}</p>
              <p>💰 Total Paid: ₹{bookingDetails.total}</p>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setBookingDetails(null);
                window.location.href = '/my-bookings';
              }}
              style={styles.modalButton}
            >
              View My Bookings
            </button>
          </div>
        </div>
      )}

      <div style={styles.container} className="room-detail-container">
        {/* Simple Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Room {room.room_number}</h1>
          <div style={styles.price}>₹{room.cost}<span style={styles.perNight}>/day</span></div>
        </div>

        {/* Room Types */}
        <div style={styles.types}>
          {(Array.isArray(room.room_type) ? room.room_type : [room.room_type]).map((type: string, idx: number) => (
            <span key={idx} style={styles.tag}>{type.replace('_', ' ')}</span>
          ))}
        </div>

        {/* Images */}
        {room.images && room.images.length > 0 && (
          <div style={styles.images}>
            {room.images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`Room ${idx + 1}`}
                style={styles.image}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ))}
          </div>
        )}

        {/* Simple Info */}
        <div style={styles.info}>
          <div style={styles.infoItem}>
            <span>👥 {room.capacity} Guests</span>
          </div>
          <div style={styles.infoItem}>
            <span>⭐ {getAverageRating()} ({feedbacks.length} reviews)</span>
          </div>
        </div>

        {/* Description */}
        <div style={styles.section}>
          <p style={styles.description}>{room.description}</p>
        </div>

        {/* Booking Form */}
        {user?.role === 'USER' && mode === 'book' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Book This Room</h3>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleBookingSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Check-in</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Check-out</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                  }}
                  min={startTime || new Date().toISOString().slice(0, 16)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  style={styles.input}
                />
              </div>

              {/* Customization Options */}
              <div style={styles.customizationSection}>
                <h4 style={styles.customizationTitle}>Optional Add-ons</h4>
                <div style={styles.customizationGrid}>
                  <label style={styles.customizationItem} className="customization-item">
                    <input
                      type="checkbox"
                      checked={customizations.extraBed}
                      onChange={(e) => setCustomizations(prev => ({...prev, extraBed: e.target.checked}))}
                      style={styles.checkbox}
                    />
                    <div style={styles.customizationInfo}>
                      <span style={styles.customizationName}>Extra Bed</span>
                      <span style={styles.customizationPrice}>+₹{customizationPrices.extraBed}</span>
                    </div>
                  </label>

                  <label style={styles.customizationItem} className="customization-item">
                    <input
                      type="checkbox"
                      checked={customizations.breakfast}
                      onChange={(e) => setCustomizations(prev => ({...prev, breakfast: e.target.checked}))}
                      style={styles.checkbox}
                    />
                    <div style={styles.customizationInfo}>
                      <span style={styles.customizationName}>Breakfast</span>
                      <span style={styles.customizationPrice}>+₹{customizationPrices.breakfast}</span>
                    </div>
                  </label>

                  <label style={styles.customizationItem} className="customization-item">
                    <input
                      type="checkbox"
                      checked={customizations.airportPickup}
                      onChange={(e) => setCustomizations(prev => ({...prev, airportPickup: e.target.checked}))}
                      style={styles.checkbox}
                    />
                    <div style={styles.customizationInfo}>
                      <span style={styles.customizationName}>Airport Pickup</span>
                      <span style={styles.customizationPrice}>+₹{customizationPrices.airportPickup}</span>
                    </div>
                  </label>

                  <label style={styles.customizationItem} className="customization-item">
                    <input
                      type="checkbox"
                      checked={customizations.lateCheckout}
                      onChange={(e) => setCustomizations(prev => ({...prev, lateCheckout: e.target.checked}))}
                      style={styles.checkbox}
                    />
                    <div style={styles.customizationInfo}>
                      <span style={styles.customizationName}>Late Checkout</span>
                      <span style={styles.customizationPrice}>+₹{customizationPrices.lateCheckout}</span>
                    </div>
                  </label>

                  <label style={styles.customizationItem} className="customization-item">
                    <input
                      type="checkbox"
                      checked={customizations.roomDecoration}
                      onChange={(e) => setCustomizations(prev => ({...prev, roomDecoration: e.target.checked}))}
                      style={styles.checkbox}
                    />
                    <div style={styles.customizationInfo}>
                      <span style={styles.customizationName}>Room Decoration</span>
                      <span style={styles.customizationPrice}>+₹{customizationPrices.roomDecoration}</span>
                    </div>
                  </label>
                </div>
              </div>

              {startTime && endTime && (
                <div key={JSON.stringify(customizations)} style={styles.priceBreakdown}>
                  <div style={styles.priceRow}>
                    <span>⏱️ Duration: {getDurationText()}</span>
                  </div>
                  <div style={styles.priceRow}>
                    <span>💵 Room Rate: ₹{Number(getBaseRoomCost()).toFixed(0)}</span>
                  </div>
                  {Object.entries(customizations)
                    .filter(([_, selected]) => selected)
                    .map(([key, _]) => (
                      <div key={key} style={styles.priceRow}>
                        <span>🎯 {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ₹{customizationPrices[key as keyof typeof customizationPrices]}</span>
                      </div>
                    ))
                  }
                  {calculateDuration().hours < 6 && (
                    <div style={styles.warningRow}>
                      <span>⚠️ Minimum 6 hours required</span>
                    </div>
                  )}
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total Amount:</span>
                    <span style={styles.totalAmount}>
                      {currentTotal > 0 ? `₹${Number(currentTotal).toFixed(0)}` : 'Invalid duration'}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div style={styles.paymentInfo}>
                <div style={styles.paymentIcon}>💵</div>
                <div>
                  <div style={styles.paymentDesc}>Pay ₹{Number(currentTotal).toFixed(0)} when you arrive at the hotel</div>
                </div>
              </div>

              <button type="submit" style={styles.button}>
                Book Now - Pay at Check-in
              </button>
            </form>
          </div>
        )}

        {/* Reviews */}
        {feedbacks.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Reviews ({feedbacks.length})</h3>
            {feedbacks.map((fb: any) => (
              <div key={fb.id} style={styles.review}>
                <div style={styles.reviewTop}>
                  <strong>{fb.user.name}</strong>
                  <span>{'⭐'.repeat(fb.rating)}</span>
                </div>
                <p style={styles.reviewText}>{fb.comment}</p>
                <small style={styles.reviewDate}>
                  {new Date(fb.created_at).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    paddingTop: '140px', // Increased margin to ensure room number is visible
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '1.2rem',
    color: '#6B7280',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: window.innerWidth <= 768 ? '1rem 0.75rem' : '2rem 1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
    marginBottom: '1rem',
    flexDirection: window.innerWidth <= 768 ? 'column' as const : 'row' as const,
    gap: window.innerWidth <= 768 ? '0.5rem' : '0',
  },
  title: {
    fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: 0,
  },
  price: {
    fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
    fontWeight: '700',
    color: '#667EEA',
  },
  perNight: {
    fontSize: '1rem',
    color: '#6B7280',
    fontWeight: '400',
  },
  types: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
  },
  tag: {
    padding: '0.5rem 1rem',
    backgroundColor: '#EEF2FF',
    color: '#6C5CE7',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  images: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  image: {
    width: '100%',
    height: '300px',
    objectFit: 'cover' as const,
    borderRadius: '12px',
    imageRendering: '-webkit-optimize-contrast' as const,
    backfaceVisibility: 'hidden' as const,
  },
  info: {
    display: 'flex',
    gap: window.innerWidth <= 768 ? '1rem' : '2rem',
    marginBottom: '2rem',
    padding: window.innerWidth <= 768 ? '1.25rem' : '1rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    flexDirection: window.innerWidth <= 768 ? 'column' as const : 'row' as const,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  infoItem: {
    fontSize: window.innerWidth <= 768 ? '1.1rem' : '1rem',
    color: '#1F2937',
    fontWeight: window.innerWidth <= 768 ? '500' : '400',
  },
  section: {
    backgroundColor: 'white',
    padding: window.innerWidth <= 768 ? '1.25rem' : '2rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem',
  },
  description: {
    fontSize: '1rem',
    color: '#6B7280',
    lineHeight: '1.7',
    margin: 0,
  },
  success: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    padding: window.innerWidth <= 768 ? '1rem' : '0.75rem',
    border: '1px solid #E5E7EB',
    borderRadius: window.innerWidth <= 768 ? '12px' : '8px',
    fontSize: window.innerWidth <= 768 ? '16px' : '1rem', // 16px prevents zoom on iOS
    minHeight: window.innerWidth <= 768 ? '48px' : 'auto',
  },
  button: {
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    color: 'white',
    padding: window.innerWidth <= 768 ? '0.625rem' : '0.5rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.75rem',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)',
    transition: 'all 0.3s ease',
    minHeight: window.innerWidth <= 768 ? '40px' : 'auto',
  },
  review: {
    padding: '1rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  reviewTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  reviewText: {
    color: '#6B7280',
    marginBottom: '0.5rem',
  },
  reviewDate: {
    fontSize: '0.85rem',
    color: '#9CA3AF',
  },
  priceBreakdown: {
    backgroundColor: '#F9FAFB',
    padding: '1.25rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  priceRow: {
    fontSize: '1rem',
    color: '#6B7280',
    marginBottom: '0.75rem',
  },
  warningRow: {
    fontSize: '0.95rem',
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: '0.75rem',
    padding: '0.5rem',
    backgroundColor: '#FEE2E2',
    borderRadius: '6px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.75rem',
    borderTop: '2px solid #E5E7EB',
  },
  totalLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#6C5CE7',
  },
  paymentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#F0F9FF',
    borderRadius: '12px',
    border: '1px solid #E0F2FE',
  },
  paymentIcon: {
    fontSize: '2.5rem',
  },
  paymentTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: '0.25rem',
  },
  paymentDesc: {
    fontSize: '0.9rem',
    color: '#0284C7',
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    backgroundColor: '#6C5CE7',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: window.innerWidth <= 768 ? '2rem 1.5rem' : '3rem 2rem',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxHeight: window.innerWidth <= 768 ? '90vh' : 'auto',
    overflow: 'auto',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    color: 'white',
    fontSize: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1rem',
  },
  modalText: {
    fontSize: '1.1rem',
    color: '#6B7280',
    marginBottom: '1.5rem',
  },
  modalDetails: {
    backgroundColor: '#F9FAFB',
    padding: '1.25rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    textAlign: 'left' as const,
  },
  modalButton: {
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    color: 'white',
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '700',
    width: '100%',
    transition: 'transform 0.2s',
  },
  customizationSection: {
    marginBottom: '1.5rem',
    padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  customizationTitle: {
    fontSize: window.innerWidth <= 768 ? '1.125rem' : '1.1rem',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: window.innerWidth <= 768 ? '1.25rem' : '1rem',
    textAlign: window.innerWidth <= 768 ? 'center' as const : 'left' as const,
  },
  customizationGrid: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
    gap: window.innerWidth <= 768 ? '1rem' : '0.75rem',
  },
  customizationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: window.innerWidth <= 768 ? '0.75rem' : '0.5rem',
    padding: window.innerWidth <= 768 ? '1rem' : '0.75rem',
    backgroundColor: 'white',
    borderRadius: window.innerWidth <= 768 ? '12px' : '8px',
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: window.innerWidth <= 768 ? '56px' : 'auto',
    boxShadow: window.innerWidth <= 768 ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
  },
  checkbox: {
    width: window.innerWidth <= 768 ? '18px' : '16px',
    height: window.innerWidth <= 768 ? '18px' : '16px',
    accentColor: '#667EEA',
    cursor: 'pointer',
    margin: 0,
    flexShrink: 0,
    appearance: 'auto' as const,
    marginTop: window.innerWidth <= 768 ? '3px' : '2px',
  },
  customizationInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
    width: '100%',
    paddingTop: window.innerWidth <= 768 ? '2px' : '1px',
  },
  customizationName: {
    fontSize: window.innerWidth <= 768 ? '1rem' : '0.9rem',
    fontWeight: '500',
    color: '#374151',
    lineHeight: '1.4',
  },
  customizationPrice: {
    fontSize: window.innerWidth <= 768 ? '1rem' : '0.9rem',
    fontWeight: '600',
    color: '#667EEA',
    whiteSpace: 'nowrap' as const,
  },
};

// Add mobile-specific CSS
if (typeof document !== 'undefined') {
  const mobileStyles = document.createElement('style');
  mobileStyles.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    
    @media (max-width: 768px) {
      /* Prevent zoom on input focus */
      input[type="datetime-local"],
      input[type="tel"] {
        font-size: 16px !important;
      }
      
      /* Better touch targets */
      .customization-item {
        min-height: 56px !important;
        padding: 1rem !important;
        display: flex !important;
        align-items: flex-start !important;
        gap: 0.75rem !important;
        cursor: pointer !important;
      }
      
      /* Checkbox styling */
      .customization-item input[type="checkbox"] {
        width: 18px !important;
        height: 18px !important;
        margin: 0 !important;
        margin-top: 2px !important;
        flex-shrink: 0 !important;
      }
      
      /* Content div styling */
      .customization-item > div {
        flex: 1 !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        width: 100% !important;
      }
      
      /* Text alignment */
      .customization-item span {
        line-height: 1.4 !important;
      }
      
      /* Smooth animations */
      .customization-item:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }
      
      /* Better spacing for mobile */
      .room-detail-container {
        padding: 1rem 0.75rem !important;
      }
      
      /* Improved button styling */
      button {
        -webkit-appearance: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Better image loading */
      img {
        image-rendering: -webkit-optimize-contrast;
        backface-visibility: hidden;
      }
    }
  `;
  
  if (!document.head.querySelector('#room-detail-mobile-styles')) {
    mobileStyles.id = 'room-detail-mobile-styles';
    document.head.appendChild(mobileStyles);
  }
}

export default RoomDetail;
