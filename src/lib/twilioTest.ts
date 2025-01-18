import { sendSMS } from '../services/twilioService';

export const testTwilioConnection = async () => {
  try {
    const testResult = await sendSMS(
      '+919446012324', // Your verified number
      'Test message from RelishApprovals'
    );
    
    if (testResult.success) {
      console.log('Twilio test successful! Message ID:', testResult.messageId);
      return true;
    } else {
      console.error('Twilio test failed:', testResult.error);
      return false;
    }
  } catch (error) {
    console.error('Error testing Twilio:', error);
    return false;
  }
};
