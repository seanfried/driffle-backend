const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // mrlesaint@gmail.com
    pass: process.env.EMAIL_PASS  // App Password (not your real password)
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Driffle Marketplace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('📧 Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

const sendWelcomeEmail = async (user) => {
  const subject = 'Bienvenue sur Driffle ! 🎮';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Bienvenue ${user.firstName} !</h1>
      <p>Nous sommes ravis de vous compter parmi nous.</p>
      <p>Vous pouvez maintenant accéder à des milliers de jeux au meilleur prix.</p>
      <a href="${process.env.CLIENT_URL}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Explorer le catalogue</a>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};

const sendOrderConfirmationEmail = async (user, order) => {
  const subject = `Confirmation de commande #${order._id.toString().slice(-6)}`;
  
  const itemsHtml = order.orderItems.map(item => `
    <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
      <strong>${item.title}</strong> x${item.quantity} - €${item.price}
      ${item.productKeys && item.productKeys.length > 0 ? 
        `<div style="background: #f9f9f9; padding: 5px; margin-top: 5px; font-family: monospace;">🔑 Clé: ${item.productKeys[0].key}</div>` 
        : ''}
    </div>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Merci pour votre commande !</h1>
      <p>Bonjour ${user.firstName},</p>
      <p>Votre commande a bien été confirmée.</p>
      
      <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3>Récapitulatif</h3>
        ${itemsHtml}
        <div style="margin-top: 15px; text-align: right; font-weight: bold;">
          Total: €${order.totalPrice}
        </div>
      </div>

      <p>Vos clés d'activation sont disponibles ci-dessus ou dans votre espace "Commandes".</p>
    </div>
  `;
  
  return sendEmail(user.email, subject, html);
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail
};
