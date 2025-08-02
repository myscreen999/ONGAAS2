import React from 'react';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Database } from '../lib/supabase';

export interface Profile {
  id: string;
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
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      try {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const signInWithCarNumber = async (carNumber: string, password: string) => {
    try {
      if (!carNumber || !carNumber.trim()) {
        throw new Error('يرجى إدخال رقم السيارة');
      }
      
      if (!password || password.length < 6) {
        throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      }

      // Check if user exists in database first
      const { data: profileData, error: profileError } = await supabase
        .from('app_users')
        .select('*')
        .eq('car_number', carNumber.trim())
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
        throw new Error('خطأ في التحقق من البيانات');
      }

      if (!profileData) {
        throw new Error('رقم السيارة غير مسجل في النظام');
      }

      // Create email from car number
      const cleanCarNumber = carNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleanCarNumber) {
        throw new Error('رقم السيارة غير صالح');
      }
      
      const email = `${cleanCarNumber}@ongaas.mr`;
      
      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // If user doesn't exist in auth, create them
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('User not found')) {
          
          console.log('Creating auth user for existing profile:', profileData.car_number);
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: undefined,
              data: {
                full_name: profileData.full_name,
                car_number: profileData.car_number
              }
            }
          });
          
          if (signUpError) {
            console.error('Sign up error:', signUpError);
            if (signUpError.message.includes('User already registered')) {
              throw new Error('كلمة المرور غير صحيحة');
            }
            throw new Error('خطأ في إنشاء حساب المصادقة');
          }

          if (signUpData.user) {
            // Update profile with auth user ID
            const { error: updateError } = await supabase
              .from('app_users')
              .update({ id: signUpData.user.id })
              .eq('car_number', carNumber.trim());
              
            if (updateError) {
              console.error('Error updating profile with auth ID:', updateError);
            }

            // Try to sign in again
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password
            });

            if (retryError) {
              console.error('Retry sign in error:', retryError);
              throw new Error('كلمة المرور غير صحيحة');
            }

            return { user: retryData.user, isAdmin: profileData.is_admin || false };
          }
        } else {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('كلمة المرور غير صحيحة');
          } else if (error.message.includes('Too many requests')) {
            throw new Error('محاولات كثيرة جداً، يرجى المحاولة لاحقاً');
          } else {
            throw new Error('خطأ في تسجيل الدخول');
          }
        }
      }

      return { user: data.user, isAdmin: profileData.is_admin || false };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInAdmin = async (email: string, password: string) => {
    try {
      // First try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error('بيانات تسجيل الدخول غير صحيحة');
      }

      // Check if user is admin by email (for demo admin)
      if (email === 'myscreen999@gmail.com') {
        // Find or create admin user
        let { data: profileData } = await supabase
          .from('app_users')
          .select('*')
          .eq('car_number', 'ADMIN001')
          .single();

        if (!profileData) {
          // Create admin user if doesn't exist
          const { data: newProfile } = await supabase
            .from('app_users')
            .insert({
              id: data.user.id,
              full_name: 'مدير النظام',
              car_number: 'ADMIN001',
              phone_number: '+222 34 14 14 97',
              insurance_start_date: new Date().toISOString().split('T')[0],
              insurance_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              is_verified: true,
              is_admin: true
            })
            .select()
            .single();
          profileData = newProfile;
        }

        setProfile(profileData);
        return { user: data.user, isAdmin: true };
      }
      
      // For regular users, check if they exist and are admin
      const { data: profileData } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profileData?.is_admin) {
        await supabase.auth.signOut();
        throw new Error('ليس لديك صلاحيات إدارية');
      }

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
    password: string;
    insuranceStartDate: string;
    insuranceEndDate: string;
    profilePicture?: File | null;
    driversLicense?: File | null;
  }) => {
    try {
      // Validate input data
      if (!userData.fullName || !userData.fullName.trim()) {
        throw new Error('يرجى إدخال الاسم الكامل');
      }
      
      if (!userData.carNumber || !userData.carNumber.trim()) {
        throw new Error('يرجى إدخال رقم السيارة');
      }
      
      if (!userData.phoneNumber || !userData.phoneNumber.trim()) {
        throw new Error('يرجى إدخال رقم الهاتف');
      }
      
      if (!userData.password || userData.password.length < 6) {
        throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      }

      // Check for existing car number
      const { data: existingProfile, error: checkError } = await supabase
        .from('app_users')
        .select('car_number')
        .eq('car_number', userData.carNumber.trim())
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
        throw new Error('خطأ في التحقق من البيانات');
      }

      if (existingProfile) {
        throw new Error('رقم السيارة مستخدم بالفعل');
      }

      // Create auth user with car number as email
      const cleanCarNumber = userData.carNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleanCarNumber) {
        throw new Error('رقم السيارة غير صالح');
      }
      
      const email = `${cleanCarNumber}@ongaas.mr`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: userData.fullName.trim(),
            car_number: userData.carNumber.trim()
          }
        }
      });

      if (error) {
        console.error('Auth signup error:', error);
        if (error.message.includes('User already registered')) {
          throw new Error('هذا الحساب مسجل بالفعل');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        } else {
          throw new Error('خطأ في إنشاء الحساب');
        }
      }

      if (data.user) {
        // Create profile immediately
        const userId = data.user.id;
        
        // Upload files if provided (for demo, we'll use placeholder URLs)
        let profilePictureUrl = null;
        let driversLicenseUrl = null;
        
        if (userData.profilePicture) {
          profilePictureUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName.trim())}&background=3B82F6&color=fff&size=200`;
        }
        
        if (userData.driversLicense) {
          driversLicenseUrl = 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400';
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from('app_users')
          .insert({
            id: userId,
            full_name: userData.fullName.trim(),
            car_number: userData.carNumber.trim(),
            phone_number: userData.phoneNumber.trim(),
            profile_picture_url: profilePictureUrl,
            drivers_license_url: driversLicenseUrl,
            insurance_start_date: userData.insuranceStartDate,
            insurance_end_date: userData.insuranceEndDate,
            is_verified: false,
            is_admin: false
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Try to clean up the auth user if profile creation fails
          try {
            await supabase.auth.admin.deleteUser(userId);
          } catch (cleanupError) {
            console.error('Error cleaning up auth user:', cleanupError);
          }
          throw new Error('فشل في إنشاء الملف الشخصي');
        }

        // Set the profile immediately after creation
        if (profileData) {
          setProfile(profileData);
        }
      }

      return { user: data.user };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear state immediately
      setUser(null);
      setProfile(null);
      
      // Then try to sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // State is already cleared, so this is not critical
    }
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
        throw new Error('خطأ في تحديث الملف الشخصي');
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
        throw new Error('خطأ في جلب المستخدمين');
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
        throw new Error('خطأ في التحقق من المستخدم');
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
        throw new Error('خطأ في جلب الإعلانات');
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
        throw new Error('خطأ في إنشاء الإعلان');
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
        throw new Error('خطأ في تحديث الإعلان');
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
        throw new Error('خطأ في حذف الإعلان');
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
        throw new Error('خطأ في جلب التعليقات');
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
        throw new Error('خطأ في إضافة التعليق');
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
        if (!profile || !profile.id) {
          return [];
        }
        query = query.eq('user_id', profile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error('خطأ في جلب المطالبات');
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  };

  const getUserClaims = async () => {
    if (!profile || !profile.id) return [];

    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('خطأ في جلب مطالبات المستخدم');
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
    accident_photo_1?: File | null;
    accident_photo_2?: File | null;
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
        throw new Error('خطأ في تقديم المطالبة');
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
        throw new Error('خطأ في تحديث المطالبة');
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