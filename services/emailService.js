// services/emailService.js
const SibApiV3Sdk = require('@sendinblue/client');

// Initialize Brevo client
const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
brevoClient.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

/**
 * Send email using Brevo API
 */
const sendEmail = async (to, subject, html) => {
  try {
    await brevoClient.sendTransacEmail({
      sender: {
        name: "Helpdesk Support",
        email: process.env.EMAIL_USER || "helpdesk@company.com",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error);
    return false;
  }
};

/**
 * Send ticket creation notification
 */
exports.sendTicketCreatedEmail = async (ticket, user) => {
  const subject = `Ticket Created: ${ticket.ticketId} - ${ticket.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #4CAF50;">Ticket Created Successfully</h2>
      <p>Hello ${user.name},</p>
      <p>Your support ticket has been created successfully.</p>

      <div style="background:#f5f5f5;padding:15px;border-radius:6px;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Priority:</strong> 
          <span style="color:${getPriorityColor(ticket.priority)}">${ticket.priority}</span>
        </p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>SLA:</strong> ${ticket.sla.hours} hours</p>
        <p><strong>Due Date:</strong> ${new Date(ticket.sla.dueDate).toLocaleString()}</p>
      </div>

      <p>We will keep you updated.</p>
      <p>Regards,<br>Helpdesk Team</p>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color:#2196F3;">New Ticket Assigned</h2>
      <p>Hello ${agent.name},</p>
      <p>A new ticket has been assigned to you.</p>

      <div style="background:#f5f5f5;padding:15px;border-radius:6px;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Description:</strong> ${ticket.description}</p>
        <p><strong>Priority:</strong> 
          <span style="color:${getPriorityColor(ticket.priority)}">${ticket.priority}</span>
        </p>
        <p><strong>Requester:</strong> ${user.name} (${user.email})</p>
        <p><strong>Due Date:</strong> ${new Date(ticket.sla.dueDate).toLocaleString()}</p>
      </div>

      <p>Please take action soon.</p>
      <p>Helpdesk System</p>
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
    <div style="font-family: Arial; max-width: 600px;">
      <h2 style="color:#FF9800;">Ticket Status Updated</h2>
      <p>Hello ${user.name},</p>
      <p>Your ticket status has been updated.</p>

      <div style="background:#f5f5f5;padding:15px;border-radius:6px;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> 
          <span style="color:${getStatusColor(ticket.status)}">${ticket.status}</span>
        </p>
      </div>

      <p>Thank you for your patience.</p>
      <p>Helpdesk Team</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

/**
 * Send ticket resolved email
 */
exports.sendTicketResolvedEmail = async (ticket, user) => {
  const subject = `Ticket Resolved: ${ticket.ticketId}`;
  const html = `
    <div style="font-family: Arial; max-width: 600px;">
      <h2 style="color:#4CAF50;">Ticket Resolved</h2>
      <p>Hello ${user.name},</p>
      <p>Your ticket has been successfully resolved.</p>

      <div style="background:#f5f5f5;padding:15px;border-radius:6px;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Resolved At:</strong> ${new Date(ticket.resolvedAt).toLocaleString()}</p>
      </div>

      <p>If you have more concerns, feel free to open a new ticket.</p>
      <p>Helpdesk Support</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

// Helpers
const getPriorityColor = (priority) => ({
  Low: "#4CAF50",
  Medium: "#FF9800",
  High: "#FF5722",
  Critical: "#F44336",
}[priority] || "#757575");

const getStatusColor = (status) => ({
  Open: "#2196F3",
  "In Progress": "#FF9800",
  Resolved: "#4CAF50",
  Closed: "#757575",
}[status] || "#757575");
