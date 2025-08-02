import React from 'react';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Database } from '../lib/supabase';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  car_number: string;
  phone_number: string;
  profile_picture_url: string | null;
  drivers_license_url: string | null;
  insurance_start_date: string;
  insurance_end_date: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  created_by: string;
  author_name: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string;
}

export interface Claim {
  id: string;
  claim_number: string;
  user_id: string;
  car_number: string;
  accident_date: string;
  description: string;
  accident_photo_1_url: string | null;
  accident_photo_2_url: string | null;
  insurance_receipt_url: string;
  police_report_url: string;
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signInWithCarNumber = async (carNumber: string, password: string) => {
    try {
      // Find profile by car number
      const { data: profileData, error: profileError } = await supabase
        .from('app_users')
        .select('*')
        .eq('car_number', carNumber)
        .single();

      if (profileError || !profileData) {
        throw new Error('رقم السيارة غير موجود');
      }

      // Sign in with email (we'll use car_number@domain.com format)
      const email = `${carNumber.toLowerCase()}@ongaas.mr`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('كلمة المرور غير صحيحة');
        }
        throw new Error(error.message);
      }

      return { user: data.user, isAdmin: profileData.is_admin };
    } catch (error) {
      throw error;
    }
  };

  const signInAdmin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error('بيانات تسجيل الدخول غير صحيحة');
      }

      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user is admin - fetch fresh data
      const { data: profileData } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('Admin profile data:', profileData); // Debug log
      
      if (!profileData?.is_admin) {
        await supabase.auth.signOut();
        throw new Error('ليس لديك صلاحيات إدارية');
      }

      // Update local profile state
      setProfile(profileData);
      
      return { user: data.user, isAdmin: true };
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (userData: {
    fullName: string;
    carNumber: string;
    phoneNumber: string;
    email: string;
    password: string;
    insuranceStartDate: string;
    insuranceEndDate: string;
  }) => {
    try {
      // Check for existing car number
      const { data: existingProfile } = await supabase
        .from('app_users')
        .select('car_number')
        .eq('car_number', userData.carNumber)
        .single();

      if (existingProfile) {
        throw new Error('رقم السيارة مستخدم بالفعل');
      }

      // Create auth user with car number as email
      const email = `${userData.carNumber.toLowerCase()}@ongaas.mr`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            car_number: userData.carNumber
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Create profile - wait a bit to ensure auth user is created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: profileError } = await supabase
          .from('app_users')
          .insert({
            id: data.user.id,
            full_name: userData.fullName,
            car_number: userData.carNumber,
            phone_number: userData.phoneNumber,
            email: email,
            insurance_start_date: userData.insuranceStartDate,
            insurance_end_date: userData.insuranceEndDate,
            is_verified: false,
            is_admin: false
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // If profile creation fails, try to clean up the auth user
          await supabase.auth.admin.deleteUser(data.user.id);
          throw new Error('فشل في إنشاء الملف الشخصي');
        }
      }

      return { user: data.user };
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('app_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProfile(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const verifyUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const getAllPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          app_users!posts_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(post => ({
        ...post,
        author_name: post.app_users?.full_name || 'مستخدم غير معروف'
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  const createPost = async (postData: {
    title: string;
    content: string;
    media_url?: string;
    media_type?: string;
  }) => {
    if (!profile?.is_admin) {
      throw new Error('غير مصرح لك بإنشاء المنشورات');
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: postData.title,
          content: postData.content,
          media_url: postData.media_url || null,
          media_type: postData.media_type || null,
          created_by: profile.id
        })
        .select(`
          *,
          app_users!posts_created_by_fkey(full_name)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        ...data,
        author_name: data.app_users?.full_name || profile.full_name
      };
    } catch (error) {
      throw error;
    }
  };

  const updatePost = async (postId: string, updates: Partial<Post>) => {
    if (!profile?.is_admin) {
      throw new Error('غير مصرح لك بتعديل المنشورات');
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: updates.title,
          content: updates.content,
          media_url: updates.media_url,
          media_type: updates.media_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select(`
          *,
          app_users!posts_created_by_fkey(full_name)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        ...data,
        author_name: data.app_users?.full_name || 'مستخدم غير معروف'
      };
    } catch (error) {
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    if (!profile?.is_admin) {
      throw new Error('غير مصرح لك بحذف المنشورات');
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  const getComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          app_users!comments_user_id_fkey(full_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(comment => ({
        ...comment,
        author_name: comment.app_users?.full_name || 'مستخدم غير معروف'
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!profile) {
      throw new Error('يجب تسجيل الدخول للتعليق');
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: profile.id,
          content: content.trim()
        })
        .select(`
          *,
          app_users!comments_user_id_fkey(full_name)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        ...data,
        author_name: data.app_users?.full_name || profile.full_name
      };
    } catch (error) {
      throw error;
    }
  };

  const getAllClaims = async () => {
    try {
      let query = supabase.from('claims').select('*');
      
      if (!profile?.is_admin) {
        query = query.eq('user_id', profile?.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  };

  const getUserClaims = async () => {
    if (!profile) return [];

    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user claims:', error);
      return [];
    }
  };

  const createClaim = async (claimData: {
    accident_date: string;
    description: string;
    accident_photo_1?: File;
    accident_photo_2?: File;
    insurance_receipt: File;
    police_report: File;
  }) => {
    if (!profile) {
      throw new Error('يجب تسجيل الدخول لتقديم مطالبة');
    }

    if (!profile.is_verified) {
      throw new Error('يجب التحقق من حسابك لتقديم مطالبة');
    }

    try {
      // For demo purposes, we'll use placeholder URLs for file uploads
      const { data, error } = await supabase
        .from('claims')
        .insert({
          user_id: profile.id,
          car_number: profile.car_number,
          accident_date: claimData.accident_date,
          description: claimData.description,
          accident_photo_1_url: claimData.accident_photo_1 ? 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400' : null,
          accident_photo_2_url: claimData.accident_photo_2 ? 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=400' : null,
          insurance_receipt_url: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
          police_report_url: 'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400',
          progress: 0,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateClaim = async (claimId: string, updates: { progress: number; status?: string }) => {
    if (!profile?.is_admin) {
      throw new Error('غير مصرح لك بتحديث المطالبات');
    }

    try {
      let status = updates.status;
      if (!status) {
        if (updates.progress >= 100) status = 'completed';
        else if (updates.progress >= 75) status = 'processing';
        else if (updates.progress >= 50) status = 'under_review';
        else status = 'submitted';
      }

      const { data, error } = await supabase
        .from('claims')
        .update({
          progress: updates.progress,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    signInWithCarNumber,
    signInAdmin,
    signUp,
    signOut,
    updateProfile,
    getAllUsers,
    verifyUser,
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    getComments,
    addComment,
    getAllClaims,
    getUserClaims,
    createClaim,
    updateClaim
  };
};