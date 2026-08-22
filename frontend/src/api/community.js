import { api } from './client';

export function listCommunityPosts(params = {}) {
  const search = new URLSearchParams();
  if (params.tripId) search.set('tripId', params.tripId);
  if (params.cityId) search.set('cityId', params.cityId);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return api(`/api/community/posts${query ? `?${query}` : ''}`);
}

export function getCommunityPost(id) {
  return api(`/api/community/posts/${id}`);
}

export function createCommunityPost(data) {
  return api('/api/community/posts', {
    method: 'POST',
    body: data,
  });
}

export function deleteCommunityPost(id) {
  return api(`/api/community/posts/${id}`, {
    method: 'DELETE',
  });
}

export function togglePostLike(id) {
  return api(`/api/community/posts/${id}/like`, {
    method: 'POST',
  });
}

export function addPostComment({ postId, content }) {
  return api(`/api/community/posts/${postId}/comments`, {
    method: 'POST',
    body: { content },
  });
}

export function deletePostComment(commentId) {
  return api(`/api/community/comments/${commentId}`, {
    method: 'DELETE',
  });
}
