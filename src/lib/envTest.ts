// Test environment variables
console.log('Twilio Environment Variables Check:');
console.log('ACCOUNT_SID exists:', !!import.meta.env.VITE_TWILIO_ACCOUNT_SID);
console.log('AUTH_TOKEN exists:', !!import.meta.env.VITE_TWILIO_AUTH_TOKEN);
console.log('PHONE_NUMBER exists:', !!import.meta.env.VITE_TWILIO_PHONE_NUMBER);

// Log first few characters of each (safely)
if (import.meta.env.VITE_TWILIO_ACCOUNT_SID) {
  console.log('ACCOUNT_SID starts with:', import.meta.env.VITE_TWILIO_ACCOUNT_SID.substring(0, 6) + '...');
}

if (import.meta.env.VITE_TWILIO_PHONE_NUMBER) {
  console.log('PHONE_NUMBER:', import.meta.env.VITE_TWILIO_PHONE_NUMBER);
}
