const communityService = require('../services/community.service');

async function listPosts(req, res, next) {
  try {
    const posts = await communityService.listPosts({
      ...req.query,
      currentUserId: req.user?.id,
    });
    res.status(200).json({ success: true, data: { posts } });
  } catch (error) {
    next(error);
  }
}

async function getPostById(req, res, next) {
  try {
    const post = await communityService.getPostById(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res, next) {
  try {
    const post = await communityService.createPost(req.user.id, req.body);
    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    await communityService.deletePost(req.params.id, req.user.id, req.user.isAdmin);
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
}

async function toggleLike(req, res, next) {
  try {
    const result = await communityService.toggleLike(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function addComment(req, res, next) {
  try {
    const comment = await communityService.addComment(req.params.id, req.user.id, req.body.content);
    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    await communityService.deleteComment(req.params.id, req.user.id, req.user.isAdmin);
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
};
