import { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../api/roomsApi';
import Toast from '../components/Toast';

const AdminRooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
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

  return (
    <div style={styles.wrapper}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
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
          {window.innerWidth <= 768 ? (
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
    minWidth: window.innerWidth <= 768 ? '800px' : 'auto',
    borderCollapse: 'collapse' as const,
  },
  headerRow: {
    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    color: 'white',
  },
  th: {
    padding: '1.2rem',
    textAlign: 'left' as const,
    fontWeight: '700',
    fontSize: '1rem',
  },
  row: {
    borderBottom: '2px solid #f0f0f0',
    transition: 'background 0.2s',
  },
  td: {
    padding: '1.2rem',
    color: '#2c3e50',
    fontSize: '0.95rem',
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
  editButton: {
    backgroundColor: 'transparent',
    color: '#6C5CE7',
    padding: '0.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    color: '#DC2626',
    padding: '0.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    top: '-8px',
    right: '-8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#EF4444',
    color: 'white',
    border: '2px solid white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    transition: 'all 0.2s',
  },
  // Mobile Card Styles
  mobileCardsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
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
    color: '#6B7280',
    minWidth: '80px',
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
    gap: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #F3F4F6',
  },
};

export default AdminRooms;
