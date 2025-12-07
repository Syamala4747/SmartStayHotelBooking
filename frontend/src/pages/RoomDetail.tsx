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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    startTime: string;
    endTime: string;
    total: number;
  } | null>(null);

  useEffect(() => {
    loadRoomData();
  }, [id]);

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
    const costPerDay = room?.cost || 0;
    const costPerHalfDay = costPerDay / 2;
    
    // If less than 6 hours, return 0 (invalid)
    if (duration.hours < 6) return 0;
    
    // If 6-12 hours: half day rate
    if (duration.hours <= 12) return costPerHalfDay;
    
    // If 12-24 hours: full day rate
    if (duration.hours <= 24) return costPerDay;
    
    // For multiple days: calculate based on half-day periods
    // Each 12-hour period costs half a day
    return duration.halfDays * costPerHalfDay;
  };

  const getDurationText = () => {
    const duration = calculateDuration();
    
    if (duration.hours < 6) return 'Less than 6 hours (minimum required)';
    if (duration.hours <= 12) return '6-12 hours (Half day)';
    if (duration.hours <= 24) return '12-24 hours (Full day)';
    
    const days = Math.floor(duration.hours / 24);
    const remainingHours = duration.hours % 24;
    
    let text = '';
    if (days > 0) text += `${days} day${days > 1 ? 's' : ''}`;
    if (remainingHours >= 6) {
      if (text) text += ' + ';
      text += remainingHours <= 12 ? 'half day' : 'full day';
    }
    
    return text || `${Math.round(duration.hours)} hours`;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
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

    // Check minimum 6-hour stay requirement
    const duration = calculateDuration();
    if (duration.hours < 6) {
      setError('⚠️ Minimum stay requirement: 6 hours\n\nAs per our hotel policy, you must book for at least 6 hours. Please adjust your check-out time.');
      return;
    }

    // Show payment options
    setShowPaymentOptions(true);
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      setError('Please select a payment method');
      return;
    }

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
      });
      
      setShowPaymentOptions(false);
      setShowSuccessModal(true);
      setStartTime('');
      setEndTime('');
      setSelectedPayment('');
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
              <p>💰 Total Paid: ${bookingDetails.total}</p>
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
      
      <div style={styles.container}>
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
                    setShowPaymentOptions(false);
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
                    setShowPaymentOptions(false);
                  }}
                  min={startTime || new Date().toISOString().slice(0, 16)}
                  required
                  style={styles.input}
                />
              </div>

              {startTime && endTime && (
                <div style={styles.priceBreakdown}>
                  <div style={styles.priceRow}>
                    <span>⏱️ Duration: {getDurationText()}</span>
                  </div>
                  <div style={styles.priceRow}>
                    <span>💵 Rate: ₹{Math.ceil(room.cost / 24)}/hour (₹{room.cost}/day)</span>
                  </div>
                  {calculateDuration().hours < 6 && (
                    <div style={styles.warningRow}>
                      <span>⚠️ Minimum 6 hours required</span>
                    </div>
                  )}
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total Amount:</span>
                    <span style={styles.totalAmount}>
                      {calculateTotal() > 0 ? `$${calculateTotal()}` : 'Invalid duration'}
                    </span>
                  </div>
                </div>
              )}
              
              {!showPaymentOptions && (
                <button type="submit" style={styles.button}>
                  Continue to Payment
                </button>
              )}
            </form>

            {/* Payment Options */}
            {showPaymentOptions && (
              <div style={styles.paymentSection}>
                <h4 style={styles.paymentTitle}>Select Payment Method</h4>
                <div style={styles.paymentOptions}>
                  {['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Arrival'].map((method) => (
                    <div
                      key={method}
                      onClick={() => setSelectedPayment(method)}
                      style={{
                        ...styles.paymentOption,
                        border: selectedPayment === method ? '2px solid #6C5CE7' : '2px solid #E5E7EB',
                        backgroundColor: selectedPayment === method ? '#F3F0FF' : 'white',
                      }}
                    >
                      <div style={styles.paymentIcon}>
                        {method === 'Credit Card' && '💳'}
                        {method === 'Debit Card' && '💳'}
                        {method === 'UPI' && '📱'}
                        {method === 'Net Banking' && '🏦'}
                        {method === 'Cash on Arrival' && '💵'}
                      </div>
                      <span style={styles.paymentLabel}>{method}</span>
                      {selectedPayment === method && <span style={styles.checkmark}>✓</span>}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handlePayment}
                  disabled={!selectedPayment}
                  style={{
                    ...styles.button,
                    opacity: selectedPayment ? 1 : 0.5,
                    cursor: selectedPayment ? 'pointer' : 'not-allowed',
                  }}
                >
                  Pay ${calculateTotal()}
                </button>
              </div>
            )}
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
    paddingTop: '100px',
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
    padding: '2rem 1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: 0,
  },
  price: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#6C5CE7',
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
    gap: '2rem',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  infoItem: {
    fontSize: '1rem',
    color: '#1F2937',
  },
  section: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1.5rem',
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
    padding: '0.75rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  button: {
    background: '#6C5CE7',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
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
  paymentSection: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
  },
  paymentTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1.5rem',
  },
  paymentOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  paymentOption: {
    padding: '1.25rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative' as const,
  },
  paymentIcon: {
    fontSize: '2rem',
  },
  paymentLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center' as const,
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
    padding: '3rem 2rem',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
};

export default RoomDetail;
