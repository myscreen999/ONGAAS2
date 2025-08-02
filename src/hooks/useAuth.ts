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

// Mock data store for demo purposes
let mockUsers: Profile[] = [
  {
    id: 'user-1',
    user_id: 'user-1',
    full_name: 'أحمد محمد',
    car_number: '1234ABC',
    phone_number: '+222 12 34 56 78',
    profile_picture_url: null,
    drivers_license_url: null,
    insurance_start_date: '2024-01-01',
    insurance_end_date: '2024-12-31',
    is_verified: true,
    is_admin: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    user_id: 'user-2',
    full_name: 'فاطمة علي',
    car_number: '5678DEF',
    phone_number: '+222 87 65 43 21',
    profile_picture_url: null,
    drivers_license_url: null,
    insurance_start_date: '2024-01-01',
    insurance_end_date: '2024-12-31',
    is_verified: false,
    is_admin: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'admin-1',
    user_id: 'admin-1',
    full_name: 'مدير النظام',
    car_number: 'ADMIN',
    phone_number: '+222 34 14 14 97',
    profile_picture_url: null,
    drivers_license_url: null,
    insurance_start_date: '2025-01-01',
    insurance_end_date: '2025-12-31',
    is_verified: true,
    is_admin: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

// Mock posts data
let mockPosts: Post[] = [
  {
    id: 'post-1',
    title: 'إطلاق النظام الإلكتروني المتطور لمعالجة المطالبات',
    content: 'يسعدنا أن نعلن عن إطلاق النظام الإلكتروني الجديد والمتطور لمعالجة المطالبات التأمينية. هذا النظام يوفر تتبعاً مباشراً لحالة المطالبة، إشعارات فورية، ومعالجة أسرع وأكثر شفافية. يمكن للأعضاء الآن تقديم مطالباتهم إلكترونياً ومتابعة تقدمها خطوة بخطوة.',
    media_url: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800',
    media_type: 'image',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    created_by: 'admin-1',
    author_name: 'مدير النظام'
  },
  {
    id: 'post-2',
    title: 'ورشة توعوية شاملة حول حقوق المؤمنين والتأمين الإجباري',
    content: 'ندعوكم لحضور ورشة توعوية مجانية وشاملة حول حقوق المؤمنين، كيفية التعامل مع شركات التأمين، وأهمية التأمين الإجباري للمركبات. الورشة تتضمن محاضرات من خبراء قانونيين ومختصين في مجال التأمين، مع جلسة أسئلة وأجوبة مفتوحة. الحضور مجاني والمقاعد محدودة.',
    media_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
    media_type: 'image',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    created_by: 'admin-1',
    author_name: 'مدير النظام'
  },
  {
    id: 'post-3',
    title: 'تحديث مهم: زيادة معدل نجاح المطالبات إلى 96%',
    content: 'نفخر بالإعلان عن تحقيق معدل نجاح جديد في معالجة المطالبات وصل إلى 96%، وهو إنجاز يعكس التزامنا بحماية حقوق المؤمنين. هذا الإنجاز تحقق بفضل تطوير أساليب المتابعة والتفاوض مع شركات التأمين، وتدريب فريق العمل على أحدث الممارسات في هذا المجال.',
    media_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    media_type: 'image',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    created_by: 'admin-1',
    author_name: 'مدير النظام'
  }
];

// Mock comments data
let mockComments: Comment[] = [
  {
    id: 'comment-1',
    post_id: 'post-1',
    user_id: 'user-1',
    content: 'شكراً لكم على هذا التطوير الرائع! النظام الجديد سيسهل علينا كثيراً متابعة مطالباتنا. هل يمكن الحصول على دليل استخدام للنظام؟',
    created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    author_name: 'أحمد محمد'
  },
  {
    id: 'comment-2',
    post_id: 'post-2',
    user_id: 'user-2',
    content: 'ورشة ممتازة ومفيدة جداً! هل ستكون هناك ورش أخرى في المستقبل؟ وهل يمكن الحصول على شهادة حضور؟',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    author_name: 'فاطمة علي'
  },
  {
    id: 'comment-3',
    post_id: 'post-1',
    user_id: 'user-2',
    content: 'النظام يبدو متطوراً جداً. هل سيكون متاحاً على الهواتف الذكية أيضاً؟',
    created_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    author_name: 'فاطمة علي'
  },
  {
    id: 'comment-4',
    post_id: 'post-3',
    user_id: 'user-1',
    content: 'إنجاز رائع! هذا يعكس مدى جدية الجمعية في خدمة المجتمع. بارك الله فيكم.',
    created_at: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
    author_name: 'أحمد محمد'
  }
];

// Mock claims data
let mockClaims: Claim[] = [
  {
    id: 'claim-1',
    claim_number: 'CLM-2025-001',
    user_id: 'user-1',
    car_number: '1234ABC',
    accident_date: '2025-01-15',
    description: 'حادث مروري بسيط في شارع الاستقلال أمام البنك المركزي. تلف في المصد الأمامي والمصباح الأيمن.',
    accident_photo_1_url: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400',
    accident_photo_2_url: 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=400',
    insurance_receipt_url: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
    police_report_url: 'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400',
    progress: 75,
    status: 'processing',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: 'claim-2',
    claim_number: 'CLM-2025-002',
    user_id: 'user-2',
    car_number: '5678DEF',
    accident_date: '2025-01-18',
    description: 'تلف في الباب الخلفي نتيجة حادث في موقف السيارات. خدوش عميقة وانبعاج في الباب.',
    accident_photo_1_url: 'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=400',
    accident_photo_2_url: null,
    insurance_receipt_url: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
    police_report_url: 'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400',
    progress: 25,
    status: 'under_review',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('currentUser');
    const savedProfile = localStorage.getItem('currentProfile');
    
    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser));
      setProfile(JSON.parse(savedProfile));
    }
    
    setLoading(false);
  }, []);

  const signInWithCarNumber = async (carNumber: string, password: string) => {
    try {
      const profileData = mockUsers.find(user => user.car_number === carNumber);
      
      if (!profileData) {
        throw new Error('رقم السيارة غير موجود');
      }

      // Simple password check
      if (password !== 'user123') {
        throw new Error('كلمة المرور غير صحيحة');
      }

      // Create user session
      const user = { 
        id: profileData.user_id,
        email: `${carNumber}@example.com`,
        user_metadata: { role: profileData.is_admin ? 'admin' : 'user' }
      } as User;
      
      setUser(user);
      setProfile(profileData);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentProfile', JSON.stringify(profileData));
      
      return { user, isAdmin: profileData.is_admin };
    } catch (error) {
      throw error;
    }
  };

  const signInAdmin = async (email: string, password: string) => {
    // Check admin credentials
    if (email !== 'myscreen999@gmail.com' || password !== 'myscreen999') {
      throw new Error('بيانات تسجيل الدخول غير صحيحة');
    }

    const adminProfile = mockUsers.find(user => user.is_admin);
    if (!adminProfile) {
      throw new Error('حساب الإدارة غير موجود');
    }

    // Create admin user session
    const adminUser = {
      id: adminProfile.user_id,
      email: 'myscreen999@gmail.com',
      user_metadata: { role: 'admin' }
    } as User;

    setUser(adminUser);
    setProfile(adminProfile);
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    localStorage.setItem('currentProfile', JSON.stringify(adminProfile));

    return { user: adminUser, isAdmin: true };
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
      const existingUser = mockUsers.find(user => user.car_number === userData.carNumber);
      if (existingUser) {
        throw new Error('رقم السيارة مستخدم بالفعل');
      }

      // Create new user profile
      const newUserId = `user-${Date.now()}`;
      const newProfile: Profile = {
        id: newUserId,
        user_id: newUserId,
        full_name: userData.fullName,
        car_number: userData.carNumber,
        phone_number: userData.phoneNumber,
        profile_picture_url: null,
        drivers_license_url: null,
        insurance_start_date: userData.insuranceStartDate,
        insurance_end_date: userData.insuranceEndDate,
        is_verified: false,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to mock users array
      mockUsers.push(newProfile);

      // Auto-login the new user
      const user = { 
        id: newUserId,
        email: userData.email,
        user_metadata: { role: 'user' }
      } as User;
      
      setUser(user);
      setProfile(newProfile);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentProfile', JSON.stringify(newProfile));

      return { user };
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentProfile');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
    
    // Update in mock data
    const index = mockUsers.findIndex(user => user.id === profile.id);
    if (index !== -1) {
      mockUsers[index] = updatedProfile;
    }
    
    setProfile(updatedProfile);
    localStorage.setItem('currentProfile', JSON.stringify(updatedProfile));
    
    return updatedProfile;
  };

  const getAllUsers = () => {
    return mockUsers.filter(user => !user.is_admin);
  };

  const verifyUser = async (userId: string) => {
    const index = mockUsers.findIndex(user => user.id === userId);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], is_verified: true, updated_at: new Date().toISOString() };
      return mockUsers[index];
    }
    throw new Error('المستخدم غير موجود');
  };

  const getAllPosts = () => {
    return mockPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: postData.title,
      content: postData.content,
      media_url: postData.media_url || null,
      media_type: postData.media_type || null,
      created_at: new Date().toISOString(),
      created_by: profile.id,
      author_name: profile.full_name
    };

    mockPosts.unshift(newPost);
    return newPost;
  };

  const updatePost = async (postId: string, updates: Partial<Post>) => {
    if (!profile?.is_admin) {
      throw new Error('غير مصرح لك بتعديل المنشورات');
    }

    const index = mockPosts.findIndex(post => post.id === postId);
    if (index === -1) {
      throw new Error('المنشور غير موجود');
    }

    mockPosts[index] = { ...mockPosts[index], ...updates };
    return mockPosts[index];
  };

  const deletePost = async (postId: string) => {
    if (!profile?.is_admin) {
      throw new Error('غير مصرح لك بحذف المنشورات');
    }

    const index = mockPosts.findIndex(post => post.id === postId);
    if (index === -1) {
      throw new Error('المنشور غير موجود');
    }

    // Remove associated comments
    mockComments = mockComments.filter(comment => comment.post_id !== postId);
    
    mockPosts.splice(index, 1);
    return true;
  };

  const getComments = (postId: string) => {
    return mockComments
      .filter(comment => comment.post_id === postId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const addComment = async (postId: string, content: string) => {
    if (!profile) {
      throw new Error('يجب تسجيل الدخول للتعليق');
    }

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      post_id: postId,
      user_id: profile.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      author_name: profile.full_name
    };

    mockComments.push(newComment);
    return newComment;
  };

  const getAllClaims = () => {
    if (!profile?.is_admin) {
      return mockClaims.filter(claim => claim.user_id === profile?.id);
    }
    return mockClaims.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const getUserClaims = () => {
    if (!profile) return [];
    return mockClaims
      .filter(claim => claim.user_id === profile.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      claim_number: `CLM-2025-${String(mockClaims.length + 1).padStart(3, '0')}`,
      user_id: profile.id,
      car_number: profile.car_number,
      accident_date: claimData.accident_date,
      description: claimData.description,
      accident_photo_1_url: claimData.accident_photo_1 ? 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400' : null,
      accident_photo_2_url: claimData.accident_photo_2 ? 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=400' : null,
      insurance_receipt_url: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
      police_report_url: 'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400',
      progress: 0,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockClaims.push(newClaim);
    return newClaim;
  };

  const updateClaim = async (claimId: string, updates: { progress: number; status?: string }) => {
    if (!profile?.is_admin) {
      throw new Error('غير مصرح لك بتحديث المطالبات');
    }

    const index = mockClaims.findIndex(claim => claim.id === claimId);
    if (index === -1) {
      throw new Error('المطالبة غير موجودة');
    }

    let status = updates.status || mockClaims[index].status;
    if (updates.progress >= 100) status = 'completed';
    else if (updates.progress >= 75) status = 'processing';
    else if (updates.progress >= 50) status = 'under_review';
    else status = 'submitted';

    mockClaims[index] = {
      ...mockClaims[index],
      progress: updates.progress,
      status,
      updated_at: new Date().toISOString()
    };

    return mockClaims[index];
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