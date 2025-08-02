import React, { useState, useEffect } from 'react';
import { X, Users, FileText, ClipboardList, UserCheck, Edit, Trash2, Plus, Save, Upload } from 'lucide-react';
import { useAuth, type Post, type Claim } from '../../hooks/useAuth';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'claims'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  
  // Post form state
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    media_url: ''
  });

  const { 
    getAllUsers, 
    verifyUser, 
    getAllPosts, 
    createPost, 
    updatePost, 
    deletePost,
    getAllClaims,
    updateClaim
  } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const allUsers = getAllUsers();
        setUsers(allUsers);
      } else if (activeTab === 'posts') {
        const allPosts = getAllPosts();
        setPosts(allPosts);
      } else if (activeTab === 'claims') {
        const allClaims = getAllClaims();
        setClaims(allClaims);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    setActionLoading(prev => ({ ...prev, [`verify-${userId}`]: true }));
    try {
      await verifyUser(userId);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_verified: true } : user
      ));
      alert('تم التحقق من المستخدم بنجاح');
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('حدث خطأ في التحقق من المستخدم');
    } finally {
      setActionLoading(prev => ({ ...prev, [`verify-${userId}`]: false }));
    }
  };

  const handleCreatePost = async () => {
    setActionLoading(prev => ({ ...prev, 'create-post': true }));
    try {
      if (!postForm.title.trim() || !postForm.content.trim()) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      const newPost = await createPost({
        title: postForm.title,
        content: postForm.content,
        media_url: postForm.media_url,
        media_type: postForm.media_url ? 'image' : undefined
      });
      
      setPosts(prev => [newPost, ...prev]);
      setPostForm({ title: '', content: '', media_url: '' });
      setShowPostForm(false);
      alert('تم إنشاء الإعلان بنجاح');
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في إنشاء الإعلان');
    } finally {
      setActionLoading(prev => ({ ...prev, 'create-post': false }));
    }
  };

  const handleUpdatePost = async () => {
    setActionLoading(prev => ({ ...prev, 'update-post': true }));
    try {
      if (!editingPost || !postForm.title.trim() || !postForm.content.trim()) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      const updatedPost = await updatePost(editingPost.id, {
        title: postForm.title,
        content: postForm.content,
        media_url: postForm.media_url || null,
        media_type: postForm.media_url ? 'image' : null
      });

      setPosts(prev => prev.map(post => 
        post.id === editingPost.id ? updatedPost : post
      ));

      setEditingPost(null);
      setPostForm({ title: '', content: '', media_url: '' });
      setShowPostForm(false);
      alert('تم تحديث الإعلان بنجاح');
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في تحديث الإعلان');
    } finally {
      setActionLoading(prev => ({ ...prev, 'update-post': false }));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    setActionLoading(prev => ({ ...prev, [`delete-${postId}`]: true }));
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      alert('تم حذف الإعلان بنجاح');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في حذف الإعلان');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${postId}`]: false }));
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      media_url: post.media_url || ''
    });
    setShowPostForm(true);
  };

  const handleUpdateClaim = async (claimId: string, progress: number) => {
    setActionLoading(prev => ({ ...prev, [`claim-${claimId}`]: true }));
    try {
      const updatedClaim = await updateClaim(claimId, { progress });
      setClaims(prev => prev.map(claim => 
        claim.id === claimId ? updatedClaim : claim
      ));
    } catch (error) {
      console.error('Error updating claim:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في تحديث المطالبة');
    } finally {
      setActionLoading(prev => ({ ...prev, [`claim-${claimId}`]: false }));
    }
  };

  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || 'مستخدم غير معروف';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'submitted': 'مُقدمة',
      'under_review': 'قيد المراجعة',
      'processing': 'قيد المعالجة',
      'completed': 'مكتملة',
      'rejected': 'مرفوضة'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'submitted': 'text-blue-600 bg-blue-100',
      'under_review': 'text-yellow-600 bg-yellow-100',
      'processing': 'text-purple-600 bg-purple-100',
      'completed': 'text-green-600 bg-green-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-blue-600 text-white">
          <h2 className="text-2xl font-bold">لوحة إدارة النظام</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Users className="w-5 h-5 inline ml-2" />
            إدارة المستخدمين ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'posts' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <FileText className="w-5 h-5 inline ml-2" />
            إدارة الإعلانات ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'claims' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <ClipboardList className="w-5 h-5 inline ml-2" />
            إدارة المطالبات ({claims.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جارٍ التحميل...</p>
            </div>
          ) : (
            <>
              {/* Users Management */}
              {activeTab === 'users' && (
                <div>
                  <h3 className="text-xl font-bold mb-6">إدارة المستخدمين</h3>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{user.full_name}</h4>
                            {user.is_verified && (
                              <UserCheck className="w-5 h-5 text-green-500" />
                            )}
                            {!user.is_verified && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                غير محقق
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>رقم السيارة:</strong> {user.car_number}</p>
                            <p><strong>الهاتف:</strong> {user.phone_number}</p>
                            <p><strong>تاريخ التسجيل:</strong> {new Date(user.created_at).toLocaleDateString('ar-EG')}</p>
                            <p><strong>فترة التأمين:</strong> {new Date(user.insurance_start_date).toLocaleDateString('ar-EG')} - {new Date(user.insurance_end_date).toLocaleDateString('ar-EG')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!user.is_verified && (
                            <button
                              onClick={() => handleVerifyUser(user.id)}
                              disabled={actionLoading[`verify-${user.id}`]}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                              {actionLoading[`verify-${user.id}`] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  جارٍ التحقق...
                                </>
                              ) : (
                                'تحقق من الحساب'
                              )}
                            </button>
                          )}
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Management */}
              {activeTab === 'posts' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">إدارة الإعلانات</h3>
                    <button
                      onClick={() => {
                        setEditingPost(null);
                        setPostForm({ title: '', content: '', media_url: '' });
                        setShowPostForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة إعلان جديد
                    </button>
                  </div>

                  {showPostForm && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h4 className="font-semibold mb-4">
                        {editingPost ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            عنوان الإعلان *
                          </label>
                          <input
                            type="text"
                            required
                            value={postForm.title}
                            onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="أدخل عنوان الإعلان"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            محتوى الإعلان *
                          </label>
                          <textarea
                            required
                            value={postForm.content}
                            onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="أدخل محتوى الإعلان"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            رابط الصورة (اختياري)
                          </label>
                          <input
                            type="url"
                            value={postForm.media_url}
                            onChange={(e) => setPostForm(prev => ({ ...prev, media_url: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={editingPost ? handleUpdatePost : handleCreatePost}
                            disabled={actionLoading['create-post'] || actionLoading['update-post']}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            {(actionLoading['create-post'] || actionLoading['update-post']) ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {editingPost ? 'جارٍ التحديث...' : 'جارٍ الحفظ...'}
                              </>
                            ) : (
                              editingPost ? 'تحديث الإعلان' : 'حفظ الإعلان'
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowPostForm(false);
                              setEditingPost(null);
                              setPostForm({ title: '', content: '', media_url: '' });
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {posts.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">لا توجد إعلانات حالياً</p>
                    ) : (
                      posts.map((post) => (
                        <div key={post.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                              <p className="text-gray-700 mb-2">{post.content}</p>
                              {post.media_url && (
                                <div className="mb-2">
                                  <img src={post.media_url} alt="صورة الإعلان" className="w-32 h-20 object-cover rounded" />
                                </div>
                              )}
                              <p className="text-sm text-gray-500">
                                تاريخ النشر: {new Date(post.created_at).toLocaleDateString('ar-EG')} | 
                                بواسطة: {post.author_name}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditPost(post)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                disabled={actionLoading[`delete-${post.id}`]}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                              >
                                {actionLoading[`delete-${post.id}`] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Claims Management */}
              {activeTab === 'claims' && (
                <div>
                  <h3 className="text-xl font-bold mb-6">إدارة المطالبات</h3>
                  <div className="space-y-4">
                    {claims.map((claim) => (
                      <div key={claim.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{claim.claim_number}</h4>
                            <div className="text-sm text-gray-600 space-y-1 mt-2">
                              <p><strong>المستخدم:</strong> {getUserNameById(claim.user_id)}</p>
                              <p><strong>رقم السيارة:</strong> {claim.car_number}</p>
                              <p><strong>تاريخ الحادث:</strong> {new Date(claim.accident_date).toLocaleDateString('ar-EG')}</p>
                              <p><strong>تاريخ التقديم:</strong> {new Date(claim.created_at).toLocaleDateString('ar-EG')}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                            {getStatusText(claim.status)}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">وصف الحادث:</p>
                          <p className="text-gray-700 bg-white p-3 rounded border">{claim.description}</p>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">تقدم المعالجة</span>
                            <span className="text-sm text-gray-600 font-semibold">
                              {claim.progress}%
                              {actionLoading[`claim-${claim.id}`] && (
                                <span className="ml-2">
                                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${claim.progress}%` }}
                            ></div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={claim.progress}
                            onChange={(e) => handleUpdateClaim(claim.id, parseInt(e.target.value))}
                            disabled={actionLoading[`claim-${claim.id}`]}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>مُقدمة (0%)</span>
                            <span>قيد المراجعة (50%)</span>
                            <span>قيد المعالجة (75%)</span>
                            <span>مكتملة (100%)</span>
                          </div>
                        </div>

                        {/* Claim Images */}
                        {(claim.accident_photo_1_url || claim.accident_photo_2_url || claim.insurance_receipt_url || claim.police_report_url) && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">المرفقات:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {claim.accident_photo_1_url && (
                                <div className="text-center">
                                  <img src={claim.accident_photo_1_url} alt="صورة الحادث 1" className="w-full h-20 object-cover rounded border" />
                                  <p className="text-xs text-gray-500 mt-1">صورة الحادث 1</p>
                                </div>
                              )}
                              {claim.accident_photo_2_url && (
                                <div className="text-center">
                                  <img src={claim.accident_photo_2_url} alt="صورة الحادث 2" className="w-full h-20 object-cover rounded border" />
                                  <p className="text-xs text-gray-500 mt-1">صورة الحادث 2</p>
                                </div>
                              )}
                              {claim.insurance_receipt_url && (
                                <div className="text-center">
                                  <img src={claim.insurance_receipt_url} alt="إيصال التأمين" className="w-full h-20 object-cover rounded border" />
                                  <p className="text-xs text-gray-500 mt-1">إيصال التأمين</p>
                                </div>
                              )}
                              {claim.police_report_url && (
                                <div className="text-center">
                                  <img src={claim.police_report_url} alt="محضر الشرطة" className="w-full h-20 object-cover rounded border" />
                                  <p className="text-xs text-gray-500 mt-1">محضر الشرطة</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;