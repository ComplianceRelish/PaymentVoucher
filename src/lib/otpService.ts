// Store OTPs with their creation time
const otpStore = new Map<string, { otp: string; createdAt: number }>();

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (identifier: string, otp: string) => {
  otpStore.set(identifier, {
    otp,
    createdAt: Date.now(),
  });
};

export const verifyOTP = (identifier: string, userOTP: string): boolean => {
  const storedData = otpStore.get(identifier);
  if (!storedData) return false;

  const { otp, createdAt } = storedData;
  const now = Date.now();
  const validityPeriod = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (now - createdAt > validityPeriod) {
    otpStore.delete(identifier);
    return false;
  }

  if (otp === userOTP) {
    otpStore.delete(identifier);
    return true;
  }

  return false;
};

// Create OTP service
interface Notification {
  message: string;
  type: string;
  otp: string;
  duration: number;
}

interface OTPService {
  sendOTP: (identifier: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (identifier: string, userOTP: string) => boolean;
}

const createOTPService = (addNotification: (notification: Notification) => void): OTPService => {
  const sendOTP = async (identifier: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const otp = generateOTP();
      storeOTP(identifier, otp);
      
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

export default createOTPService;
