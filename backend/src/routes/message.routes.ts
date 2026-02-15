import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { messageService } from '../services/message.service';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/conversations', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const conversations = await messageService.getRecentConversations(req.user!.id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.get('/:userId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const otherUserId = req.params.userId;
    const messages = await messageService.getConversation(req.user!.id, otherUserId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
