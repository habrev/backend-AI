import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();


router.post('/login', userController.login);


router.get('/', authenticate, userController.getAll);
router.get('/:id', authenticate, userController.getById);
router.post('/', authenticate, authorize(['admin']), userController.create);
router.put('/:id', authenticate, userController.update);
router.delete('/:id', authenticate, authorize(['admin']), userController.delete);

export default router;
