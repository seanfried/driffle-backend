const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (options) => {
  try {
    // If no real credentials, log to console
    if (process.env.EMAIL_USERNAME === 'test@example.com' || !process.env.EMAIL_USERNAME) {
      console.log('=================================================');
      console.log('📧 MOCK EMAIL SERVICE');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('-------------------------------------------------');
      console.log(options.text || 'No text content');
      console.log('=================================================');
      return { messageId: 'mock-email-id' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Driffle Marketplace!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to Driffle Marketplace!</h1>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for joining Driffle Marketplace! We're excited to have you as part of our gaming community.</p>
      <p>Get ready to discover amazing deals on digital games, gift cards, and DLCs.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>What's next?</h3>
        <ul>
          <li>Browse our extensive catalog of games</li>
          <li>Check out our daily deals</li>
          <li>Join Driffle Plus for exclusive discounts</li>
        </ul>
      </div>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Happy gaming!<br>The Driffle Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

const sendOrderConfirmationEmail = async (order, user) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.product.title}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">€${item.finalPrice.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Order Confirmation</h1>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for your order! We've received your payment and are processing your order.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> €${order.pricing.total.toFixed(2)}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: left;">Quantity</th>
            <th style="padding: 8px; text-align: left;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <p>Your digital codes will be delivered to your account shortly. You can track your order status in your account dashboard.</p>
      <p>Thank you for choosing Driffle Marketplace!</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Password Reset</h1>
      <p>Hi ${user.firstName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

const sendEmailVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  const subject = 'Verify Your Email Address';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Email Verification</h1>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

const sendSubscriptionConfirmationEmail = async (user, subscription) => {
  const subject = 'Welcome to Driffle Plus!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to Driffle Plus!</h1>
      <p>Hi ${user.firstName},</p>
      <p>Congratulations! You're now a Driffle Plus member and can enjoy exclusive benefits.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Your Plus Benefits</h3>
        <ul>
          <li>${subscription.benefits.discountPercentage}% discount on all purchases</li>
          <li>Exclusive access to member-only deals</li>
          <li>Priority customer support</li>
          <li>Early access to new releases</li>
        </ul>
      </div>

      <p><strong>Subscription Details:</strong></p>
      <ul>
        <li>Plan: ${subscription.plan === 'plus-monthly' ? 'Monthly' : 'Yearly'}</li>
        <li>Price: €${subscription.pricing.amount}</li>
        <li>Next billing date: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</li>
      </ul>

      <p>Thank you for supporting Driffle Marketplace!</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendSubscriptionConfirmationEmail,
};