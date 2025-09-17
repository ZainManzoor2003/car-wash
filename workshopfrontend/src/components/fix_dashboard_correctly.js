const fs = require('fs');

const filePath = '/Users/mac/Desktop/CarShowroom/workshopfrontend/src/components/DashboardPage.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the cost breakdown section and add conditional logic
const oldCostBreakdown = `                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                          gap: '16px', 
                          marginTop: '16px',
                          padding: '16px',
                          background: '#232323',
                          borderRadius: '6px'
                        }}>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Labour Hours:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>{service.labourHours || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Labour Cost:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>£{service.labourCost || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Parts Cost:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>£{service.partsCost || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Subtotal:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>£{service.subtotal || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>VAT:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>£{service.vat || 0}</div>
                          </div>
                        </div>`;

const newCostBreakdown = `                        {/* Show cost breakdown only if there are actual charges (admin-created bookings) */}
                        {((service.labourHours || 0) > 0 || (service.labourCost || 0) > 0 || (service.partsCost || 0) > 0) && (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                            gap: '16px', 
                            marginTop: '16px',
                            padding: '16px',
                            background: '#232323',
                            borderRadius: '6px'
                          }}>
                            <div>
                              <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Labour Hours:</span>
                              <div style={{ color: '#fff', fontWeight: '500' }}>{service.labourHours || 0}</div>
                            </div>
                            <div>
                              <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Labour Cost:</span>
                              <div style={{ color: '#fff', fontWeight: '500' }}>£{service.labourCost || 0}</div>
                            </div>
                            <div>
                              <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Parts Cost:</span>
                              <div style={{ color: '#fff', fontWeight: '500' }}>£{service.partsCost || 0}</div>
                            </div>
                            <div>
                              <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Subtotal:</span>
                              <div style={{ color: '#fff', fontWeight: '500' }}>£{service.subtotal || 0}</div>
                            </div>
                            <div>
                              <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>VAT:</span>
                              <div style={{ color: '#fff', fontWeight: '500' }}>£{service.vat || 0}</div>
                            </div>
                          </div>
                        )}`;

// Replace the content
content = content.replace(oldCostBreakdown, newCostBreakdown);

// Write back to file
fs.writeFileSync(filePath, content);

console.log('✅ Successfully updated DashboardPage to show cost breakdown only for admin-created bookings');
