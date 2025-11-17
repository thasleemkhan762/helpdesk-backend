// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    sparse: true // Allows temporary null values during creation
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  category: {
    type: String,
    enum: ['IT', 'HR', 'General'],
    required: true
  },
  sla: {
    hours: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Pre-validate hook - runs BEFORE validation
ticketSchema.pre('validate', async function(next) {
  try {
    // Generate ticket ID for new documents
    if (this.isNew && !this.ticketId) {
      const count = await this.constructor.countDocuments();
      this.ticketId = `TKT-${(count + 1).toString().padStart(5, '0')}`;
    }
    
    // Calculate SLA for new tickets or when priority changes
    if (this.isNew || this.isModified('priority')) {
      let slaHours;
      switch(this.priority) {
        case 'Critical': slaHours = 4; break;
        case 'High': slaHours = 8; break;
        case 'Medium': slaHours = 24; break;
        case 'Low': slaHours = 48; break;
        default: slaHours = 24;
      }
      
      if (!this.sla) {
        this.sla = {};
      }
      
      this.sla.hours = slaHours;
      this.sla.dueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);