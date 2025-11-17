// controllers/ticketController.js
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { autoAssignTicket } = require('../services/autoAssignService');
const emailService = require('../services/emailService');

// @desc    Create new ticket
// @route   POST /api/tickets
exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;

    // Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      priority,
      category,
      createdBy: req.user._id
    });

    // Auto-assign to available agent
    const assignedAgent = await autoAssignTicket(ticket);

    // Populate ticket data
    await ticket.populate('createdBy', 'name email');
    await ticket.populate('assignedTo', 'name email');

    // Send email notifications
    await emailService.sendTicketCreatedEmail(ticket, req.user);
    
    if (assignedAgent) {
      await emailService.sendTicketAssignedEmail(ticket, assignedAgent, req.user);
    }

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets
exports.getTickets = async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    }

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;

    // If resolved, set resolved date
    if (status === 'Resolved' || status === 'Closed') {
      ticket.resolvedAt = new Date();
      
      // Decrease agent's assigned count
      if (ticket.assignedTo) {
        await User.findByIdAndUpdate(ticket.assignedTo, {
          $inc: { assignedTickets: -1 }
        });
      }
    }

    await ticket.save();
    await ticket.populate('createdBy', 'name email');
    await ticket.populate('assignedTo', 'name email');

    // Send email notifications
    const creator = await User.findById(ticket.createdBy);
    
    if (status === 'Resolved' || status === 'Closed') {
      await emailService.sendTicketResolvedEmail(ticket, creator);
    } else {
      await emailService.sendTicketStatusUpdateEmail(ticket, creator, oldStatus);
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date()
    });

    await ticket.save();
    await ticket.populate('comments.user', 'name email');

    res.json({
      success: true,
      comments: ticket.comments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete ticket (admin only)
// @route   DELETE /api/tickets/:id
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Decrease agent's assigned count if ticket was assigned
    if (ticket.assignedTo && ticket.status !== 'Resolved' && ticket.status !== 'Closed') {
      await User.findByIdAndUpdate(ticket.assignedTo, {
        $inc: { assignedTickets: -1 }
      });
    }

    await ticket.deleteOne();

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};