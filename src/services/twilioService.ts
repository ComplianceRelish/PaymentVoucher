import { Twilio } from 'twilio';

// Initialize Twilio client
const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const fromNumber = '+919446012324'; // Your verified Twilio number

const client = new Twilio(accountSid, authToken);

export const sendSMS = async (to: string, message: string) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });
    console.log('SMS sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error };
  }
};

// Function to send OTP
export const sendOTP = async (phoneNumber: string, otp: string) => {
  const message = `Your RelishApprovals verification code is: ${otp}. Valid for 5 minutes.`;
  return sendSMS(phoneNumber, message);
};

// Function to format phone number to E.164 format
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add India country code if not present
  if (!cleaned.startsWith('91')) {
    return `+91${cleaned}`;
  }
  
  return `+${cleaned}`;
};
