import { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../api/roomsApi';
import { getAllBookings } from '../api/bookingsApi';
import Toast from '../components/Toast';

const AdminRooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedRoomBookings, setSelectedRoomBookings] = useState<any[]>([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: '',
    cost: '',
    capacity: '',
    description: '',
    images: '',
  });

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadRooms = async () => {
    try {
      const data = await getRooms();
      console.log('📋 Loaded rooms in admin:', data);
      data.forEach((room: any) => {
        console.log(`Room ${room.room_number} images:`, room.images, 'Type:', typeof room.images);
      });
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return;

    // Validate file names and extensions
    const invalidFiles = selectedFiles.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return !ext || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    });

    if (invalidFiles.length > 0) {
      const fileList = invalidFiles.map(f => `"${f.name}"`).join(', ');
      setToast({
        message: `Invalid file(s): ${fileList}. Only image files (.jpg, .png, .gif, .webp) are allowed.`,
        type: 'error'
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Upload failed: ${response.status}`;

        // Parse error message if possible
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (e) {
          // Use raw error text
          errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Upload response:', data);
      setUploadedImages([...uploadedImages, ...data.images]);
      setSelectedFiles([]);
    } catch (error: any) {
      console.error('Failed to upload images', error);
      setToast({
        message: `Upload failed: ${error.message}`,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setUploadedImages(uploadedImages.filter(img => img !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 Form Data on submit:', formData);
    console.log('💰 Cost:', formData.cost, '| Type:', typeof formData.cost);
    console.log('👥 Capacity:', formData.capacity, '| Type:', typeof formData.capacity);

    // Validate required fields
    if (!formData.room_number.trim()) {
      setToast({ message: 'Room number is required', type: 'error' });
      return;
    }

    if (!formData.cost || Number(formData.cost) <= 0) {
      setToast({ message: 'Please enter a valid cost', type: 'error' });
      return;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      setToast({ message: 'Please enter a valid capacity', type: 'error' });
      return;
    }

    if (!formData.room_type.trim()) {
      setToast({ message: 'Please enter room type(s)', type: 'error' });
      return;
    }

    if (!formData.description.trim()) {
      setToast({ message: 'Description is required', type: 'error' });
      return;
    }

    const allImages = [
      ...uploadedImages,
      ...(formData.images ? formData.images.split(',').map(s => s.trim()).filter(s => s) : [])
    ].filter(img => img);

    console.log('🖼️ All images to save:', allImages);
    console.log('📤 Uploaded images:', uploadedImages);
    console.log('📝 Form images:', formData.images);

    // Warn if no images
    if (allImages.length === 0) {
      const proceed = window.confirm(
        '⚠️ No images added!\n\n' +
        'You can:\n' +
        '1. Upload images from your computer (recommended)\n' +
        '2. Paste image URLs\n\n' +
        'Do you want to create the room without images?'
      );
      if (!proceed) {
        return;
      }
    }

    // Convert comma-separated string to array
    const roomTypes = formData.room_type
      .split(',')
      .map(type => type.trim().toUpperCase().replace(/\s+/g, '_'))
      .filter(type => type);

    const roomData = {
      room_number: formData.room_number,
      room_type: roomTypes,
      cost: Number(formData.cost),
      capacity: Number(formData.capacity),
      description: formData.description,
      images: allImages,
    };

    console.log('💾 Sending room data:', roomData);
    console.log('💾 Capacity being sent:', roomData.capacity, 'Type:', typeof roomData.capacity);
    console.log('💾 Full JSON:', JSON.stringify(roomData, null, 2));

    try {
      let result;
      if (editingRoom) {
        result = await updateRoom(editingRoom.id, roomData);
        console.log('✅ Update result:', result);
      } else {
        result = await createRoom(roomData);
        console.log('✅ Create result:', result);
      }

      setToast({
        message: editingRoom ? 'Room updated successfully!' : 'New room added successfully!',
        type: 'success'
      });

      setShowForm(false);
      setEditingRoom(null);
      setSelectedFiles([]);
      setUploadedImages([]);
      setFormData({
        room_number: '',
        room_type: '',
        cost: '',
        capacity: '',
        description: '',
        images: '',
      });
      loadRooms();
    } catch (error: any) {
      console.error('❌ Failed to save room:', error);
      console.error('Error response:', error.response?.data);
      setToast({
        message: `Failed to save room: ${error.response?.data?.message || error.message}`,
        type: 'error'
      });
    }
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    const existingImages = Array.isArray(room.images) ? room.images : [];
    setUploadedImages(existingImages);

    // Convert room_type array to comma-separated string
    const roomTypeString = Array.isArray(room.room_type)
      ? room.room_type.map((type: string) => type.replace(/_/g, ' ')).join(', ')
      : room.room_type.replace(/_/g, ' ');

    setFormData({
      room_number: room.room_number,
      room_type: roomTypeString,
      cost: room.cost.toString(),
      capacity: room.capacity?.toString() || '',
      description: room.description,
      images: '',
    });
    setShowForm(true);
  };

  const handleViewBookings = async (roomId: number, roomNumber: string) => {
    setLoadingBookings(true);
    setSelectedRoomNumber(roomNumber);
    setShowBookingsModal(true);

    try {
      console.log(`🔍 Frontend: Requesting bookings for room ${roomId}`);
      // Use getAllBookings and filter for the room (same data as "All Bookings" page)
      const allBookings = await getAllBookings();
      const bookings = allBookings.filter((booking: any) =>
        booking.room?.id === roomId || booking.room?.room_number === roomNumber
      );
      console.log(`🔍 Filtered ${bookings.length} bookings for room ${roomNumber} from ${allBookings.length} total`);

      console.log('🔍 Frontend: Complete API response:', JSON.stringify(bookings, null, 2));

      // Compare with what getAllBookings would return
      console.log('� Frontend: Ddetailed booking analysis:');
      if (bookings && bookings.length > 0) {
        bookings.forEach((booking: any, index: number) => {
          console.log(`📋 Booking ${index + 1}:`, {
            id: booking.id,
            has_user_object: !!booking.user,
            user_object_keys: booking.user ? Object.keys(booking.user) : 'NO USER OBJECT',
            user_name: booking.user?.name,
            user_email: booking.user?.email,
            user_id: booking.user?.id,
            room_id: booking.room?.id,
            room_number: booking.room?.room_number,
            start_time: booking.start_time
          });
        });
      } else {
        console.log('❌ No bookings returned or empty array');
      }

      setSelectedRoomBookings(bookings || []);
    } catch (error) {
      console.error('Failed to load room bookings', error);
      setSelectedRoomBookings([]);
      setToast({
        message: 'Failed to load bookings for this room',
        type: 'error'
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this room?')) {
      try {
        await deleteRoom(id);
        loadRooms();
      } catch (error) {
        console.error('Failed to delete room', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: '#E0F2FE', color: '#0369A1' };
      case 'CHECKED_IN':
        return { bg: '#D1FAE5', color: '#047857' };
      case 'CHECKED_OUT':
        return { bg: '#E9D5FF', color: '#7C3AED' };
      case 'CANCELLED':
        return { bg: '#FECACA', color: '#B91C1C' };
      case 'UNKNOWN':
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <div style={styles.wrapper}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Room Bookings Modal */}
      {showBookingsModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBookingsModal(false)}>
          <div style={styles.bookingsModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Room {selectedRoomNumber} - Booked Time Slots</h2>
              <button
                onClick={() => setShowBookingsModal(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              {loadingBookings ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.loadingSpinner}></div>
                  <p>Loading bookings...</p>
                </div>
              ) : selectedRoomBookings.length === 0 ? (
                <div style={styles.emptyBookings}>
                  <div style={styles.emptyIcon}>📅</div>
                  <h3>No Booked Slots</h3>
                  <p>This room has no time slots booked yet.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  {!isMobile && (
                    <div style={styles.bookingsTable}>
                      <table style={styles.table} className="bookings-table">
                        <thead>
                          <tr style={styles.headerRow}>
                            <th style={styles.th}>Guest</th>
                            <th style={styles.th}>Phone</th>
                            <th style={styles.th}>Add-ons</th>
                            <th style={styles.th}>Check-in</th>
                            <th style={styles.th}>Check-out</th>
                            <th style={styles.th}>Duration</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedRoomBookings || []).filter(booking => booking && booking.id).map((booking) => {
                            const startDate = booking.start_time ? new Date(booking.start_time) : new Date();
                            const endDate = booking.end_time ? new Date(booking.end_time) : new Date();
                            const durationHours = booking.duration_hours || Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
                            const statusColors = getStatusColor(booking.status || 'UNKNOWN');

                            // Debug: Log what's actually in the booking object
                            console.log(`🔍 Booking ${booking.id} complete object:`, booking);
                            console.log(`🔍 Booking ${booking.id} user object:`, booking.user);
                            console.log(`🔍 Booking ${booking.id} all properties:`, Object.keys(booking));

                            return (
                              <tr key={booking.id} style={styles.bookingRow}>
                                <td style={styles.td}>
                                  <div>
                                    <div style={styles.guestName} className="guest-name">
                                      {booking.user?.name || booking.userName}
                                    </div>
                                    <div style={styles.guestEmail}>
                                      {booking.user?.email || booking.userEmail}
                                    </div>
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <div style={styles.phoneCell}>
                                    📱 {booking.phone_number || 'Not provided'}
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <div style={styles.customizationsCell}>
                                    {booking.customizations && (booking.customizations as any).specialRequests 
                                      ? (booking.customizations as any).specialRequests 
                                      : 'None'}
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <div>
                                    <div>{startDate.toLocaleDateString() || 'Invalid Date'}</div>
                                    <div style={styles.timeText}>{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '--:--'}</div>
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <div>
                                    <div>{endDate.toLocaleDateString() || 'Invalid Date'}</div>
                                    <div style={styles.timeText}>{endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '--:--'}</div>
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <span style={styles.duration}>{durationHours}h</span>
                                </td>
                                <td style={styles.td}>
                                  <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: statusColors.bg,
                                    color: statusColors.color,
                                  }}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td style={styles.td}>
                                  <span style={styles.revenue}>₹{booking.total_cost || 'N/A'}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Mobile Card View */}
                  {isMobile && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      padding: '0.5rem',
                    }}>
                      {(selectedRoomBookings || []).filter(booking => booking && booking.id).map((booking) => {
                        const startDate = booking.start_time ? new Date(booking.start_time) : new Date();
                        const endDate = booking.end_time ? new Date(booking.end_time) : new Date();
                        const durationHours = booking.duration_hours || Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
                        const statusColors = getStatusColor(booking.status || 'UNKNOWN');

                        return (
                          <div key={booking.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            marginBottom: '0.75rem',
                          }}>
                            {/* Booking ID Header */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '1rem',
                              paddingBottom: '0.75rem',
                              borderBottom: '2px solid #F3F4F6',
                            }}>
                              <div style={{
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: '#6366F1',
                                backgroundColor: '#EEF2FF',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #C7D2FE',
                              }}>
                                #{booking.id}
                              </div>
                              <div style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                textAlign: 'center',
                                backgroundColor: statusColors.bg,
                                color: statusColors.color,
                                minWidth: '80px',
                              }}>
                                {booking.status}
                              </div>
                            </div>

                            {/* Guest Information */}
                            <div style={{
                              backgroundColor: '#F8FAFC',
                              padding: '1rem',
                              borderRadius: '12px',
                              marginBottom: '1rem',
                              border: '1px solid #E2E8F0',
                            }}>
                              <div style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#475569',
                                marginBottom: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}>
                                👤 Guest Information
                              </div>
                              <div style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: '#1F2937',
                                marginBottom: '0.5rem',
                              }}>
                                {booking.user?.name || booking.userName || 'Guest User'}
                              </div>
                              <div style={{
                                fontSize: '0.95rem',
                                color: '#6B7280',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}>
                                � {booking.user?.email || booking.userEmail || 'No email provided'}
                              </div>
                              <div style={{
                                fontSize: '0.95rem',
                                color: '#374151',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}>
                                📱 {booking.phone_number || 'No phone provided'}
                              </div>
                            </div>

                            {/* Booking Times */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0.75rem',
                              marginBottom: '1rem',
                            }}>
                              {/* Check-in */}
                              <div style={{
                                backgroundColor: '#F0FDF4',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid #BBF7D0',
                                textAlign: 'center',
                              }}>
                                <div style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  color: '#059669',
                                  marginBottom: '0.5rem',
                                }}>
                                  📅 CHECK-IN
                                </div>
                                <div style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  color: '#1F2937',
                                  marginBottom: '0.25rem',
                                }}>
                                  {startDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div style={{
                                  fontSize: '1rem',
                                  color: '#059669',
                                  fontWeight: '700',
                                }}>
                                  {startDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                              </div>

                              {/* Check-out */}
                              <div style={{
                                backgroundColor: '#FEF2F2',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid #FECACA',
                                textAlign: 'center',
                              }}>
                                <div style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  color: '#DC2626',
                                  marginBottom: '0.5rem',
                                }}>
                                  📅 CHECK-OUT
                                </div>
                                <div style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  color: '#1F2937',
                                  marginBottom: '0.25rem',
                                }}>
                                  {endDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div style={{
                                  fontSize: '1rem',
                                  color: '#DC2626',
                                  fontWeight: '700',
                                }}>
                                  {endDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Duration and Revenue */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0.75rem',
                              marginBottom: '1rem',
                            }}>
                              <div style={{
                                backgroundColor: '#F0F9FF',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid #BAE6FD',
                                textAlign: 'center',
                              }}>
                                <div style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  color: '#0369A1',
                                  marginBottom: '0.5rem',
                                }}>
                                  ⏱️ DURATION
                                </div>
                                <div style={{
                                  fontSize: '1.5rem',
                                  fontWeight: '800',
                                  color: '#0284C7',
                                }}>
                                  {durationHours}h
                                </div>
                              </div>

                              <div style={{
                                backgroundColor: '#F0FDF4',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid #BBF7D0',
                                textAlign: 'center',
                              }}>
                                <div style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  color: '#059669',
                                  marginBottom: '0.5rem',
                                }}>
                                  💰 REVENUE
                                </div>
                                <div style={{
                                  fontSize: '1.5rem',
                                  fontWeight: '800',
                                  color: '#059669',
                                }}>
                                  ₹{booking.total_cost || 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Add-ons Section */}
                            <div style={{
                              backgroundColor: '#FEFCE8',
                              padding: '1rem',
                              borderRadius: '12px',
                              border: '1px solid #FEF08A',
                            }}>
                              <div style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#CA8A04',
                                marginBottom: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}>
                                📝 Special Requests
                              </div>
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#4F46E5',
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap' as const,
                                wordBreak: 'break-word' as const,
                                fontWeight: '500',
                                padding: '0.5rem',
                                backgroundColor: '#EEF2FF',
                                borderRadius: '8px',
                                border: '1px solid #C7D2FE',
                              }}>
                                {booking.customizations && (booking.customizations as any).specialRequests 
                                  ? (booking.customizations as any).specialRequests 
                                  : 'None'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={styles.hero} className="dashboard-hero">
        <div style={styles.heroContent}>
          <span style={styles.badge}>🏨 Admin Panel</span>
          <h1 style={styles.heroTitle} className="dashboard-hero-title">
            Manage <span style={styles.gradient}>Rooms</span>
          </h1>
          <p style={styles.heroDesc} className="dashboard-hero-desc">
            Create, edit, and manage all hotel rooms from one central dashboard
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingRoom(null);
                setSelectedFiles([]);
                setUploadedImages([]);
                setFormData({
                  room_number: '',
                  room_type: '',
                  cost: '',
                  capacity: '',
                  description: '',
                  images: '',
                });
              }}
              style={styles.addButton}
              className="dashboard-add-button"
            >
              {showForm ? '✕ Cancel' : '+ Add New Room'}
            </button>


          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={styles.contentSection} className="dashboard-content-section">
        <div style={styles.container}>

          {showForm && (
            <div style={styles.formCard} className="dashboard-form-card">
              <h2>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label>Room Number</label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>Room Type</label>
                  <input
                    type="text"
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                    placeholder="e.g., AC, 2BHK, Non AC, 3BHK"
                    required
                    style={styles.input}
                  />
                  <small style={styles.helpText}>
                    Enter room types separated by commas (e.g., AC, 2BHK, Deluxe)
                  </small>
                </div>

                <div style={styles.formGroup}>
                  <label>Cost (per night)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>



                <div style={styles.formGroup}>
                  <label>How many people can accommodate?</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => {
                      console.log('Capacity input changed to:', e.target.value);
                      setFormData({ ...formData, capacity: e.target.value });
                    }}
                    required
                    min="1"
                    step="1"
                    placeholder="e.g., 2, 4, 6"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    style={{ ...styles.input, minHeight: '100px' }}
                  />
                </div>

                <div style={styles.formGroup}>


                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={styles.input}
                  />
                  {selectedFiles.length > 0 && (
                    <div style={styles.fileInfo}>
                      <p><strong>📁 {selectedFiles.length} file(s) selected</strong></p>
                      <p style={styles.fileInfoText}>Click the button below to upload these files:</p>
                      <button
                        type="button"
                        onClick={handleUploadImages}
                        disabled={uploading}
                        style={styles.uploadButton}
                      >
                        {uploading ? '⏳ Uploading...' : '⬆️ Upload Images'}
                      </button>
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <div style={styles.uploadedImages}>
                      <p style={styles.uploadedLabel}>✅ Uploaded Images ({uploadedImages.length}):</p>
                      <div style={styles.imagePreview}>
                        {uploadedImages.map((url, idx) => (
                          <div key={idx} style={styles.imageWrapper}>
                            <img
                              src={url}
                              alt={`Upload ${idx}`}
                              style={styles.previewImg}
                              loading="lazy"
                              decoding="async"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(url)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.backgroundColor = '#DC2626';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = '#EF4444';
                              }}
                              style={styles.removeBtn}
                              title="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>

                </div>

                <button type="submit" style={styles.submitButton}>
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </form>
            </div>
          )}

          {/* Mobile Card View */}
          {isMobile ? (
            <div style={styles.mobileCardsContainer}>
              {rooms.map((room) => (
                <div key={room.id} style={styles.mobileCard}>
                  <div style={styles.mobileCardHeader}>
                    <h3 style={styles.mobileRoomNumber}>Room {room.room_number}</h3>
                    {room.is_active ? (
                      <span style={styles.active}>Active</span>
                    ) : (
                      <span style={styles.inactive}>Inactive</span>
                    )}
                  </div>

                  <div style={styles.mobileCardBody}>
                    <div style={styles.mobileInfoRow}>
                      <span style={styles.mobileLabel}>Type:</span>
                      <span style={styles.mobileValue}>
                        {Array.isArray(room.room_type)
                          ? room.room_type.join(', ')
                          : room.room_type}
                      </span>
                    </div>

                    <div style={styles.mobileInfoRow}>
                      <span style={styles.mobileLabel}>Cost:</span>
                      <span style={styles.mobileValue}>₹{room.cost}</span>
                    </div>

                    <div style={styles.mobileInfoRow}>
                      <span style={styles.mobileLabel}>Capacity:</span>
                      <span style={styles.mobileValue}>👥 {room.capacity}</span>
                    </div>
                  </div>

                  <div style={styles.mobileCardActions}>
                    <button
                      onClick={() => handleViewBookings(room.id, room.room_number)}
                      style={styles.viewBookingsButton}
                      title="View Booked Slots"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 2v4"></path>
                        <path d="M16 2v4"></path>
                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                        <path d="M3 10h18"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(room)}
                      style={styles.editButton}
                      title="Edit"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      style={styles.deleteButton}
                      title="Delete"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop Table View */
            <div style={styles.tableContainer} className="dashboard-table-container">
              <table style={styles.table} className="dashboard-table">
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.th}>Room Number</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Cost</th>
                    <th style={styles.th}>Capacity</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} style={styles.row}>
                      <td style={styles.td}>{room.room_number}</td>
                      <td style={styles.td}>
                        {Array.isArray(room.room_type)
                          ? room.room_type.join(', ')
                          : room.room_type}
                      </td>
                      <td style={styles.td}>₹{room.cost}</td>
                      <td style={styles.td}>👥 {room.capacity}</td>
                      <td style={styles.td}>
                        {room.is_active ? (
                          <span style={styles.active}>Active</span>
                        ) : (
                          <span style={styles.inactive}>Inactive</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtonsContainer}>
                          <button
                            onClick={() => handleViewBookings(room.id, room.room_number)}
                            style={styles.viewBookingsButton}
                            title="View Booked Slots"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M8 2v4"></path>
                              <path d="M16 2v4"></path>
                              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                              <path d="M3 10h18"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(room)}
                            style={styles.editButton}
                            title="Edit Room"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            style={styles.deleteButton}
                            title="Delete Room"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  // Hero Section
  hero: {
    marginTop: window.innerWidth <= 768 ? '120px' : '100px',
    paddingTop: window.innerWidth <= 768 ? '1.5rem' : '4rem',
    paddingBottom: window.innerWidth <= 768 ? '2rem' : '4rem',
    paddingLeft: window.innerWidth <= 768 ? '1rem' : '2rem',
    paddingRight: window.innerWidth <= 768 ? '1rem' : '2rem',
    background: 'linear-gradient(135deg, #F8F9FF 0%, #FFF5F7 100%)',
    textAlign: 'center' as const,
  },
  heroContent: {
    maxWidth: window.innerWidth <= 768 ? '100%' : '800px',
    margin: '0 auto',
    padding: window.innerWidth <= 768 ? '0 0.5rem' : '0',
  },
  badge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: '#EEF2FF',
    color: '#6C5CE7',
    borderRadius: '20px',
    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.85rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    whiteSpace: 'nowrap' as const,
  },
  heroTitle: {
    fontSize: window.innerWidth <= 768 ? '1.75rem' : '3rem',
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: '1.2',
    marginBottom: '1.5rem',
  },
  gradient: {
    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroDesc: {
    fontSize: window.innerWidth <= 768 ? '0.95rem' : '1.1rem',
    color: '#6B7280',
    lineHeight: '1.8',
    marginBottom: '2rem',
  },
  addButton: {
    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    color: 'white',
    padding: window.innerWidth <= 768 ? '0.875rem 1.5rem' : '1rem 2.5rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
    transition: 'all 0.3s',
    width: window.innerWidth <= 768 ? '100%' : 'auto',
    maxWidth: window.innerWidth <= 768 ? '300px' : 'none',
  },
  // Content Section
  contentSection: {
    padding: window.innerWidth <= 768 ? '2rem 1rem' : '4rem 2rem',
    backgroundColor: '#F9FAFB',
    minHeight: '60vh',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: window.innerWidth <= 768 ? '0 0.5rem' : '0',
  },
  formCard: {
    backgroundColor: 'white',
    padding: window.innerWidth <= 768 ? '1.5rem' : '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  input: {
    padding: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '1rem',
    marginTop: '0.5rem',
    backgroundColor: 'white',
    transition: 'border 0.3s',
  },
  helpText: {
    fontSize: '0.85rem',
    color: '#6B7280',
    marginTop: '0.5rem',
    display: 'block',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    boxShadow: '0 4px 20px rgba(108, 92, 231, 0.3)',
    transition: 'all 0.3s',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch' as const,
  },
  table: {
    width: '100%',
    minWidth: window.innerWidth <= 768 ? '600px' : 'auto',
    borderCollapse: 'collapse' as const,
    fontSize: window.innerWidth <= 768 ? '0.8rem' : '1rem',
  },
  headerRow: {
    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    color: 'white',
  },
  th: {
    padding: window.innerWidth <= 768 ? '0.75rem 0.5rem' : '1.2rem',
    textAlign: 'left' as const,
    fontWeight: '700',
    fontSize: window.innerWidth <= 768 ? '0.8rem' : '1rem',
    backgroundColor: window.innerWidth <= 768 ? '#6C5CE7' : 'transparent',
    color: window.innerWidth <= 768 ? 'white' : 'inherit',
  },
  row: {
    borderBottom: '2px solid #f0f0f0',
    transition: 'background 0.2s',
  },
  td: {
    padding: window.innerWidth <= 768 ? '0.75rem 0.5rem' : '1.2rem',
    color: '#2c3e50',
    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.95rem',
    lineHeight: window.innerWidth <= 768 ? '1.4' : '1.2',
  },
  active: {
    color: '#51cf66',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  inactive: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: '1rem',
  },



  imageLabel: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#2c3e50',
  },
  imageInstructions: {
    backgroundColor: '#e3f2fd',
    padding: '1rem',
    borderRadius: '12px',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    border: '2px solid #667eea',
  },
  instructionList: {
    marginTop: '0.5rem',
    marginBottom: '0',
    paddingLeft: '1.5rem',
    color: '#2c3e50',
  },
  fileInfo: {
    marginTop: '0.5rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, #d0f4de 0%, #a9def9 100%)',
    borderRadius: '12px',
    border: '2px solid #51cf66',
  },
  fileInfoText: {
    margin: '0.5rem 0',
    color: '#2c3e50',
    fontSize: '0.95rem',
  },
  uploadButton: {
    background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
    color: 'white',
    padding: '0.7rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '0.5rem',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(55, 178, 77, 0.3)',
    transition: 'transform 0.2s',
  },
  uploadedImages: {
    marginTop: '1rem',
  },
  uploadedLabel: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2c3e50',
    fontSize: '1rem',
  },
  imagePreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '0.75rem',
  },
  imageWrapper: {
    position: 'relative' as const,
  },
  previewImg: {
    width: '100%',
    height: '100px',
    objectFit: 'cover' as const,
    borderRadius: '12px',
    border: '3px solid #667eea',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    imageRendering: '-webkit-optimize-contrast' as const,
    backfaceVisibility: 'hidden' as const,
  },
  removeBtn: {
    position: 'absolute' as const,
    top: '5px',
    right: '5px',
    backgroundColor: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  bookingsModal: {
    backgroundColor: 'white',
    borderRadius: window.innerWidth <= 768 ? '12px' : '16px',
    width: window.innerWidth <= 768 ? '95%' : '90%',
    maxWidth: window.innerWidth <= 768 ? '100%' : '1000px',
    maxHeight: window.innerWidth <= 768 ? '90vh' : '80vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: window.innerWidth <= 768 ? '1rem 1.25rem' : '1.5rem 2rem',
    borderBottom: '1px solid #E5E7EB',
    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    color: 'white',
    fontSize: window.innerWidth <= 768 ? '1rem' : '1.25rem',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  modalContent: {
    padding: window.innerWidth <= 768 ? '1rem' : '2rem',
    maxHeight: window.innerWidth <= 768 ? '70vh' : '60vh',
    overflow: 'auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #6C5CE7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  emptyBookings: {
    textAlign: 'center' as const,
    padding: '3rem',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  bookingsTable: {
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch' as const,
  },
  bookingRow: {
    borderBottom: '1px solid #F3F4F6',
  },
  guestName: {
    fontWeight: '600',
    color: '#1F2937',
  },
  guestEmail: {
    fontSize: '0.8rem',
    color: '#6B7280',
  },
  phoneCell: {
    fontSize: '0.85rem',
    color: '#374151',
    fontWeight: '500',
  },
  customizationsCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    maxWidth: '120px',
  },
  customizationTag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
  },
  noCustomizations: {
    fontSize: '0.8rem',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: '0.8rem',
    color: '#6B7280',
  },
  duration: {
    fontWeight: '600',
    color: '#6C5CE7',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'capitalize' as const,
  },
  revenue: {
    fontWeight: '700',
    color: '#059669',
  },
  viewBookingsButton: {
    backgroundColor: 'transparent',
    color: '#059669',
    padding: '0.6rem',
    border: '1px solid #059669',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
  },
  editButton: {
    backgroundColor: 'transparent',
    color: '#6C5CE7',
    padding: '0.6rem',
    border: '1px solid #6C5CE7',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    color: '#DC2626',
    padding: '0.6rem',
    border: '1px solid #DC2626',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
  },
  actionButtonsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'flex-start',
  },
  buttonText: {
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  // Mobile Card Styles
  mobileCardsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    padding: '0.5rem',
  },
  mobileCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
  },
  mobileCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #F3F4F6',
  },
  mobileRoomNumber: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: 0,
  },
  mobileCardBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  mobileInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  mobileLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    minWidth: '100px',
  },
  mobileValue: {
    fontSize: '0.9rem',
    color: '#1F2937',
    textAlign: 'right' as const,
    flex: 1,
    wordBreak: 'break-word' as const,
  },
  mobileCardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #F3F4F6',
  },
  mobileBookingCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  mobileGuestInfo: {
    flex: 1,
  },
  mobileGuestName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '0.25rem',
  },
  mobileGuestEmail: {
    fontSize: '0.9rem',
    color: '#6B7280',
  },
  mobileStatusBadge: {
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textAlign: 'center' as const,
  },
  mobileInfoGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  mobileInfoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '0.5rem 0',
    borderBottom: '1px solid #F9FAFB',
  },
  mobileInfoLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    minWidth: '100px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  mobileInfoValue: {
    fontSize: '0.9rem',
    color: '#1F2937',
    textAlign: 'right' as const,
    flex: 1,
    fontWeight: '500',
  },
  mobileRevenue: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#059669',
  },
  mobileAddons: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #F3F4F6',
  },
  mobileAddonsList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  mobileAddonTag: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#EEF2FF',
    color: '#6366F1',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '500',
  }

};

// Add mobile-specific CSS for better readability
if (typeof document !== 'undefined') {
  const mobileBookingStyles = document.createElement('style');
  mobileBookingStyles.textContent = `
    @media (max-width: 768px) {
      /* Hide table on mobile */
      .desktop-table-view {
        display: none !important;
      }
      
      /* Show mobile cards */
      .mobile-cards-view {
        display: block !important;
      }
      
      /* Mobile booking card styling */
      .mobile-booking-card {
        background: white;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #E5E7EB;
      }
      
      .mobile-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #F3F4F6;
      }
      
      .mobile-guest-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1F2937;
        margin-bottom: 0.25rem;
      }
      
      .mobile-guest-email {
        font-size: 0.9rem;
        color: #6B7280;
      }
      
      .mobile-status-badge {
        padding: 0.375rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-align: center;
      }
      
      .mobile-info-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      
      .mobile-info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
      }
      
      .mobile-info-label {
        font-size: 0.9rem;
        font-weight: 600;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .mobile-info-value {
        font-size: 0.9rem;
        color: #1F2937;
        text-align: right;
        font-weight: 500;
      }
      
      .mobile-revenue {
        font-size: 1rem;
        font-weight: 700;
        color: #059669;
      }
      
      .mobile-addons {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #F3F4F6;
      }
      
      .mobile-addons-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      
      .mobile-addon-tag {
        padding: 0.25rem 0.75rem;
        background: #EEF2FF;
        color: #6366F1;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
      }
    }
    
    @media (min-width: 769px) {
      /* Hide mobile cards on desktop */
      .mobile-cards-view {
        display: none !important;
      }
      
      /* Show table on desktop */
      .desktop-table-view {
        display: block !important;
      }
    }
  `;

  if (!document.head.querySelector('#mobile-booking-styles')) {
    mobileBookingStyles.id = 'mobile-booking-styles';
    document.head.appendChild(mobileBookingStyles);
  }
}

// Add enhanced mobile CSS for better mobile experience
if (typeof document !== 'undefined') {
  const adminMobileStyles = document.createElement('style');
  adminMobileStyles.textContent = `
    @media (max-width: 768px) {
      /* Make modal more mobile friendly */
      .bookings-modal {
        width: 98% !important;
        height: 95vh !important;
        max-height: 95vh !important;
        border-radius: 12px !important;
        margin: 1% !important;
      }
      
      /* Modal content scrolling */
      .modal-content {
        padding: 1rem !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
      
      /* Hide desktop table on mobile */
      .desktop-table-view {
        display: none !important;
      }
      
      /* Show mobile cards */
      .mobile-cards-view {
        display: block !important;
      }
      
      /* Mobile booking cards */
      .mobile-booking-card {
        background: white;
        border-radius: 16px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border: 1px solid #E5E7EB;
      }
      
      /* Improve table for mobile (fallback) */
      .bookings-table-container {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        padding: 0.5rem !important;
      }
      
      .bookings-table {
        min-width: 700px !important;
        font-size: 0.8rem !important;
      }
      
      .bookings-table th {
        padding: 0.75rem 0.5rem !important;
        font-size: 0.75rem !important;
        white-space: nowrap !important;
        background: #667EEA !important;
        color: white !important;
        font-weight: 600 !important;
      }
      
      .bookings-table td {
        padding: 0.75rem 0.5rem !important;
        font-size: 0.8rem !important;
        white-space: nowrap !important;
        vertical-align: top !important;
        line-height: 1.4 !important;
      }
      
      /* Better guest info */
      .guest-name {
        font-size: 0.85rem !important;
        font-weight: 600 !important;
        color: #1F2937 !important;
        margin-bottom: 0.25rem !important;
      }
      
      .guest-email {
        font-size: 0.75rem !important;
        color: #6B7280 !important;
      }
      
      /* Phone display */
      .phone-cell {
        font-size: 0.8rem !important;
        color: #374151 !important;
      }
      
      /* Customization tags */
      .customization-tag {
        font-size: 0.65rem !important;
        padding: 0.25rem 0.5rem !important;
        margin: 0.125rem !important;
        display: inline-block !important;
        background: #EEF2FF !important;
        color: #6366F1 !important;
        border-radius: 8px !important;
      }
      
      /* Status badges */
      .status-badge {
        font-size: 0.7rem !important;
        padding: 0.25rem 0.5rem !important;
        border-radius: 12px !important;
        font-weight: 600 !important;
      }
      
      /* Revenue */
      .revenue {
        font-weight: 700 !important;
        color: #059669 !important;
        font-size: 0.85rem !important;
      }
      
      /* Duration */
      .duration {
        font-weight: 600 !important;
        color: #0284C7 !important;
        font-size: 0.8rem !important;
      }
      
      /* Time text */
      .time-text {
        font-size: 0.7rem !important;
        color: #6B7280 !important;
      }
      
      /* Mobile card animations */
      .mobile-booking-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .mobile-booking-card:active {
        transform: scale(0.98);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
    }
    
    @media (min-width: 769px) {
      /* Hide mobile cards on desktop */
      .mobile-cards-view {
        display: none !important;
      }
      
      /* Show desktop table */
      .desktop-table-view {
        display: block !important;
      }
    }
  `;

  if (!document.head.querySelector('#admin-mobile-styles')) {
    adminMobileStyles.id = 'admin-mobile-styles';
    document.head.appendChild(adminMobileStyles);
  }
}

export default AdminRooms;
