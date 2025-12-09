import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../api/bookingsApi';
import { getRoomFeedback } from '../api/roomsApi';
import { createFeedback, updateFeedback, deleteFeedback } from '../api/feedbackApi';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<{ [key: number]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState<number | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<number | null>(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();

      // Ensure images is always an array for each booking's room
      const processedBookings = data.map((booking: any) => ({
        ...booking,
        room: {
          ...booking.room,
          images: Array.isArray(booking.room.images)
            ? booking.room.images
            : typeof booking.room.images === 'string'
              ? booking.room.images.split(',').map((img: string) => img.trim()).filter((img: string) => img)
              : []
        }
      }));

      setBookings(processedBookings);

      // Load feedbacks for each room
      const feedbackPromises = processedBookings.map(async (booking: any) => {
        const roomFeedbacks = await getRoomFeedback(booking.room.id);
        return { roomId: booking.room.id, feedbacks: roomFeedbacks };
      });

      const feedbackResults = await Promise.all(feedbackPromises);
      const feedbackMap: { [key: number]: any[] } = {};
      feedbackResults.forEach(result => {
        console.log('Feedbacks for room', result.roomId, ':', result.feedbacks);
        feedbackMap[result.roomId] = result.feedbacks;
      });
      setFeedbacks(feedbackMap);
    } catch (error) {
      console.error('Failed to load bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (booking: any) => {
    const startDate = new Date(booking.start_time);
    const endDate = new Date(booking.end_time);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);

    return {
      hours: diffHours,
      halfDays: Math.ceil(diffHours / 12)
    };
  };

  const getDurationText = (booking: any) => {
    const duration = calculateDuration(booking);

    if (duration.hours <= 12) return `${Math.round(duration.hours)} hours`;
    if (duration.hours <= 24) return '1 day';

    const days = Math.floor(duration.hours / 24);
    const remainingHours = duration.hours % 24;

    let text = `${days} day${days > 1 ? 's' : ''}`;
    if (remainingHours >= 6) {
      text += remainingHours <= 12 ? ' + half day' : ' + 1 day';
    }

    return text;
  };

  const calculateTotalCost = (booking: any) => {
    // Use stored total_cost if available
    if (booking.total_cost) {
      return Number(booking.total_cost);
    }

    // Fallback calculation matching backend logic
    const duration = calculateDuration(booking);
    const durationHours = Math.ceil(duration.hours);
    const dailyRate = booking.room.cost;
    const hourlyRate = dailyRate / 24;

    // Minimum 6 hours
    if (durationHours <= 6) {
      return Math.ceil(6 * hourlyRate);
    }

    // 6-12 hours: hourly rate
    if (durationHours <= 12) {
      return Math.ceil(durationHours * hourlyRate);
    }

    // 12-24 hours: full day rate
    if (durationHours <= 24) {
      return dailyRate;
    }

    // >24 hours: multiple days
    const days = Math.ceil(durationHours / 24);
    return days * dailyRate;
  };

  const isBookingCompleted = (booking: any) => {
    const now = new Date();
    const endDate = new Date(booking.end_time);
    return endDate < now;
  };

  const getUserFeedback = (booking: any) => {
    const roomFeedbacks = feedbacks[booking.room.id] || [];
    return roomFeedbacks.find((fb: any) => fb.user.id === user?.id);
  };

  const handleSubmitFeedback = async (roomId: number) => {
    if (feedbackData.rating === 0) {
      setToast({ message: 'Please select a rating', type: 'error' });
      return;
    }

    if (!feedbackData.comment.trim()) {
      setToast({ message: 'Please write a comment', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      if (editingFeedback) {
        await updateFeedback(editingFeedback, feedbackData);
        setToast({ message: 'Feedback updated successfully!', type: 'success' });
        setEditingFeedback(null);
      } else {
        await createFeedback(roomId, feedbackData);
        setToast({ message: 'Thank you for your feedback!', type: 'success' });
      }
      setShowFeedbackForm(null);
      setFeedbackData({ rating: 0, comment: '' });
      await loadBookings(); // Reload to show updated feedback
    } catch (error: any) {
      console.error('Failed to submit feedback', error);
      setToast({ message: 'Failed to submit feedback. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = (feedback: any, bookingId: number) => {
    console.log('Edit clicked:', { feedbackId: feedback.id, bookingId, rating: feedback.rating, comment: feedback.comment });
    setEditingFeedback(feedback.id);
    setFeedbackData({ rating: feedback.rating, comment: feedback.comment });
    setShowFeedbackForm(bookingId);
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    setConfirmDelete(null);

    try {
      await deleteFeedback(feedbackId);
      setToast({ message: 'Feedback deleted successfully!', type: 'success' });
      loadBookings();
    } catch (error: any) {
      console.error('Failed to delete feedback', error);
      setToast({ message: 'Failed to delete feedback. Please try again.', type: 'error' });
    }
  };



  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.wrapper}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete your feedback? This action cannot be undone."
          onConfirm={() => handleDeleteFeedback(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      <div style={styles.container}>
        <h1 style={styles.title}>My Bookings</h1>

        <div style={styles.contactBox}>
          <p style={styles.contactText}>
            📞 For any queries or to cancel a booking, please contact the manager at <strong>9XXXXXXXXX</strong>
          </p>
        </div>

        {bookings.length === 0 ? (
          <div style={styles.empty}>
            <p>No bookings</p>
            <button onClick={() => navigate('/rooms')} style={styles.btn}>
              Browse Rooms
            </button>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} style={styles.card}>
              <div style={styles.row}>
                {booking.room.images && booking.room.images.length > 0 && (
                  <img
                    src={booking.room.images[0]}
                    alt="Room"
                    style={styles.img}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div style={styles.info}>
                  <div style={styles.top}>
                    <h3 style={styles.room}>Room {booking.room.room_number}</h3>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: booking.status === 'CANCELLED' ? '#FEE2E2' : '#D1FAE5',
                      color: booking.status === 'CANCELLED' ? '#DC2626' : '#059669',
                    }}>
                      {booking.status}
                    </span>
                  </div>

                  <p style={styles.text}>
                    📅 {new Date(booking.start_time).toLocaleDateString()} → {new Date(booking.end_time).toLocaleDateString()}
                  </p>

                  <div style={styles.costBox}>
                    <p style={styles.costLine}>
                      ⏱️ Duration: {getDurationText(booking)}
                    </p>
                    <p style={styles.totalLine}>
                      💰 Total: ₹{calculateTotalCost(booking)}
                    </p>
                  </div>

                  {/* Add-ons */}
                  {booking.customizations && Object.entries(booking.customizations).some(([_, selected]) => selected) && (
                    <div style={styles.addOnsBox}>
                      <p style={styles.addOnsTitle}>🎯 Add-ons:</p>
                      <div style={styles.addOnsList}>
                        {Object.entries(booking.customizations)
                          .filter(([_, selected]) => selected)
                          .map(([key, _]) => (
                            <span key={key} style={styles.addOnTag}>
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {isBookingCompleted(booking) && (() => {
                    const userFeedback = getUserFeedback(booking);

                    if (showFeedbackForm === booking.id) {
                      return (
                        <div style={styles.form}>
                          <div style={styles.ratingLabel}>Rating: {feedbackData.rating}/5</div>
                          <div style={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => {
                                  console.log('Star clicked:', star, 'Current rating:', feedbackData.rating);
                                  setFeedbackData({ ...feedbackData, rating: star });
                                }}
                                style={{
                                  ...styles.starButton,
                                  color: star <= feedbackData.rating ? '#FFD700' : '#D1D5DB',
                                }}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={feedbackData.comment}
                            onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                            placeholder="Your review..."
                            style={styles.input}
                            rows={2}
                          />
                          <div style={styles.btns}>
                            <button
                              onClick={() => handleSubmitFeedback(booking.room.id)}
                              disabled={submitting}
                              style={styles.btn}
                            >
                              {submitting ? '...' : editingFeedback ? 'Update' : 'Submit'}
                            </button>
                            <button
                              onClick={() => {
                                setShowFeedbackForm(null);
                                setEditingFeedback(null);
                                setFeedbackData({ rating: 5, comment: '' });
                              }}
                              style={styles.cancelBtn}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (userFeedback) {
                      console.log('Displaying feedback:', userFeedback, 'Rating:', userFeedback.rating);
                      return (
                        <div style={styles.feedbackDisplay}>
                          <div style={styles.feedbackRow}>
                            <div style={styles.feedbackLeft}>
                              <div style={styles.userAvatar}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div style={styles.feedbackInfo}>
                                <span style={styles.userName}>{user?.name}</span>
                                <div style={styles.stars}>
                                  {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = star <= userFeedback.rating;
                                    console.log(`Star ${star}: ${isActive ? 'GOLD' : 'GRAY'} (rating: ${userFeedback.rating})`);
                                    return (
                                      <span
                                        key={star}
                                        style={{
                                          fontSize: '1rem',
                                          color: isActive ? '#FFD700' : '#D1D5DB',
                                          lineHeight: '1',
                                        }}
                                      >
                                        ★
                                      </span>
                                    );
                                  })}
                                </div>
                                <p style={styles.feedbackComment}>{userFeedback.comment}</p>
                              </div>
                            </div>
                            <div style={styles.feedbackActions}>
                              <button
                                onClick={() => handleEditFeedback(userFeedback, booking.id)}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.15)';
                                  const svg = e.currentTarget.querySelector('svg path');
                                  if (svg) svg.setAttribute('stroke', '#3B82F6');
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  const svg = e.currentTarget.querySelector('svg path');
                                  if (svg) svg.setAttribute('stroke', '#6B7280');
                                }}
                                style={styles.editBtn}
                                title="Edit review"
                              >
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setConfirmDelete(userFeedback.id)}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.15)';
                                  const svg = e.currentTarget.querySelector('svg path');
                                  if (svg) svg.setAttribute('stroke', '#EF4444');
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  const svg = e.currentTarget.querySelector('svg path');
                                  if (svg) svg.setAttribute('stroke', '#6B7280');
                                }}
                                style={styles.deleteBtn}
                                title="Delete review"
                              >
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 4H14M5 4V2H11V4M6 7V12M10 7V12M3 4L4 14H12L13 4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        onClick={() => {
                          setFeedbackData({ rating: 0, comment: '' });
                          setEditingFeedback(null);
                          setShowFeedbackForm(booking.id);
                        }}
                        style={styles.btn}
                      >
                        Review
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    paddingTop: isMobile ? '180px' : '140px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: isMobile ? '1.5rem 1rem' : '2rem 1rem',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  title: {
    fontSize: isMobile ? '1.75rem' : '2rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1.5rem',
    marginTop: '0',
  },
  contactBox: {
    backgroundColor: '#EEF2FF',
    border: '1px solid #6C5CE7',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '3rem',
    marginBottom: '2rem',
  },
  contactText: {
    fontSize: '0.95rem',
    color: '#1F2937',
    margin: 0,
  },
  empty: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: isMobile ? '1.25rem' : '1rem',
    marginBottom: '1rem',
    border: '1px solid #e5e5e5',
    width: '100%',
    boxSizing: 'border-box' as const,
    boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
  },
  row: {
    display: 'flex',
    gap: isMobile ? '0.75rem' : '1rem',
    alignItems: 'flex-start',
    flexDirection: isMobile ? 'column' as const : 'row' as const,
  },
  img: {
    width: isMobile ? '100%' : '100px',
    height: isMobile ? '200px' : '100px',
    objectFit: 'cover' as const,
    borderRadius: '6px',
    flexShrink: 0,
    imageRendering: '-webkit-optimize-contrast' as const,
    backfaceVisibility: 'hidden' as const,
  },
  info: {
    flex: 1,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  room: {
    fontSize: isMobile ? '1.25rem' : '1.1rem',
    fontWeight: '600',
    color: '#1F2937',
    margin: 0,
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  text: {
    fontSize: isMobile ? '1rem' : '0.9rem',
    color: '#6B7280',
    margin: '0.25rem 0',
    lineHeight: isMobile ? '1.5' : '1.2',
  },
  costBox: {
    backgroundColor: '#F9FAFB',
    padding: '0.75rem',
    borderRadius: '6px',
    marginTop: '0.5rem',
  },
  costLine: {
    fontSize: isMobile ? '1rem' : '0.9rem',
    color: '#6B7280',
    margin: '0 0 0.5rem 0',
  },
  totalLine: {
    fontSize: isMobile ? '1.25rem' : '1rem',
    fontWeight: '700',
    color: '#6C5CE7',
    margin: 0,
  },
  addOnsBox: {
    backgroundColor: '#EEF2FF',
    padding: '0.75rem',
    borderRadius: '6px',
    marginTop: '0.5rem',
  },
  addOnsTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4F46E5',
    margin: '0 0 0.5rem 0',
  },
  addOnsList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.25rem',
  },
  addOnTag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#FFFFFF',
    color: '#4F46E5',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    border: '1px solid #C7D2FE',
  },
  btn: {
    backgroundColor: '#6C5CE7',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginTop: '0.5rem',
    marginRight: '0.5rem',
  },
  form: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    fontFamily: 'inherit',
  },
  btns: {
    display: 'flex',
    gap: '0.5rem',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover' as const,
    imageRendering: '-webkit-optimize-contrast' as const,
    backfaceVisibility: 'hidden' as const,
  },
  content: {
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  roomTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: 0,
  },
  status: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  types: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
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
  dates: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
  },
  label: {
    fontSize: '0.85rem',
    color: '#6B7280',
    marginBottom: '0.25rem',
  },
  value: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1F2937',
  },
  cost: {
    padding: '1rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  costItem: {
    fontSize: '0.9rem',
    color: '#6B7280',
    marginBottom: '0.5rem',
  },
  total: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#6C5CE7',
  },
  button: {
    backgroundColor: '#6C5CE7',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    width: '100%',
  },
  cancelBtn: {
    backgroundColor: '#DC2626',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  feedback: {
    padding: '1rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  ratingLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  stars: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '0.5rem',
  },
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.8rem',
    padding: '0',
    lineHeight: '1',
    transition: 'transform 0.1s, color 0.1s',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '0.75rem',
    fontFamily: 'inherit',
  },
  btnGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
  },
  feedbackDisplay: {
    marginTop: '0.5rem',
    padding: '0.4rem 0.6rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '4px',
    border: '1px solid #E5E7EB',
  },
  feedbackRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },
  feedbackLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flex: 1,
    minWidth: 0,
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#6C5CE7',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  feedbackInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flex: 1,
    minWidth: 0,
  },
  feedbackTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#1F2937',
    whiteSpace: 'nowrap' as const,
  },
  feedbackActions: {
    display: 'flex',
    gap: '0.4rem',
    flexShrink: 0,
  },
  feedbackComment: {
    fontSize: '0.75rem',
    color: '#6B7280',
    margin: 0,
    lineHeight: '1.2',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    flex: 1,
  },
  editBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    transition: 'all 0.2s',
  },

};

export default MyBookings;
