interface OTPNotification {
  message: string;
  type: 'otp';
  otp: string;
  duration?: number;
}

interface OTPServiceResult {
  success: boolean;
  error?: string;
}

interface OTPService {
  sendOTP: (mobile: string) => Promise<OTPServiceResult>;
  verifyOTP: (mobile: string, otp: string) => boolean;
}

// In-memory OTP storage (replace with Redis or database in production)
const otpStore = new Map<string, { otp: string; expiry: number }>();

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with 5-minute expiry
const storeOTP = (mobile: string, otp: string): void => {
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(mobile, { otp, expiry });
};

// Verify OTP
const verifyOTP = (mobile: string, otp: string): boolean => {
  const storedData = otpStore.get(mobile);
  if (!storedData) return false;
  
  const { otp: storedOTP, expiry } = storedData;
  if (Date.now() > expiry) {
    otpStore.delete(mobile);
    return false;
  }
  
  if (otp === storedOTP) {
    otpStore.delete(mobile);
    return true;
  }
  
  return false;
};

// Send OTP via in-app notification
const createOTPService = (addNotification: (notification: OTPNotification) => void): OTPService => {
  const sendOTP = async (mobile: string): Promise<OTPServiceResult> => {
    try {
      const otp = generateOTP();
      
      // Store OTP
      storeOTP(mobile, otp);
      
      // Show OTP in notification
      addNotification({
        message: 'Your OTP for verification is:',
        type: 'otp',
        otp,
        duration: 30000 // 30 seconds
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send OTP' 
      };
    }
  };

  return {
    sendOTP,
    verifyOTP
  };
};

export { createOTPService, type OTPService, type OTPNotification };
