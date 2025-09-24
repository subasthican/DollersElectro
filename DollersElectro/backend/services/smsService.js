const twilio = require('twilio');

// Initialize Twilio client only if credentials are available
let client = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  console.warn('Twilio credentials not configured, SMS service will be disabled');
}

// Helper function to check if SMS service is available
const isSMSServiceAvailable = () => {
  return client !== null && 
         process.env.TWILIO_ACCOUNT_SID && 
         process.env.TWILIO_AUTH_TOKEN && 
         process.env.TWILIO_PHONE_NUMBER;
};

// Send SMS verification code
const sendVerificationSMS = async (phoneNumber, code) => {
  try {
    if (!isSMSServiceAvailable()) {
      console.log('SMS service not available, skipping verification SMS');
      return { success: false, message: 'SMS service not configured' };
    }

    const message = await client.messages.create({
      body: `Your DollersElectro verification code is: ${code}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Verification SMS sent:', message.sid);
    return { success: true, message: message };
  } catch (error) {
    console.error('Failed to send verification SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update SMS
const sendOrderStatusUpdateSMS = async (phoneNumber, orderNumber, status) => {
  try {
    const statusMessages = {
      'confirmed': 'Your order has been confirmed and is being processed.',
      'processing': 'Your order is being prepared for shipping.',
      'shipped': 'Your order has been shipped and is on its way.',
      'out_for_delivery': 'Your order is out for delivery today.',
      'delivered': 'Your order has been delivered successfully.',
      'cancelled': 'Your order has been cancelled.',
      'refunded': 'Your order has been refunded.'
    };

    const message = await client.messages.create({
      body: `Order #${orderNumber}: ${statusMessages[status] || 'Status updated'}. DollersElectro`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Order status update SMS sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send order status update SMS:', error);
    throw error;
  }
};

// Send delivery reminder SMS
const sendDeliveryReminderSMS = async (phoneNumber, orderNumber, estimatedDelivery) => {
  try {
    const message = await client.messages.create({
      body: `Reminder: Your order #${orderNumber} is scheduled for delivery on ${estimatedDelivery}. Please ensure someone is available to receive it. DollersElectro`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Delivery reminder SMS sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send delivery reminder SMS:', error);
    throw error;
  }
};

// Send low stock alert SMS
const sendLowStockAlertSMS = async (phoneNumber, productName, currentStock) => {
  try {
    const message = await client.messages.create({
      body: `Low Stock Alert: ${productName} is running low (${currentStock} remaining). Please restock soon. DollersElectro`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Low stock alert SMS sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send low stock alert SMS:', error);
    throw error;
  }
};

// Send promotional SMS
const sendPromotionalSMS = async (phoneNumber, promoMessage) => {
  try {
    const message = await client.messages.create({
      body: `${promoMessage} DollersElectro`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Promotional SMS sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send promotional SMS:', error);
    throw error;
  }
};

// Send appointment reminder SMS
const sendAppointmentReminderSMS = async (phoneNumber, appointmentDate, appointmentTime) => {
  try {
    const message = await client.messages.create({
      body: `Reminder: You have an appointment scheduled for ${appointmentDate} at ${appointmentTime}. DollersElectro`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Appointment reminder SMS sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send appointment reminder SMS:', error);
    throw error;
  }
};

// Send customer support notification SMS
const sendCustomerSupportSMS = async (phoneNumber, ticketNumber, status) => {
  try {
    const statusMessages = {
      'open': 'Your support ticket has been opened and is being reviewed.',
      'in_progress': 'Your support ticket is being worked on.',
      'resolved': 'Your support ticket has been resolved.',
      'closed': 'Your support ticket has been closed.'
    };

    const message = await client.messages.create({
      body: `Support Ticket #${ticketNumber}: ${statusMessages[status] || 'Status updated'}. DollersElectro`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Customer support notification SMS sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send customer support notification SMS:', error);
    throw error;
  }
};

// Send emergency notification SMS
const sendEmergencyNotificationSMS = async (phoneNumber, emergencyMessage) => {
  try {
    const message = await client.messages.create({
      body: `URGENT: ${emergencyMessage} DollersElectro`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Emergency notification SMS sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send emergency notification SMS:', error);
    throw error;
  }
};

// Send bulk SMS to multiple numbers
const sendBulkSMS = async (phoneNumbers, message) => {
  try {
    const messages = [];
    
    for (const phoneNumber of phoneNumbers) {
      try {
        const msg = await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        
        messages.push({
          phoneNumber,
          messageId: msg.sid,
          status: 'sent'
        });
      } catch (error) {
        messages.push({
          phoneNumber,
          error: error.message,
          status: 'failed'
        });
      }
    }

    console.log('Bulk SMS completed:', messages.length, 'messages processed');
    return messages;
  } catch (error) {
    console.error('Failed to send bulk SMS:', error);
    throw error;
  }
};

// Validate phone number format
const validatePhoneNumber = (phoneNumber) => {
  // Basic phone number validation
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phoneNumber);
};

// Format phone number for Twilio
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters except +
  let formatted = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  
  return formatted;
};

// Test SMS service
const testSMSService = async () => {
  try {
    // Test Twilio credentials by getting account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('SMS service is ready. Account:', account.friendlyName);
    return true;
  } catch (error) {
    console.error('SMS service test failed:', error);
    return false;
  }
};

// Get SMS delivery status
const getSMSDeliveryStatus = async (messageSid) => {
  try {
    const message = await client.messages(messageSid).fetch();
    return {
      sid: message.sid,
      status: message.status,
      direction: message.direction,
      from: message.from,
      to: message.to,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    };
  } catch (error) {
    console.error('Failed to get SMS delivery status:', error);
    throw error;
  }
};

// Get SMS usage statistics
const getSMSUsageStats = async (startDate, endDate) => {
  try {
    const messages = await client.messages.list({
      dateSentAfter: startDate,
      dateSentBefore: endDate
    });

    const stats = {
      total: messages.length,
      delivered: messages.filter(m => m.status === 'delivered').length,
      failed: messages.filter(m => m.status === 'failed').length,
      pending: messages.filter(m => m.status === 'pending').length,
      sent: messages.filter(m => m.status === 'sent').length,
      undelivered: messages.filter(m => m.status === 'undelivered').length
    };

    return stats;
  } catch (error) {
    console.error('Failed to get SMS usage statistics:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationSMS,
  sendOrderStatusUpdateSMS,
  sendDeliveryReminderSMS,
  sendLowStockAlertSMS,
  sendPromotionalSMS,
  sendAppointmentReminderSMS,
  sendCustomerSupportSMS,
  sendEmergencyNotificationSMS,
  sendBulkSMS,
  validatePhoneNumber,
  formatPhoneNumber,
  testSMSService,
  getSMSDeliveryStatus,
  getSMSUsageStats
};
