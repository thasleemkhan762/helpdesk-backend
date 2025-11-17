// seed.js - Populate database with sample data
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Ticket = require('./models/Ticket');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    department: 'General'
  },
  {
    name: 'John Agent',
    email: 'agent1@company.com',
    password: 'agent123',
    role: 'agent',
    department: 'IT',
    isAvailable: true
  },
  {
    name: 'Sarah Agent',
    email: 'agent2@company.com',
    password: 'agent123',
    role: 'agent',
    department: 'HR',
    isAvailable: true
  },
  {
    name: 'Mike Agent',
    email: 'agent3@company.com',
    password: 'agent123',
    role: 'agent',
    department: 'General',
    isAvailable: true
  },
  {
    name: 'Regular User',
    email: 'user@company.com',
    password: 'user123',
    role: 'user',
    department: 'General'
  },
  {
    name: 'Jane Doe',
    email: 'jane@company.com',
    password: 'user123',
    role: 'user',
    department: 'General'
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Ticket.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log('✅ Users created:', createdUsers.length);

    // Create sample tickets
    const regularUser = createdUsers.find(u => u.role === 'user');
    const itAgent = createdUsers.find(u => u.department === 'IT');
    const hrAgent = createdUsers.find(u => u.department === 'HR');

    // Create tickets one by one to trigger pre-save hooks
    const ticketsData = [
      {
        title: 'Cannot access email account',
        description: 'I am unable to login to my email account. Getting authentication error.',
        priority: 'High',
        category: 'IT',
        status: 'Open',
        createdBy: regularUser._id
      },
      {
        title: 'Laptop keyboard not working',
        description: 'Some keys on my laptop keyboard are not responding. Need urgent replacement.',
        priority: 'Critical',
        category: 'IT',
        status: 'In Progress',
        createdBy: regularUser._id,
        assignedTo: itAgent._id,
        assignedAt: new Date()
      },
      {
        title: 'Leave application not approved',
        description: 'I submitted my leave application 5 days ago but it is still pending.',
        priority: 'Medium',
        category: 'HR',
        status: 'Open',
        createdBy: createdUsers[5]._id
      },
      {
        title: 'Salary slip not received',
        description: 'I have not received my salary slip for the last month.',
        priority: 'Low',
        category: 'HR',
        status: 'Resolved',
        createdBy: createdUsers[5]._id,
        assignedTo: hrAgent._id,
        assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'VPN connection issues',
        description: 'Unable to connect to company VPN from home. Getting timeout error.',
        priority: 'High',
        category: 'IT',
        status: 'In Progress',
        createdBy: regularUser._id,
        assignedTo: itAgent._id,
        assignedAt: new Date()
      }
    ];

    // Create tickets one by one to trigger pre-save hooks
    const createdTickets = [];
    for (const ticketData of ticketsData) {
      const ticket = new Ticket(ticketData);
      await ticket.save();
      createdTickets.push(ticket);
    }
    console.log('✅ Sample tickets created:', createdTickets.length);

    // Update agent assigned ticket counts
    itAgent.assignedTickets = 2;
    hrAgent.assignedTickets = 0;
    await itAgent.save();
    await hrAgent.save();

    console.log('\n📊 Seed Data Summary:');
    console.log('====================');
    console.log(`Total Users: ${createdUsers.length}`);
    console.log(`  - Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
    console.log(`  - Agents: ${createdUsers.filter(u => u.role === 'agent').length}`);
    console.log(`  - Users: ${createdUsers.filter(u => u.role === 'user').length}`);
    console.log(`\nTotal Tickets: ${createdTickets.length}`);
    console.log(`  - Open: ${createdTickets.filter(t => t.status === 'Open').length}`);
    console.log(`  - In Progress: ${createdTickets.filter(t => t.status === 'In Progress').length}`);
    console.log(`  - Resolved: ${createdTickets.filter(t => t.status === 'Resolved').length}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('====================');
    console.log('Admin: admin@company.com / admin123');
    console.log('Agent (IT): agent1@company.com / agent123');
    console.log('Agent (HR): agent2@company.com / agent123');
    console.log('User: user@company.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

// Run seed
connectDB().then(() => seedData());