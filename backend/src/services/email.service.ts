import nodemailer from 'nodemailer';
import config from '../config';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpPort === 465,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendOrderConfirmation(
    email: string,
    orderDetails: {
      orderId: string;
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      subtotal: number;
      tax: number;
      shipping: number;
      total: number;
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    }
  ): Promise<void> {
    const itemsHtml = orderDetails.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your order! We're getting it ready for shipment.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
            <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Items Ordered</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Order Summary</h2>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px;">Subtotal:</td>
                <td style="padding: 5px; text-align: right;">$${orderDetails.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 5px;">Tax:</td>
                <td style="padding: 5px; text-align: right;">$${orderDetails.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 5px;">Shipping:</td>
                <td style="padding: 5px; text-align: right;">$${orderDetails.shipping.toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #667eea; font-weight: bold; font-size: 18px;">
                <td style="padding: 10px 5px;">Total:</td>
                <td style="padding: 10px 5px; text-align: right; color: #667eea;">$${orderDetails.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Shipping Address</h2>
            <p style="margin: 5px 0;">${orderDetails.shippingAddress.street}</p>
            <p style="margin: 5px 0;">${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}</p>
            <p style="margin: 5px 0;">${orderDetails.shippingAddress.country}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${config.frontendUrl}/orders/${orderDetails.orderId}" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Track Your Order
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Order Confirmation - ${orderDetails.orderNumber}`,
      html,
    });
  }

  async sendShippingNotification(
    email: string,
    orderDetails: {
      orderNumber: string;
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: string;
    }
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">📦 Your Order Has Shipped!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your order is on its way.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Shipping Details</h2>
            <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
            <p><strong>Carrier:</strong> ${orderDetails.carrier}</p>
            <p><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</p>
            <p><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${config.frontendUrl}/track/${orderDetails.trackingNumber}" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Track Package
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
            Thank you for shopping with us!
          </p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Your Order Has Shipped - ${orderDetails.orderNumber}`,
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Commerce Pro</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Commerce Pro!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Thank you for joining Commerce Pro! We're excited to have you as part of our community.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #667eea; margin-top: 0;">Get Started</h2>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✓ Browse our product catalog</li>
              <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✓ Add items to your wishlist</li>
              <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✓ Get exclusive deals and offers</li>
              <li style="padding: 10px 0;">✓ Track your orders easily</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${config.frontendUrl}/products" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Shopping
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
            Happy shopping!
          </p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Commerce Pro!',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">You requested to reset your password.</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Click the button below to reset your password. This link will expire in 1 hour.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #666;">
            If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>

          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            Or copy and paste this link: ${resetUrl}
          </p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }
}

export default new EmailService();


