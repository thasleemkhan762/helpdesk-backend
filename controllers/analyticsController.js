// controllers/analyticsController.js
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Get dashboard analytics (Admin only)
// @route   GET /api/analytics/dashboard
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Total tickets
    const totalTickets = await Ticket.countDocuments();

    // Tickets by status
    const ticketsByStatus = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Tickets by priority
    const ticketsByPriority = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Tickets by category
    const ticketsByCategory = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Resolution rate
    const resolvedTickets = await Ticket.countDocuments({ 
      status: { $in: ['Resolved', 'Closed'] }
    });
    const resolutionRate = totalTickets > 0 
      ? ((resolvedTickets / totalTickets) * 100).toFixed(2) 
      : 0;

    // Average resolution time (in hours)
    const resolvedWithTime = await Ticket.find({
      status: { $in: ['Resolved', 'Closed'] },
      resolvedAt: { $exists: true },
      createdAt: { $exists: true }
    });

    let avgResolutionTime = 0;
    if (resolvedWithTime.length > 0) {
      const totalTime = resolvedWithTime.reduce((sum, ticket) => {
        const time = (ticket.resolvedAt - ticket.createdAt) / (1000 * 60 * 60); // hours
        return sum + time;
      }, 0);
      avgResolutionTime = (totalTime / resolvedWithTime.length).toFixed(2);
    }

    // SLA compliance
    const slaCompliant = await Ticket.countDocuments({
      status: { $in: ['Resolved', 'Closed'] },
      $expr: { $lt: ['$resolvedAt', '$sla.dueDate'] }
    });
    const slaComplianceRate = resolvedTickets > 0 
      ? ((slaCompliant / resolvedTickets) * 100).toFixed(2)
      : 0;

    // Agent performance
    const agentPerformance = await Ticket.aggregate([
      {
        $match: {
          assignedTo: { $exists: true, $ne: null },
          status: { $in: ['Resolved', 'Closed'] }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          ticketsResolved: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $divide: [
                { $subtract: ['$resolvedAt', '$assignedAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent'
        }
      },
      {
        $unwind: '$agent'
      },
      {
        $project: {
          agentName: '$agent.name',
          agentEmail: '$agent.email',
          ticketsResolved: 1,
          avgResolutionTime: { $round: ['$avgResolutionTime', 2] }
        }
      },
      {
        $sort: { ticketsResolved: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Recent tickets
    const recentTickets = await Ticket.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Overdue tickets
    const overdueTickets = await Ticket.countDocuments({
      status: { $nin: ['Resolved', 'Closed'] },
      'sla.dueDate': { $lt: new Date() }
    });

    res.json({
      success: true,
      analytics: {
        totalTickets,
        resolvedTickets,
        openTickets: totalTickets - resolvedTickets,
        resolutionRate: parseFloat(resolutionRate),
        avgResolutionTime: parseFloat(avgResolutionTime),
        slaComplianceRate: parseFloat(slaComplianceRate),
        overdueTickets,
        ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        ticketsByCategory: ticketsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        agentPerformance,
        recentTickets
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get agent statistics
// @route   GET /api/analytics/agents
exports.getAgentStatistics = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' })
      .select('name email department isAvailable assignedTickets');

    const agentStats = await Promise.all(
      agents.map(async (agent) => {
        const resolvedCount = await Ticket.countDocuments({
          assignedTo: agent._id,
          status: { $in: ['Resolved', 'Closed'] }
        });

        const activeCount = await Ticket.countDocuments({
          assignedTo: agent._id,
          status: { $nin: ['Resolved', 'Closed'] }
        });

        return {
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          department: agent.department,
          isAvailable: agent.isAvailable,
          activeTickets: activeCount,
          resolvedTickets: resolvedCount,
          totalAssigned: agent.assignedTickets
        };
      })
    );

    res.json({
      success: true,
      agents: agentStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get ticket trends (last 7 days)
// @route   GET /api/analytics/trends
exports.getTicketTrends = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trends = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};