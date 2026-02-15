import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await userService.getAllUsers(req.user!.id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
