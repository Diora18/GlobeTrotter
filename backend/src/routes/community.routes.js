const express = require('express');
const communityController = require('../controllers/community.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Optional auth helper to pass currentUserId to list & view endpoints
function optionalAuth(req, res, next) {
  const token = req.cookies?.token;
  if (token) {
    try {
      const { verifyToken } = require('../utils/jwt');
      const payload = verifyToken(token);
      req.user = { id: payload.id, email: payload.email, name: payload.name, isAdmin: Boolean(payload.isAdmin) };
    } catch {
      // ignore invalid token
    }
  }
  next();
}

router.get('/posts', optionalAuth, communityController.listPosts);
router.get('/posts/:id', optionalAuth, communityController.getPostById);
router.post('/posts', authMiddleware, communityController.createPost);
router.delete('/posts/:id', authMiddleware, communityController.deletePost);
router.post('/posts/:id/like', authMiddleware, communityController.toggleLike);
router.post('/posts/:id/comments', authMiddleware, communityController.addComment);
router.delete('/comments/:id', authMiddleware, communityController.deleteComment);

module.exports = router;
