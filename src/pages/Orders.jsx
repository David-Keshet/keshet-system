import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import CustomerSearchModal from '../components/orders/CustomerSearchModal';
import './Orders.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showSaveOptionsModal, setShowSaveOptionsModal] = useState(false);
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [matchingCustomers, setMatchingCustomers] = useState([]);

  // Customer form data
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerType, setCustomerType] = useState('private');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    contact_person: '',
    payer_name: '',
    id_number: ''
  });

  // Order items
  const [orderItems, setOrderItems] = useState([
    { id: 1, description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);

  // Save options
  const [saveOptions, setSaveOptions] = useState({
    createPDF: true,
    sendWhatsApp: false,
    sendPDFInWhatsApp: false,
    createTask: true,
    print: false
  });

  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            id,
            customer_code,
            name,
            phone,
            customer_type
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      setError('שגיאה בטעינת הזמנות: ' + err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const generateOrderNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_order_number');
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error generating order number:', err);
      const maxNum = orders.reduce((max, o) => {
        const num = parseInt(o.order_number) || 0;
        return num > max ? num : max;
      }, 1000);
      return String(maxNum + 1).padStart(4, '0');
    }
  };

  const generateCustomerCode = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_customer_code');
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error generating customer code:', err);
      const maxCode = customers.reduce((max, c) => {
        const num = parseInt(c.customer_code) || 0;
        return num > max ? num : max;
      }, 1000);
      return String(maxCode + 1).padStart(4, '0');
    }
  };

  // Calculate totals
  const calculateItemTotal = (quantity, unitPrice) => {
    return Number(quantity) * Number(unitPrice);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + Number(item.total), 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  // Handle order item changes
  const handleItemChange = (id, field, value) => {
    setOrderItems(items => {
      const updated = items.map(item => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unit_price') {
            newItem.total = calculateItemTotal(newItem.quantity, newItem.unit_price);
          }
          return newItem;
        }
        return item;
      });
      return updated;
    });
  };

  const addOrderItem = () => {
    const newId = Math.max(...orderItems.map(i => i.id), 0) + 1;
    setOrderItems([...orderItems, { id: newId, description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeOrderItem = (id) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    }
  };

  // Handle customer data changes
  const handleCustomerDataChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleExistingCustomerSelect = (customerId) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerType(customer.customer_type || 'private');
      setCustomerData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        contact_person: customer.contact_person || '',
        payer_name: customer.payer_name || '',
        id_number: customer.id_number || ''
      });
    }
  };

  // Search customers by phone/name/code
  const searchCustomers = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setMatchingCustomers([]);
      setShowCustomerSearchModal(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`phone.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,customer_code.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setMatchingCustomers(data);
        setShowCustomerSearchModal(true);
      } else {
        setMatchingCustomers([]);
        setShowCustomerSearchModal(false);
      }
    } catch (err) {
      console.error('Error searching customers:', err);
    }
  };

  // Handler for selecting customer from search modal
  const handleSelectCustomerFromSearch = (customer) => {
    setIsNewCustomer(false);
    setSelectedCustomerId(customer.id);
    setCustomerType(customer.customer_type || 'private');
    setCustomerData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      contact_person: customer.contact_person || '',
      payer_name: customer.payer_name || '',
      id_number: customer.id_number || ''
    });
    setShowCustomerSearchModal(false);
  };

  // Handler for viewing customer orders
  const handleViewCustomerOrders = (customer) => {
    setShowCustomerSearchModal(false);
    // Filter orders by customer - could navigate or filter current view
    const customerOrders = orders.filter(o => o.customer_id === customer.id);
    console.log('Customer orders:', customerOrders);
    alert(`נמצאו ${customerOrders.length} הזמנות עבור ${customer.name}`);
  };

  // Handler for editing customer from search
  const handleEditCustomerFromSearch = (customer) => {
    setIsNewCustomer(false);
    setSelectedCustomerId(customer.id);
    setCustomerType(customer.customer_type || 'private');
    setCustomerData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      contact_person: customer.contact_person || '',
      payer_name: customer.payer_name || '',
      id_number: customer.id_number || ''
    });
    setShowCustomerSearchModal(false);
    // Could open customer edit in a separate modal or navigate to customers page
  };

  // Handler for creating new customer with entered details
  const handleCreateNewFromSearch = () => {
    setIsNewCustomer(true);
    setSelectedCustomerId('');
    // Keep the search term in name or phone field
    if (matchingCustomers.length > 0) {
      const searchTerm = customerData.phone || customerData.name;
      // Pre-fill with what user was searching for
    }
    setShowCustomerSearchModal(false);
  };

  const resetOrderForm = () => {
    setIsNewCustomer(true);
    setSelectedCustomerId('');
    setCustomerType('private');
    setCustomerData({
      name: '',
      phone: '',
      email: '',
      contact_person: '',
      payer_name: '',
      id_number: ''
    });
    setOrderItems([{ id: 1, description: '', quantity: 1, unit_price: 0, total: 0 }]);
    setSaveOptions({
      createPDF: true,
      sendWhatsApp: false,
      sendPDFInWhatsApp: false,
      createTask: true,
      print: false
    });
  };

  const openNewOrderModal = () => {
    resetOrderForm();
    setShowNewOrderModal(true);
  };

  const closeNewOrderModal = () => {
    setShowNewOrderModal(false);
    setError('');
  };

  const handleSaveOrder = async () => {
    try {
      setError('');

      // Validation
      if (!customerData.name.trim()) {
        setError('שם הלקוח הוא שדה חובה');
        return;
      }
      if (!customerData.phone.trim()) {
        setError('טלפון הוא שדה חובה');
        return;
      }
      if (orderItems.every(item => !item.description.trim())) {
        setError('נא להוסיף לפחות מוצר אחד');
        return;
      }

      const subtotal = calculateSubtotal();
      const vat = calculateVAT();
      const total = calculateTotal();

      // Prepare order data
      const orderData = {
        customer: customerData,
        customerId: selectedCustomerId,
        isNewCustomer,
        customerType,
        items: orderItems.filter(item => item.description.trim()),
        subtotal,
        vat,
        total
      };

      setCurrentOrderData(orderData);
      setShowNewOrderModal(false);
      setShowSaveOptionsModal(true);
    } catch (err) {
      setError('שגיאה בהכנת ההזמנה: ' + err.message);
      console.error('Error preparing order:', err);
    }
  };

  const executeSaveOrder = async () => {
    try {
      setError('');
      let customerId = selectedCustomerId;

      // Step 1: Create or get customer
      if (isNewCustomer) {
        const customer_code = await generateCustomerCode();
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            customer_code,
            customer_type: customerType,
            name: customerData.name,
            phone: customerData.phone,
            email: customerData.email || null,
            contact_person: customerData.contact_person || null,
            payer_name: customerData.payer_name || null,
            id_number: customerData.id_number || null
          }])
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Step 2: Create order
      const order_number = await generateOrderNumber();
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number,
          customer_id: customerId,
          order_date: new Date().toISOString().split('T')[0],
          total_amount: currentOrderData.subtotal,
          tax_percent: 18,
          tax_amount: currentOrderData.vat,
          final_amount: currentOrderData.total,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 3: Create order items
      const itemsToInsert = currentOrderData.items.map(item => ({
        order_id: newOrder.id,
        product_description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Step 4: Execute selected options
      const customer = await getCustomerById(customerId);

      if (saveOptions.createTask) {
        await createTaskForOrder(newOrder, customer);
      }

      if (saveOptions.createPDF) {
        await generatePDF(newOrder, customer, currentOrderData.items);
      }

      if (saveOptions.sendWhatsApp) {
        await sendWhatsAppMessage(newOrder, customer, saveOptions.sendPDFInWhatsApp);
      }

      if (saveOptions.print) {
        await printOrder(newOrder, customer, currentOrderData.items);
      }

      // Refresh orders list
      await loadOrders();
      await loadCustomers();

      setShowSaveOptionsModal(false);
      setCurrentOrderData(null);
      alert(`הזמנה ${order_number} נוצרה בהצלחה!`);
    } catch (err) {
      setError('שגיאה בשמירת הזמנה: ' + err.message);
      console.error('Error saving order:', err);
    }
  };

  const getCustomerById = async (customerId) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) throw error;
    return data;
  };

  const createTaskForOrder = async (order, customer) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: `ביצוע הזמנה ${order.order_number}`,
          description: `הזמנה עבור ${customer.name}\nטלפון: ${customer.phone}`,
          related_order: order.id,
          related_customer: customer.id,
          status: 'todo',
          priority: 'medium'
        }]);

      if (error) throw error;
      console.log('Task created successfully');
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const generatePDF = async (order, customer, items) => {
    // This will be implemented with jsPDF library
    console.log('PDF generation will be implemented');
    console.log({ order, customer, items });
  };

  const sendWhatsAppMessage = async (order, customer, includePDF) => {
    try {
      // Get WhatsApp template
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('template_text')
        .eq('template_name', includePDF ? 'order_with_pdf' : 'new_order')
        .single();

      let message = template?.template_text || `שלום ${customer.name}, נפתחה הזמנה מספר ${order.order_number}`;
      message = message.replace('{customer_name}', customer.name);
      message = message.replace('{order_number}', order.order_number);

      // Clean phone number (remove dashes and spaces)
      const phone = customer.phone.replace(/[-\s]/g, '');

      // Open WhatsApp Web with message
      const whatsappUrl = `https://wa.me/972${phone.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      console.log('WhatsApp message sent');
    } catch (err) {
      console.error('Error sending WhatsApp:', err);
    }
  };

  const printOrder = async (order, customer, items) => {
    // Create print-friendly HTML
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>הזמנה ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
            th { background: #f0f0f0; }
            .totals { margin-top: 20px; text-align: left; }
            .totals div { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>הזמנה מספר ${order.order_number}</h1>
          <p><strong>לקוח:</strong> ${customer.name}</p>
          <p><strong>טלפון:</strong> ${customer.phone}</p>
          <p><strong>תאריך:</strong> ${new Date(order.order_date).toLocaleDateString('he-IL')}</p>
          <table>
            <thead>
              <tr>
                <th>תיאור</th>
                <th>כמות</th>
                <th>מחיר ליחידה</th>
                <th>סה"כ</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)} ₪</td>
                  <td>${item.total.toFixed(2)} ₪</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div><strong>סכום ביניים:</strong> ${order.total_amount.toFixed(2)} ₪</div>
            <div><strong>מע"מ (18%):</strong> ${order.tax_amount.toFixed(2)} ₪</div>
            <div style="font-size: 18px;"><strong>סה"כ לתשלום:</strong> ${order.final_amount.toFixed(2)} ₪</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>ניהול הזמנות</h1>
        <button className="btn btn-primary" onClick={openNewOrderModal}>
          <i className="fas fa-plus"></i> הזמנה חדשה
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Orders Table */}
      {loading ? (
        <div className="loading">טוען הזמנות...</div>
      ) : orders.length === 0 ? (
        <div className="no-data">לא נמצאו הזמנות</div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>מספר הזמנה</th>
                <th>לקוח</th>
                <th>טלפון</th>
                <th>תאריך</th>
                <th>סה"כ</th>
                <th>סטטוס</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="order-number">{order.order_number}</td>
                  <td>{order.customers?.name || '-'}</td>
                  <td>{order.customers?.phone || '-'}</td>
                  <td>{new Date(order.order_date).toLocaleDateString('he-IL')}</td>
                  <td className="price">₪{order.final_amount?.toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {order.status === 'pending' ? 'ממתין' : order.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-icon" title="צפייה">
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="modal-overlay" onClick={closeNewOrderModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>הזמנה חדשה</h2>
              <button className="close-btn" onClick={closeNewOrderModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Customer Selection */}
              <div className="form-section">
                <h3>פרטי לקוח</h3>
                <div className="form-group">
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        checked={isNewCustomer}
                        onChange={() => {
                          setIsNewCustomer(true);
                          setSelectedCustomerId('');
                          resetOrderForm();
                        }}
                      />
                      לקוח חדש
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        checked={!isNewCustomer}
                        onChange={() => setIsNewCustomer(false)}
                      />
                      לקוח קיים
                    </label>
                  </div>
                </div>

                {!isNewCustomer && (
                  <div className="form-group">
                    <label>בחר לקוח</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleExistingCustomerSelect(e.target.value)}
                      required
                    >
                      <option value="">-- בחר לקוח --</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.customer_code} - {customer.name} ({customer.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(isNewCustomer || selectedCustomerId) && (
                  <>
                    {isNewCustomer && (
                      <div className="form-group">
                        <label>סוג לקוח</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input
                              type="radio"
                              value="private"
                              checked={customerType === 'private'}
                              onChange={(e) => setCustomerType(e.target.value)}
                            />
                            פרטי
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              value="business"
                              checked={customerType === 'business'}
                              onChange={(e) => setCustomerType(e.target.value)}
                            />
                            עסקי
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label>שם *</label>
                        <input
                          type="text"
                          value={customerData.name}
                          onChange={(e) => {
                            handleCustomerDataChange('name', e.target.value);
                            if (isNewCustomer) {
                              searchCustomers(e.target.value);
                            }
                          }}
                          required
                          disabled={!isNewCustomer}
                        />
                      </div>
                      <div className="form-group">
                        <label>טלפון *</label>
                        <input
                          type="tel"
                          value={customerData.phone}
                          onChange={(e) => {
                            handleCustomerDataChange('phone', e.target.value);
                            if (isNewCustomer) {
                              searchCustomers(e.target.value);
                            }
                          }}
                          required
                          disabled={!isNewCustomer}
                        />
                      </div>
                    </div>

                    {customerType === 'business' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>אימייל</label>
                          <input
                            type="email"
                            value={customerData.email}
                            onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                            disabled={!isNewCustomer}
                          />
                        </div>
                        <div className="form-group">
                          <label>איש קשר</label>
                          <input
                            type="text"
                            value={customerData.contact_person}
                            onChange={(e) => handleCustomerDataChange('contact_person', e.target.value)}
                            disabled={!isNewCustomer}
                          />
                        </div>
                      </div>
                    )}

                    {customerType === 'business' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>שם משלם</label>
                          <input
                            type="text"
                            value={customerData.payer_name}
                            onChange={(e) => handleCustomerDataChange('payer_name', e.target.value)}
                            disabled={!isNewCustomer}
                          />
                        </div>
                        <div className="form-group">
                          <label>ח.פ / ת.ז</label>
                          <input
                            type="text"
                            value={customerData.id_number}
                            onChange={(e) => handleCustomerDataChange('id_number', e.target.value)}
                            disabled={!isNewCustomer}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Order Items */}
              <div className="form-section">
                <div className="section-header">
                  <h3>פרטי ההזמנה</h3>
                  <button className="btn btn-sm btn-success" onClick={addOrderItem}>
                    <i className="fas fa-plus"></i> הוסף שורה
                  </button>
                </div>

                <div className="order-items">
                  {orderItems.map((item, index) => (
                    <div key={item.id} className="order-item-row">
                      <div className="item-number">{index + 1}</div>
                      <div className="form-group flex-3">
                        <input
                          type="text"
                          placeholder="תיאור המוצר (לדוגמה: פליירים A5 צבעוני)"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="form-group flex-1">
                        <input
                          type="number"
                          placeholder="כמות"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="form-group flex-1">
                        <input
                          type="number"
                          placeholder="מחיר ליחידה"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                        />
                      </div>
                      <div className="item-total">
                        ₪{item.total.toFixed(2)}
                      </div>
                      {orderItems.length > 1 && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => removeOrderItem(item.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="order-totals">
                  <div className="total-row">
                    <span>סכום ביניים:</span>
                    <span>₪{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>מע"מ (18%):</span>
                    <span>₪{calculateVAT().toFixed(2)}</span>
                  </div>
                  <div className="total-row total-final">
                    <span>סה"כ לתשלום:</span>
                    <span>₪{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeNewOrderModal}>
                ביטול
              </button>
              <button className="btn btn-primary" onClick={handleSaveOrder}>
                המשך לשמירה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Options Modal */}
      {showSaveOptionsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>אפשרויות שמירה</h2>
            </div>

            <div className="modal-body">
              <p className="modal-description">בחר את הפעולות שברצונך לבצע לאחר שמירת ההזמנה:</p>

              <div className="options-list">
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={saveOptions.createPDF}
                    onChange={(e) => setSaveOptions({ ...saveOptions, createPDF: e.target.checked })}
                  />
                  <div className="option-content">
                    <i className="fas fa-file-pdf"></i>
                    <span>יצירת קובץ PDF עם פרטי ההזמנה</span>
                  </div>
                </label>

                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={saveOptions.sendWhatsApp}
                    onChange={(e) => setSaveOptions({ ...saveOptions, sendWhatsApp: e.target.checked })}
                  />
                  <div className="option-content">
                    <i className="fab fa-whatsapp"></i>
                    <span>שליחת הודעת WhatsApp ללקוח</span>
                  </div>
                </label>

                {saveOptions.sendWhatsApp && (
                  <label className="option-item sub-option">
                    <input
                      type="checkbox"
                      checked={saveOptions.sendPDFInWhatsApp}
                      onChange={(e) => setSaveOptions({ ...saveOptions, sendPDFInWhatsApp: e.target.checked })}
                    />
                    <div className="option-content">
                      <i className="fas fa-paperclip"></i>
                      <span>צרף PDF להודעה</span>
                    </div>
                  </label>
                )}

                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={saveOptions.createTask}
                    onChange={(e) => setSaveOptions({ ...saveOptions, createTask: e.target.checked })}
                  />
                  <div className="option-content">
                    <i className="fas fa-tasks"></i>
                    <span>יצירת משימה לביצוע ההזמנה</span>
                  </div>
                </label>

                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={saveOptions.print}
                    onChange={(e) => setSaveOptions({ ...saveOptions, print: e.target.checked })}
                  />
                  <div className="option-content">
                    <i className="fas fa-print"></i>
                    <span>הדפסה למדפסת רגילה</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowSaveOptionsModal(false);
                  setShowNewOrderModal(true);
                }}
              >
                חזור
              </button>
              <button className="btn btn-primary" onClick={executeSaveOrder}>
                <i className="fas fa-save"></i> שמור הזמנה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Search Modal */}
      {showCustomerSearchModal && (
        <CustomerSearchModal
          onClose={() => setShowCustomerSearchModal(false)}
          onCreateNew={handleCreateNewFromSearch}
          onSelectCustomer={handleSelectCustomerFromSearch}
          onViewOrders={handleViewCustomerOrders}
          onEditCustomer={handleEditCustomerFromSearch}
          matchingCustomers={matchingCustomers}
        />
      )}
    </div>
  );
};

export default Orders;
