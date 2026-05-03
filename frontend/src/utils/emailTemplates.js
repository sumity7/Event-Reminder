export const PASSWORD_RESET_TEMPLATE = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Password Reset Request</h2>
    <p>Hello,</p>
    <p>You requested to reset your password.</p>

    <h3 style="color: #333;">Your OTP: {{otp}}</h3>

    <p>This OTP is valid for 10 minutes.</p>

    <p>If you did not request this, please ignore this email.</p>

    <br/>
    <p>Regards,<br/>Your App Team</p>
  </div>
`;

export const EMAIL_VERIFY_TEMPLATE = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Email Verification</h2>
    <p>Your OTP is:</p>

    <h3 style="color: #333;">{{otp}}</h3>

    <p>This OTP is valid for 24 hours.</p>
  </div>
`;