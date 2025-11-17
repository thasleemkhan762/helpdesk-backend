const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicketStatus,
  addComment,
  deleteTicket
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createTicket);
router.get('/', protect, getTickets);
router.get('/:id', protect, getTicket);
router.put('/:id/status', protect, authorize('agent', 'admin'), updateTicketStatus);
router.post('/:id/comments', protect, addComment);
router.delete('/:id', protect, authorize('admin'), deleteTicket);

module.exports = router;