import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCommunityPosts,
  getCommunityPost,
  createCommunityPost,
  deleteCommunityPost,
  togglePostLike,
  addPostComment,
  deletePostComment,
} from '../api/community';

export function useCommunityPosts(params = {}) {
  return useQuery({
    queryKey: ['community-posts', params],
    queryFn: () => listCommunityPosts(params),
  });
}

export function useCommunityPost(id) {
  return useQuery({
    queryKey: ['community-post', id],
    queryFn: () => getCommunityPost(id),
    enabled: Boolean(id),
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCommunityPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
}

export function useDeleteCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCommunityPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: togglePostLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-post'] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPostComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-post'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePostComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-post'] });
    },
  });
}
