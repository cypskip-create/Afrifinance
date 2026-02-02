import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PostAuthor {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  stock_mentions: string[] | null;
  created_at: string;
  updated_at: string;
  author?: PostAuthor;
  likes_count: number;
  reposts_count: number;
  comments_count: number;
  is_liked: boolean;
  is_reposted: boolean;
  is_bookmarked: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: PostAuthor;
}

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (filter?: 'for-you' | 'following' | 'trending') => {
    setLoading(true);
    try {
      // Fetch posts
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      // Fetch profiles for each post using public view (excludes sensitive data like email)
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('id, user_id, full_name, avatar_url, bio')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      // Get counts and user interactions for each post
      const postsWithDetails = await Promise.all(
        (postsData || []).map(async (post) => {
          const [likesRes, repostsRes, commentsRes, likedRes, repostedRes, bookmarkedRes] = await Promise.all([
            supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_reposts').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            user ? supabase.from('post_likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
            user ? supabase.from('post_reposts').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
            user ? supabase.from('post_bookmarks').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
          ]);

          return {
            ...post,
            author: profileMap.get(post.user_id),
            likes_count: likesRes.count || 0,
            reposts_count: repostsRes.count || 0,
            comments_count: commentsRes.count || 0,
            is_liked: !!likedRes.data,
            is_reposted: !!repostedRes.data,
            is_bookmarked: !!bookmarkedRes.data,
          };
        })
      );

      setPosts(postsWithDetails);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (content: string, imageUrl?: string) => {
    if (!user) return { error: { message: 'Must be logged in' } };

    // Extract stock mentions ($SYMBOL)
    const stockMentions = content.match(/\$[A-Z]+/g)?.map(s => s.slice(1)) || [];

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        image_url: imageUrl || null,
        stock_mentions: stockMentions.length > 0 ? stockMentions : null,
      })
      .select()
      .single();

    if (!error) {
      fetchPosts();
    }

    return { data, error };
  };

  const deletePost = async (postId: string) => {
    if (!user) return { error: { message: 'Must be logged in' } };

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }

    return { error };
  };

  const likePost = async (postId: string) => {
    if (!user) return { error: { message: 'Must be logged in' } };

    const post = posts.find(p => p.id === postId);
    if (!post) return { error: { message: 'Post not found' } };

    if (post.is_liked) {
      // Unlike
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        ));
      }
      return { error };
    } else {
      // Like
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
      }
      return { error };
    }
  };

  const repostPost = async (postId: string) => {
    if (!user) return { error: { message: 'Must be logged in' } };

    const post = posts.find(p => p.id === postId);
    if (!post) return { error: { message: 'Post not found' } };

    if (post.is_reposted) {
      const { error } = await supabase
        .from('post_reposts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_reposted: false, reposts_count: p.reposts_count - 1 }
            : p
        ));
      }
      return { error };
    } else {
      const { error } = await supabase
        .from('post_reposts')
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_reposted: true, reposts_count: p.reposts_count + 1 }
            : p
        ));
      }
      return { error };
    }
  };

  const bookmarkPost = async (postId: string) => {
    if (!user) return { error: { message: 'Must be logged in' } };

    const post = posts.find(p => p.id === postId);
    if (!post) return { error: { message: 'Post not found' } };

    if (post.is_bookmarked) {
      const { error } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_bookmarked: false }
            : p
        ));
      }
      return { error };
    } else {
      const { error } = await supabase
        .from('post_bookmarks')
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_bookmarked: true }
            : p
        ));
      }
      return { error };
    }
  };

  const fetchComments = async (postId: string): Promise<Comment[]> => {
    const { data: comments } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!comments) return [];

    const userIds = [...new Set(comments.map(c => c.user_id))];
    // Use public view to exclude sensitive data like email
    const { data: profiles } = await supabase
      .from('profiles_public')
      .select('id, user_id, full_name, avatar_url, bio')
      .in('user_id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

    return comments.map(c => ({
      ...c,
      author: profileMap.get(c.user_id),
    }));
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return { error: { message: 'Must be logged in' } };

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select()
      .single();

    if (!error) {
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));
    }

    return { data, error };
  };

  const getUserPosts = async (userId: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  };

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    deletePost,
    likePost,
    repostPost,
    bookmarkPost,
    fetchComments,
    addComment,
    getUserPosts,
  };
}
