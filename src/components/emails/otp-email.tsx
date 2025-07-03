import React from 'react';

interface OtpEmailProps {
  otp: string;
}

export const OtpEmail: React.FC<Readonly<OtpEmailProps>> = ({ otp }) => (
  <div>
    <h1>Your Verification Code</h1>
    <p>Your one-time password is: <b>{otp}</b></p>
  </div>
); 