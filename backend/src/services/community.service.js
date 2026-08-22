const prisma = require('../lib/prisma');
const { notFound, forbidden, badRequest } = require('../utils/errors');
const { formatUser, formatDateTime } = require('../utils/format');

function formatPost(post, currentUserId) {
  const isLikedByMe = currentUserId
    ? (post.likes || []).some((l) => l.userId === currentUserId)
    : false;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    rating: post.rating,
    imageUrl: post.imageUrl,
    likesCount: post.likesCount || (post.likes || []).length,
    isLikedByMe,
    commentCount: post._count?.comments ?? (post.comments || []).length,
    createdAt: formatDateTime(post.createdAt),
    user: post.user ? formatUser(post.user) : null,
    trip: post.trip
      ? {
          id: post.trip.id,
          name: post.trip.name,
          coverPhotoUrl: post.trip.coverPhotoUrl,
          shareSlug: post.trip.shareSlug,
        }
      : null,
    city: post.city
      ? {
          id: post.city.id,
          name: post.city.name,
          country: post.city.country,
          imageUrl: post.city.imageUrl,
        }
      : null,
    comments: (post.comments || []).map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: formatDateTime(c.createdAt),
      user: c.user ? formatUser(c.user) : null,
    })),
  };
}

async function listPosts({ tripId, cityId, sort = 'recent', currentUserId }) {
  const where = {};
  if (tripId) where.tripId = tripId;
  if (cityId) where.cityId = cityId;

  let orderBy = { createdAt: 'desc' };
  if (sort === 'popular') orderBy = { likesCount: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  const posts = await prisma.communityPost.findMany({
    where,
    orderBy,
    include: {
      user: true,
      trip: true,
      city: true,
      likes: true,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { user: true },
      },
      _count: { select: { comments: true } },
    },
  });

  return posts.map((p) => formatPost(p, currentUserId));
}

async function getPostById(postId, currentUserId) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      user: true,
      trip: true,
      city: true,
      likes: true,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { user: true },
      },
    },
  });

  if (!post) throw notFound('Community post not found');
  return formatPost(post, currentUserId);
}

async function createPost(userId, { title, content, rating = 5, tripId, cityId, imageUrl }) {
  if (!title || !content) {
    throw badRequest('Title and content are required');
  }

  // If tripId provided, verify it exists
  const validTripId = tripId && typeof tripId === 'string' && tripId.trim() !== '' ? tripId : null;
  const validCityId = cityId && typeof cityId === 'string' && cityId.trim() !== '' ? cityId : null;

  if (validTripId) {
    const trip = await prisma.trip.findUnique({ where: { id: validTripId } });
    if (!trip) throw notFound('Trip not found');
  }

  if (validCityId) {
    const city = await prisma.city.findUnique({ where: { id: validCityId } });
    if (!city) throw notFound('City not found');
  }

  const post = await prisma.communityPost.create({
    data: {
      userId,
      title,
      content,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      tripId: validTripId,
      cityId: validCityId,
      imageUrl: imageUrl || null,
    },
    include: {
      user: true,
      trip: true,
      city: true,
      likes: true,
      comments: { include: { user: true } },
    },
  });

  return formatPost(post, userId);
}

async function deletePost(postId, userId, isAdmin = false) {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) throw notFound('Community post not found');

  if (post.userId !== userId && !isAdmin) {
    throw forbidden('Not authorized to delete this post');
  }

  await prisma.communityPost.delete({ where: { id: postId } });
}

async function toggleLike(postId, userId) {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) throw notFound('Post not found');

  const existingLike = await prisma.communityPostLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existingLike) {
    await prisma.communityPostLike.delete({
      where: { id: existingLike.id },
    });
    await prisma.communityPost.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    });
    return { isLikedByMe: false };
  } else {
    await prisma.communityPostLike.create({
      data: { postId, userId },
    });
    await prisma.communityPost.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });
    return { isLikedByMe: true };
  }
}

async function addComment(postId, userId, content) {
  if (!content || !content.trim()) {
    throw badRequest('Comment content cannot be empty');
  }

  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) throw notFound('Post not found');

  const comment = await prisma.communityComment.create({
    data: {
      postId,
      userId,
      content: content.trim(),
    },
    include: { user: true },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: formatDateTime(comment.createdAt),
    user: formatUser(comment.user),
  };
}

async function deleteComment(commentId, userId, isAdmin = false) {
  const comment = await prisma.communityComment.findUnique({ where: { id: commentId } });
  if (!comment) throw notFound('Comment not found');

  if (comment.userId !== userId && !isAdmin) {
    throw forbidden('Not authorized to delete this comment');
  }

  await prisma.communityComment.delete({ where: { id: commentId } });
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
