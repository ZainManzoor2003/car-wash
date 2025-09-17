import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const AddImagesPage: React.FC = () => {
  const [carNumber, setCarNumber] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [serviceImages, setServiceImages] = useState<{ [key: string]: any[] }>({});
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  // Search for services by car number
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carNumber.trim()) return;

    setSearched(true);
    setServices([]);
    setSelectedFiles({});
    setExpanded(null);
    setServiceImages({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(carNumber)}`);
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setServices(data);
      
      // Fetch images for each service
      for (const service of data) {
        await fetchServiceImages(service._id);
      }
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      alert('Search failed. Please try again.');
    }
  };

  // Fetch images for a specific service
  const fetchServiceImages = async (serviceId: string) => {
    setLoadingImages(prev => ({ ...prev, [serviceId]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-images/${serviceId}`);
      
      if (response.ok) {
        const images = await response.json();
        setServiceImages(prev => ({ ...prev, [serviceId]: images }));
      } else {
        console.error(`❌ Failed to fetch images for service ${serviceId}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch images for service ${serviceId}:`, error);
      setServiceImages(prev => ({ ...prev, [serviceId]: [] }));
    } finally {
      setLoadingImages(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  // Handle file selection for a service
  const handleFileChange = (serviceId: string, files: FileList | null) => {
    if (!files) return;
    setSelectedFiles(prev => ({ ...prev, [serviceId]: Array.from(files) }));
  };

  // Upload images to a specific service
  const handleUpload = async (service: any) => {
    const files = selectedFiles[service._id];
    if (!files || files.length === 0) {
      alert('Please select files first');
      return;
    }

    setUploading(service._id);
    const formData = new FormData();
    
    // Add all files
    files.forEach(file => formData.append('images', file));
    formData.append('serviceId', service._id);

    try {
      console.log('📤 Uploading images for service:', service._id);
      
      const response = await fetch(`${API_BASE_URL}/upload-service-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      
      // Clear selected files for this service
      setSelectedFiles(prev => ({ ...prev, [service._id]: [] }));
      
      // Refresh images for this service
      await fetchServiceImages(service._id);
      
      alert(`Successfully uploaded ${files.length} image(s) to ${service.service.label}!`);
      
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  // Toggle accordion for a service
  const handleAccordion = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div id="upperi">
        <Navbar />
        <div id="inneri" style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 0' }}>
          <div style={{ background: '#181818', borderRadius: 18, boxShadow: '0 4px 24px #0008', padding: 36, minWidth: 340, maxWidth: 540, width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
            
            <h2 style={{ color: '#ffd600', fontWeight: 700, fontSize: '2.1rem', marginBottom: 6, textAlign: 'center', letterSpacing: 0.5 }}>
              📸 Upload Service Images
            </h2>
            

            
            <div style={{ color: '#bdbdbd', fontSize: '1.08rem', marginBottom: 18, textAlign: 'center' }}>
              Search by car number to upload images for specific services
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: 'center' }}>
              <input
                type="text"
                placeholder="Enter Car Number (e.g. AB12CDE)"
                value={carNumber}
                onChange={e => setCarNumber(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #232323', background: '#222', color: '#fff', fontSize: '1.08rem', width: 220 }}
                required
              />
              <button 
                type="submit" 
                style={{ background: '#ffd600', color: '#111', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: '1.08rem', cursor: 'pointer', boxShadow: '0 2px 8px #0003', letterSpacing: 0.5 }}
              >
                🔍 Search
              </button>
            </form>

            {/* Results */}
            {searched && (
              <div style={{ marginTop: 18 }}>
                {services.length === 0 ? (
                  <div style={{ color: '#888', fontSize: 15, textAlign: 'center', padding: '20px' }}>
                    No services found for car: <strong>{carNumber}</strong>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: '#4caf50', fontSize: 15, textAlign: 'center', marginBottom: 10 }}>
                    Found {services.length} service(s) for car: <strong>{carNumber}</strong>
                    </div>
                    {(() => {
                      const totalImages = Object.values(serviceImages).reduce((total: number, images: any[]) => total + images.length, 0);
                      return totalImages > 0 ? (
                        <div style={{ 
                          color: '#ffd600', 
                          fontSize: 14, 
                          textAlign: 'center', 
                          marginBottom: 20,
                          background: '#1a1a1a',
                          padding: '8px 16px',
                          borderRadius: 20,
                          border: '1px solid #ffd600'
                        }}>
                          📸 Total Images: <strong>{totalImages}</strong> across all services
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Services List */}
                {services.map((service, index) => (
                  <div key={service._id} style={{ marginBottom: 18, background: '#232323', borderRadius: 12, boxShadow: '0 2px 8px #0005' }}>
                    
                    {/* Service Header */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', cursor: 'pointer' }}
                      onClick={() => handleAccordion(index)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#ffd600', fontWeight: 600, fontSize: '1.13rem' }}>
                          {service.service?.label || 'Service'} 
                          <span style={{ color: '#888', marginLeft: 8, fontSize: '0.9rem' }}>
                            ({formatDate(service.date)})
                          </span>
                          {serviceImages[service._id] && serviceImages[service._id].length > 0 && (
                            <span style={{ 
                              color: '#4caf50', 
                              marginLeft: 12, 
                              fontSize: '0.9rem',
                              background: '#1a1a1a',
                              padding: '2px 8px',
                              borderRadius: 12,
                              border: '1px solid #4caf50'
                            }}>
                              📸 {serviceImages[service._id].length} image(s)
                            </span>
                          )}
                        </div>
                        
                        <div style={{ color: '#bdbdbd', fontSize: '0.9rem', marginTop: 4 }}>
                          Customer: {service.customer?.name} ({service.customer?.email})
                        </div>
                        
                        <div style={{ color: '#fff', fontSize: '0.95rem', marginTop: 2 }}>
                          {service.car?.make} {service.car?.model} {service.car?.year} - {service.car?.registration}
                        </div>
                        
                        <div style={{ color: '#4caf50', fontSize: '0.85rem', marginTop: 4 }}>
                          Status: {service.status || 'pending'}
                        </div>
                      </div>
                      
                      <span style={{ color: '#fff', fontSize: 22 }}>
                        {expanded === index ? '▲' : '▼'}
                      </span>
                    </div>

                    {/* Service Details (when expanded) */}
                    {expanded === index && (
                      <div style={{ padding: '0 18px 18px 18px', background: '#232323', borderRadius: '0 0 12px 12px' }}>
                        
                        {/* File Upload Section */}
                        <div style={{ marginBottom: 15, padding: '15px', background: '#2a2a2a', borderRadius: 8 }}>
                          <div style={{ color: '#ffd600', fontWeight: 600, marginBottom: 10 }}>
                            📁 Upload Images for this Service
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={e => handleFileChange(service._id, e.target.files)}
                              style={{ color: '#fff', fontSize: '0.9rem' }}
                            />
                          </div>
                          
                          {selectedFiles[service._id] && selectedFiles[service._id].length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ color: '#4caf50', fontSize: '0.9rem', marginBottom: 5 }}>
                                Selected: {selectedFiles[service._id].length} file(s)
                              </div>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <button
                                onClick={() => handleUpload(service)}
                                disabled={uploading === service._id}
                                style={{ 
                                  background: uploading === service._id ? '#666' : '#4caf50', 
                                  color: '#fff', 
                                  fontWeight: 600, 
                                  border: 'none', 
                                  borderRadius: 8, 
                                  padding: '10px 20px', 
                                  fontSize: '1rem', 
                                  cursor: uploading === service._id ? 'not-allowed' : 'pointer',
                                  opacity: uploading === service._id ? 0.7 : 1
                                }}
                              >
                                {uploading === service._id ? '⏳ Uploading...' : '🚀 Upload Images'}
                              </button>
                                {uploading === service._id && (
                                  <div style={{ 
                                    color: '#ffd600', 
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}>
                                    <div style={{
                                      width: 16,
                                      height: 16,
                                      border: '2px solid #ffd600',
                                      borderTop: '2px solid transparent',
                                      borderRadius: '50%',
                                      animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Processing...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Service Info */}
                        <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: 8 }}>
                          <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                            <strong>Service ID:</strong> {service._id.slice(-8)}
                          </div>
                          <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                            <strong>Service Type:</strong> {service.service?.label}
                          </div>
                          <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                            <strong>Date:</strong> {new Date(service.date).toLocaleDateString()}
                          </div>
                        </div>

                                                                         {/* Currently Uploaded Images */}
                        <div style={{ marginTop: 15, padding: '15px', background: '#2a2a2a', borderRadius: 8 }}>
                           <div style={{ 
                             display: 'flex', 
                             justifyContent: 'space-between', 
                             alignItems: 'center', 
                             marginBottom: 10 
                           }}>
                             <div style={{ color: '#ffd600', fontWeight: 600 }}>
                               ✨ Currently Uploaded Images
                             </div>
                             
                             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                               {serviceImages[service._id] && serviceImages[service._id].length > 0 && (
                                 <div style={{ 
                                   color: '#888', 
                                   fontSize: '0.8rem',
                                   background: '#1a1a1a',
                                   padding: '4px 8px',
                                   borderRadius: 6
                                 }}>
                                   Last updated: {(() => {
                                     const latestImage = serviceImages[service._id]
                                       .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
                                     return latestImage ? formatDate(latestImage.uploadedAt) : 'N/A';
                                   })()}
                                 </div>
                               )}
                               <button
                                 onClick={() => fetchServiceImages(service._id)}
                                 disabled={loadingImages[service._id]}
                                 style={{
                                   background: '#333',
                                   color: '#fff',
                                   border: 'none',
                                   borderRadius: 6,
                                   padding: '6px 12px',
                                   fontSize: '0.8rem',
                                   cursor: loadingImages[service._id] ? 'not-allowed' : 'pointer',
                                   opacity: loadingImages[service._id] ? 0.7 : 1
                                 }}
                                 title="Refresh images"
                               >
                                 {loadingImages[service._id] ? '⏳' : '🔄'}
                               </button>
                             </div>
                           </div>
                                                     {loadingImages[service._id] ? (
                             <div style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>
                               Loading images...
                             </div>
                           ) : serviceImages[service._id] && serviceImages[service._id].length > 0 ? (
                             <div>
                               <div style={{ color: '#4caf50', fontSize: '0.9rem', marginBottom: 10 }}>
                                 📸 {serviceImages[service._id].length} image(s) uploaded
                               </div>
                               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                                 {serviceImages[service._id].map((image, imgIndex) => (
                                   <div key={image._id} style={{ position: 'relative' }}>
                                     <img
                                       src={image.imageUrl}
                                       alt={`Service image ${imgIndex + 1}`}
                                       style={{ 
                                         width: '100%', 
                                         height: 140, 
                                         objectFit: 'cover',
                                         borderRadius: 8,
                                         border: '2px solid #333',
                                         cursor: 'pointer'
                                       }}
                                       onClick={() => window.open(image.imageUrl, '_blank')}
                                       title="Click to view full size"
                                     />
                                     <div style={{
                                       position: 'absolute',
                                       top: 0,
                                       left: 0,
                                       right: 0,
                                       background: 'rgba(0,0,0,0.8)',
                                       color: '#fff',
                                       fontSize: '0.7rem',
                                       padding: '4px 8px',
                                       textAlign: 'center',
                                       borderRadius: '8px 8px 0 0'
                                     }}>
                                       {formatDate(image.uploadedAt)}
                                     </div>
                                     <div style={{
                                       position: 'absolute',
                                       bottom: 0,
                                       left: 0,
                                       right: 0,
                                       background: 'rgba(0,0,0,0.8)',
                                       color: '#fff',
                                       fontSize: '0.8rem',
                                       padding: '4px 8px',
                                       textAlign: 'center',
                                       borderRadius: '0 0 8px 8px'
                                     }}>
                                       Image {imgIndex + 1}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           ) : (
                             <div style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>
                               No images uploaded yet for this service.
                             </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AddImagesPage;
