import React, { useState, useEffect } from 'react';
import { 
  X, Users, FileText, ClipboardList, UserCheck, Edit, Trash2, Plus, Save, Upload,
  Search, Filter, BarChart3, TrendingUp, Activity, Bell, Settings, Star,
  CheckCircle, AlertCircle, Clock, Eye, Shield, Award, Target
} from 'lucide-react';
import { useAuth, type Post, type Claim } from '../../hooks/useAuth';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'posts' | 'claims' | 'analytics'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
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
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } else if (activeTab === 'posts') {
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } else if (activeTab === 'claims') {
        const allClaims = await getAllClaims();
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white p-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ml-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">لوحة إدارة النظام</h2>
                <p className="text-red-100">إدارة شاملة لجميع عمليات النظام</p>
              </div>
            </div>
          <button
            onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
              <X className="w-8 h-8" />
          </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { id: 'dashboard', label: 'لوحة القيادة', icon: BarChart3 },
              { id: 'users', label: 'المستخدمين', icon: Users, count: users.length },
              { id: 'posts', label: 'الإعلانات', icon: FileText, count: posts.length },
              { id: 'claims', label: 'المطالبات', icon: ClipboardList, count: claims.length },
              { id: 'analytics', label: 'التحليلات', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-red-600 border-red-600 bg-white'
                    : 'text-gray-600 border-transparent hover:text-red-600 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">جارٍ التحميل...</p>
            </div>
          ) : (
            <>
              {/* Dashboard Overview */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">إجمالي المستخدمين</p>
                          <p className="text-3xl font-bold">{users.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">المستخدمين المحققين</p>
                          <p className="text-3xl font-bold">{users.filter(u => u.is_verified).length}</p>
                        </div>
                        <UserCheck className="w-8 h-8 text-green-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">إجمالي المطالبات</p>
                          <p className="text-3xl font-bold">{claims.length}</p>
                        </div>
                        <ClipboardList className="w-8 h-8 text-purple-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">الإعلانات المنشورة</p>
                          <p className="text-3xl font-bold">{posts.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-orange-200" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Activity className="w-6 h-6 ml-2 text-blue-600" />
                        النشاط الأخير
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600 ml-3" />
                          <div>
                            <p className="font-medium">مستخدم جديد انضم</p>
                            <p className="text-sm text-gray-500">منذ ساعتين</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <ClipboardList className="w-5 h-5 text-green-600 ml-3" />
                          <div>
                            <p className="font-medium">مطالبة جديدة تم تقديمها</p>
                            <p className="text-sm text-gray-500">منذ 4 ساعات</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600 ml-3" />
                          <div>
                            <p className="font-medium">إعلان جديد تم نشره</p>
                            <p className="text-sm text-gray-500">منذ يوم واحد</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <TrendingUp className="w-6 h-6 ml-2 text-green-600" />
                        إحصائيات سريعة
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">معدل نجاح المطالبات</span>
                          <span className="font-bold text-green-600">96%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">متوسط وقت المعالجة</span>
                          <span className="font-bold text-blue-600">5 أيام</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">رضا العملاء</span>
                          <span className="font-bold text-purple-600">99%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">المطالبات النشطة</span>
                          <span className="font-bold text-orange-600">{claims.filter(c => c.status !== 'completed').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Management */}
              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold flex items-center">
                      <Users className="w-7 h-7 ml-2 text-blue-600" />
                      إدارة المستخدمين ({users.length})
                    </h3>
                    <div className="flex gap-4">
                      <div className="relative">
                        <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="البحث عن مستخدم..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">جميع المستخدمين</option>
                        <option value="verified">محققين</option>
                        <option value="unverified">غير محققين</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {users
                      .filter(user => {
                        const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            user.car_number.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesFilter = filterStatus === 'all' ||
                                            (filterStatus === 'verified' && user.is_verified) ||
                                            (filterStatus === 'unverified' && !user.is_verified);
                        return matchesSearch && matchesFilter;
                      })
                      .map((user) => (
                      <div key={user.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{user.full_name}</h4>
                            {user.is_verified && (
                                <div className="flex items-center gap-2 mt-1">
                                  <UserCheck className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600 font-medium">محقق</span>
                                </div>
                            )}
                            {!user.is_verified && (
                                <div className="flex items-center gap-2 mt-1">
                                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm text-yellow-600 font-medium">غير محقق</span>
                                </div>
                            )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-gray-700 mb-1">رقم السيارة</p>
                              <p className="font-bold text-gray-900">{user.car_number}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-gray-700 mb-1">الهاتف</p>
                              <p className="font-bold text-gray-900">{user.phone_number}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-gray-700 mb-1">تاريخ التسجيل</p>
                              <p className="font-bold text-gray-900">{new Date(user.created_at).toLocaleDateString('ar-EG')}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-gray-700 mb-1">فترة التأمين</p>
                              <p className="font-bold text-gray-900 text-xs">
                                {new Date(user.insurance_start_date).toLocaleDateString('ar-EG')} - {new Date(user.insurance_end_date).toLocaleDateString('ar-EG')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          {!user.is_verified && (
                            <button
                              onClick={() => handleVerifyUser(user.id)}
                              disabled={actionLoading[`verify-${user.id}`]}
                              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-lg"
                            >
                              {actionLoading[`verify-${user.id}`] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  جارٍ التحقق...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  تحقق من الحساب
                                </>
                              )}
                            </button>
                          )}
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            تعديل
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold flex items-center">
                    <TrendingUp className="w-7 h-7 ml-2 text-purple-600" />
                    التحليلات والإحصائيات
                  </h3>
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-blue-100 text-sm">معدل النمو الشهري</p>
                          <p className="text-4xl font-bold">+23%</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-blue-200" />
                      </div>
                      <p className="text-blue-100 text-sm">مقارنة بالشهر الماضي</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-green-100 text-sm">متوسط وقت الاستجابة</p>
                          <p className="text-4xl font-bold">2.5</p>
                        </div>
                        <Clock className="w-10 h-10 text-green-200" />
                      </div>
                      <p className="text-green-100 text-sm">أيام لكل مطالبة</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-purple-100 text-sm">تقييم الخدمة</p>
                          <p className="text-4xl font-bold">4.9</p>
                        </div>
                        <Star className="w-10 h-10 text-purple-200" />
                      </div>
                      <p className="text-purple-100 text-sm">من 5 نجوم</p>
                    </div>
                  </div>

                  {/* Detailed Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <h4 className="text-xl font-bold mb-4 flex items-center">
                        <BarChart3 className="w-6 h-6 ml-2 text-blue-600" />
                        توزيع المطالبات حسب الحالة
                      </h4>
                      <div className="space-y-4">
                        {[
                          { status: 'مُقدمة', count: claims.filter(c => c.status === 'submitted').length, color: 'bg-blue-500' },
                          { status: 'قيد المراجعة', count: claims.filter(c => c.status === 'under_review').length, color: 'bg-yellow-500' },
                          { status: 'قيد المعالجة', count: claims.filter(c => c.status === 'processing').length, color: 'bg-purple-500' },
                          { status: 'مكتملة', count: claims.filter(c => c.status === 'completed').length, color: 'bg-green-500' }
                        ].map((item) => (
                          <div key={item.status} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-4 h-4 ${item.color} rounded-full ml-3`}></div>
                              <span className="text-gray-700">{item.status}</span>
                            </div>
                            <span className="font-bold text-gray-900">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <h4 className="text-xl font-bold mb-4 flex items-center">
                        <Users className="w-6 h-6 ml-2 text-green-600" />
                        إحصائيات المستخدمين
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-gray-700">إجمالي المستخدمين</span>
                          <span className="font-bold text-blue-600">{users.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-gray-700">المستخدمين المحققين</span>
                          <span className="font-bold text-green-600">{users.filter(u => u.is_verified).length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <span className="text-gray-700">في انتظار التحقق</span>
                          <span className="font-bold text-yellow-600">{users.filter(u => !u.is_verified).length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="text-gray-700">معدل التحقق</span>
                          <span className="font-bold text-purple-600">
                            {users.length > 0 ? Math.round((users.filter(u => u.is_verified).length / users.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h4 className="text-xl font-bold mb-4 flex items-center">
                      <Activity className="w-6 h-6 ml-2 text-red-600" />
                      صحة النظام
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-bold text-green-600">99.9%</p>
                        <p className="text-sm text-gray-600">وقت التشغيل</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-bold text-blue-600">1.2s</p>
                        <p className="text-sm text-gray-600">زمن الاستجابة</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-bold text-purple-600">100%</p>
                        <p className="text-sm text-gray-600">الأمان</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-bold text-orange-600">A+</p>
                        <p className="text-sm text-gray-600">تقييم الأداء</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts Management */}
              {activeTab === 'posts' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold flex items-center">
                      <FileText className="w-7 h-7 ml-2 text-purple-600" />
                      إدارة الإعلانات ({posts.length})
                    </h3>
                    <button
                      onClick={() => {
                        setEditingPost(null);
                        setPostForm({ title: '', content: '', media_url: '' });
                        setShowPostForm(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة إعلان جديد
                    </button>
                  </div>

                  {showPostForm && (
                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-8 mb-8 border border-purple-200">
                      <h4 className="font-bold mb-6 text-xl text-gray-900">
                        {editingPost ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                      </h4>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            عنوان الإعلان *
                          </label>
                          <input
                            type="text"
                            required
                            value={postForm.title}
                            onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="أدخل عنوان الإعلان"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            محتوى الإعلان *
                          </label>
                          <textarea
                            required
                            value={postForm.content}
                            onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="أدخل محتوى الإعلان"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            رابط الصورة (اختياري)
                          </label>
                          <input
                            type="url"
                            value={postForm.media_url}
                            onChange={(e) => setPostForm(prev => ({ ...prev, media_url: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button
                            onClick={editingPost ? handleUpdatePost : handleCreatePost}
                            disabled={actionLoading['create-post'] || actionLoading['update-post']}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-200 shadow-lg"
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
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {posts.length === 0 ? (
                      <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl">
                        <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                        <h4 className="text-2xl font-bold text-gray-900 mb-4">لا توجد إعلانات حالياً</h4>
                        <p className="text-gray-500 text-lg">ابدأ بإضافة إعلان جديد</p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-3 text-lg">{post.title}</h4>
                              <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                              {post.media_url && (
                                <div className="mb-4">
                                  <img src={post.media_url} alt="صورة الإعلان" className="w-40 h-24 object-cover rounded-lg shadow-sm" />
                                </div>
                              )}
                              <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                                تاريخ النشر: {new Date(post.created_at).toLocaleDateString('ar-EG')} | 
                                بواسطة: {post.author_name}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => handleEditPost(post)}
                                className="p-3 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shadow-sm"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                disabled={actionLoading[`delete-${post.id}`]}
                                className="p-3 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                              >
                                {actionLoading[`delete-${post.id}`] ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 className="w-5 h-5" />
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
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <ClipboardList className="w-7 h-7 ml-2 text-orange-600" />
                    إدارة المطالبات ({claims.length})
                  </h3>
                  <div className="space-y-4">
                    {claims.length === 0 ? (
                      <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                        <ClipboardList className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                        <h4 className="text-2xl font-bold text-gray-900 mb-4">لا توجد مطالبات حالياً</h4>
                        <p className="text-gray-500 text-lg">سيتم عرض المطالبات المقدمة هنا</p>
                      </div>
                    ) : (
                      claims.map((claim) => (
                      <div key={claim.id} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="font-bold text-gray-900 text-xl mb-2">{claim.claim_number}</h4>
                            <div className="text-sm text-gray-600 space-y-2 mt-3">
                              <p><strong>المستخدم:</strong> {getUserNameById(claim.user_id)}</p>
                              <p><strong>رقم السيارة:</strong> {claim.car_number}</p>
                              <p><strong>تاريخ الحادث:</strong> {new Date(claim.accident_date).toLocaleDateString('ar-EG')}</p>
                              <p><strong>تاريخ التقديم:</strong> {new Date(claim.created_at).toLocaleDateString('ar-EG')}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                            {getStatusText(claim.status)}
                          </span>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-lg font-bold text-gray-700 mb-3">وصف الحادث:</p>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">{claim.description}</p>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold text-gray-700">تقدم المعالجة</span>
                            <span className="text-lg text-gray-600 font-bold">
                              {claim.progress}%
                              {actionLoading[`claim-${claim.id}`] && (
                                <span className="mr-2">
                                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-1000 ease-out relative"
                              style={{ width: `${claim.progress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={claim.progress}
                            onChange={(e) => handleUpdateClaim(claim.id, parseInt(e.target.value))}
                            disabled={actionLoading[`claim-${claim.id}`]}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <span>مُقدمة (0%)</span>
                            <span>قيد المراجعة (50%)</span>
                            <span>قيد المعالجة (75%)</span>
                            <span>مكتملة (100%)</span>
                          </div>
                        </div>

                        {/* Claim Images */}
                        {(claim.accident_photo_1_url || claim.accident_photo_2_url || claim.insurance_receipt_url || claim.police_report_url) && (
                          <div className="mb-6">
                            <p className="text-lg font-bold text-gray-700 mb-3">المرفقات:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {claim.accident_photo_1_url && (
                                <div className="text-center">
                                  <img src={claim.accident_photo_1_url} alt="صورة الحادث 1" className="w-full h-24 object-cover rounded-lg border shadow-sm" />
                                  <p className="text-sm text-gray-500 mt-2 font-medium">صورة الحادث 1</p>
                                </div>
                              )}
                              {claim.accident_photo_2_url && (
                                <div className="text-center">
                                  <img src={claim.accident_photo_2_url} alt="صورة الحادث 2" className="w-full h-24 object-cover rounded-lg border shadow-sm" />
                                  <p className="text-sm text-gray-500 mt-2 font-medium">صورة الحادث 2</p>
                                </div>
                              )}
                              {claim.insurance_receipt_url && (
                                <div className="text-center">
                                  <img src={claim.insurance_receipt_url} alt="إيصال التأمين" className="w-full h-24 object-cover rounded-lg border shadow-sm" />
                                  <p className="text-sm text-gray-500 mt-2 font-medium">إيصال التأمين</p>
                                </div>
                              )}
                              {claim.police_report_url && (
                                <div className="text-center">
                                  <img src={claim.police_report_url} alt="محضر الشرطة" className="w-full h-24 object-cover rounded-lg border shadow-sm" />
                                  <p className="text-sm text-gray-500 mt-2 font-medium">محضر الشرطة</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      ))
                    )}
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