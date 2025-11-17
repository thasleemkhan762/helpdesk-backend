// services/autoAssignService.js
const User = require('../models/User');
const Ticket = require('../models/Ticket');

/**
 * Auto-assign ticket to available agent using round-robin algorithm
 * Finds agents with least assigned tickets in the relevant department
 */
exports.autoAssignTicket = async (ticket) => {
  try {
    // Find available agents in the same department
    const agents = await User.find({
      role: 'agent',
      isAvailable: true,
      department: ticket.category
    }).sort({ assignedTickets: 1 }); // Sort by least assigned tickets

    if (agents.length === 0) {
      console.log('No available agents found for department:', ticket.category);
      return null;
    }

    // Assign to agent with least tickets (round-robin)
    const assignedAgent = agents[0];

    // Update ticket
    ticket.assignedTo = assignedAgent._id;
    ticket.assignedAt = new Date();
    ticket.status = 'In Progress';
    await ticket.save();

    // Update agent's assigned ticket count
    assignedAgent.assignedTickets += 1;
    await assignedAgent.save();

    console.log(`✅ Ticket ${ticket.ticketId} assigned to ${assignedAgent.name}`);
    
    return assignedAgent;
  } catch (error) {
    console.error('Auto-assignment error:', error);
    return null;
  }
};

/**
 * Reassign ticket to another agent
 */
exports.reassignTicket = async (ticketId, newAgentId) => {
  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Decrease old agent's count
    if (ticket.assignedTo) {
      await User.findByIdAndUpdate(ticket.assignedTo, {
        $inc: { assignedTickets: -1 }
      });
    }

    // Assign to new agent
    const newAgent = await User.findById(newAgentId);
    if (!newAgent || newAgent.role !== 'agent') {
      throw new Error('Invalid agent');
    }

    ticket.assignedTo = newAgentId;
    ticket.assignedAt = new Date();
    await ticket.save();

    // Increase new agent's count
    newAgent.assignedTickets += 1;
    await newAgent.save();

    return ticket;
  } catch (error) {
    console.error('Reassignment error:', error);
    throw error;
  }
};