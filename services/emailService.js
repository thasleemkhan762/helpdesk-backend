// services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP settings
  auth: {
    user: process.env.EMAIL_USER ,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email notification
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'helpdesk@company.com',
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

/**
 * Send ticket creation notification
 */
exports.sendTicketCreatedEmail = async (ticket, user) => {
  const subject = `Ticket Created: ${ticket.ticketId} - ${ticket.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Ticket Created Successfully</h2>
      <p>Hello ${user.name},</p>
      <p>Your support ticket has been created successfully.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Priority:</strong> <span style="color: ${getPriorityColor(ticket.priority)};">${ticket.priority}</span></p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>SLA:</strong> ${ticket.sla.hours} hours</p>
        <p><strong>Due Date:</strong> ${new Date(ticket.sla.dueDate).toLocaleString()}</p>
      </div>
      <p>We will keep you updated on the progress.</p>
      <p>Best regards,<br>Helpdesk Support Team</p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

/**
 * Send ticket assignment notification to agent
 */
exports.sendTicketAssignedEmail = async (ticket, agent, user) => {
  const subject = `New Ticket Assigned: ${ticket.ticketId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">New Ticket Assigned to You</h2>
      <p>Hello ${agent.name},</p>
      <p>A new ticket has been assigned to you.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Description:</strong> ${ticket.description}</p>
        <p><strong>Priority:</strong> <span style="color: ${getPriorityColor(ticket.priority)};">${ticket.priority}</span></p>
        <p><strong>Requester:</strong> ${user.name} (${user.email})</p>
        <p><strong>Due Date:</strong> ${new Date(ticket.sla.dueDate).toLocaleString()}</p>
      </div>
      <p>Please take action as soon as possible.</p>
      <p>Best regards,<br>Helpdesk System</p>
    </div>
  `;
  
  return await sendEmail(agent.email, subject, html);
};

/**
 * Send ticket status update notification
 */
exports.sendTicketStatusUpdateEmail = async (ticket, user, oldStatus) => {
  const subject = `Ticket Status Updated: ${ticket.ticketId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF9800;">Ticket Status Updated</h2>
      <p>Hello ${user.name},</p>
      <p>Your ticket status has been updated.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> <span style="color: ${getStatusColor(ticket.status)};">${ticket.status}</span></p>
      </div>
      <p>Thank you for your patience.</p>
      <p>Best regards,<br>Helpdesk Support Team</p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

/**
 * Send ticket resolved notification
 */
exports.sendTicketResolvedEmail = async (ticket, user) => {
  const subject = `Ticket Resolved: ${ticket.ticketId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Ticket Resolved</h2>
      <p>Hello ${user.name},</p>
      <p>Great news! Your support ticket has been resolved.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Resolved At:</strong> ${new Date(ticket.resolvedAt).toLocaleString()}</p>
      </div>
      <p>If you have any further questions, please don't hesitate to create a new ticket.</p>
      <p>Best regards,<br>Helpdesk Support Team</p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

// Helper functions
const getPriorityColor = (priority) => {
  const colors = {
    'Low': '#4CAF50',
    'Medium': '#FF9800',
    'High': '#FF5722',
    'Critical': '#F44336'
  };
  return colors[priority] || '#757575';
};

const getStatusColor = (status) => {
  const colors = {
    'Open': '#2196F3',
    'In Progress': '#FF9800',
    'Resolved': '#4CAF50',
    'Closed': '#757575'
  };
  return colors[status] || '#757575';
};