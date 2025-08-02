import React, { useEffect, useState } from 'react';
import { MessageSquare, Calendar, User, Heart, Share2, Eye, ThumbsUp, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { Post, Comment } from '../../hooks/useAuth';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  const { user, profile, getAllPosts, getComments, addComment } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsData = getAllPosts();
      setPosts(postsData);
      
      // Load comments for each post
      const commentsData: Record<string, Comment[]> = {};
      postsData.forEach(post => {
        commentsData[post.id] = getComments(post.id);
      });
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !profile || !newComment[postId]?.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const newCommentData = await addComment(postId, newComment[postId]);
      
      // Update comments state immediately
      setComments(prev => ({
        ...prev,
        [postId]: [newCommentData, ...(prev[postId] || [])]
      }));

      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('حدث خطأ في إضافة التعليق');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جارٍ تحميل الإعلانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            آخر الأخبار
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">إعلانات وأخبار الجمعية</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">آخر الأخبار والإعلانات المهمة من جمعيتنا مع إمكانية التفاعل والتعليق</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="card-modern p-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500">لا توجد إعلانات حالياً</p>
              <p className="text-gray-400 mt-2">سيتم نشر الإعلانات الجديدة قريباً</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post, index) => (
              <article key={post.id} className="card-modern overflow-hidden animate-slide-up" style={{animationDelay: `${index * 0.2}s`}}>
                {/* Post Header */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="mr-4">
                        <p className="font-bold text-gray-900 text-lg">{post.author_name}</p>
                        <div className="flex items-center text-sm text-gray-500 gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.created_at).toLocaleDateString('ar-EG')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(post.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        إعلان رسمي
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h3>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">{post.content}</p>

                  {/* Media */}
                  {post.media_url && (
                    <div className="mb-6">
                      {post.media_type === 'image' ? (
                        <img
                          src={post.media_url}
                          alt="صورة الإعلان"
                          className="w-full h-80 object-cover rounded-xl shadow-lg"
                        />
                      ) : post.media_type === 'video' ? (
                        <video
                          src={post.media_url}
                          controls
                          className="w-full h-80 rounded-xl shadow-lg"
                        />
                      ) : null}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-medium">إعجاب</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="font-medium">مشاركة</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 500) + 100} مشاهدة</span>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 w-8 h-8 rounded-full flex items-center justify-center ml-3">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        التعليقات ({comments[post.id]?.length || 0})
                      </h4>
                    </div>

                    {/* Add Comment (only for verified users) */}
                    {user && profile && (
                      <div className="mb-6">
                        <div className="flex gap-4">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <textarea
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="اكتب تعليقك هنا..."
                            className="flex-1 form-textarea-modern resize-none"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {submittingComment[post.id] ? (
                              <>
                                <div className="spinner-modern h-4 w-4"></div>
                                جارٍ الإرسال...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4" />
                              'إرسال'
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="card-glass p-6">
                          <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-br from-gray-400 to-gray-500 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-gray-900">
                                  {comment.author_name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(comment.created_at).toLocaleDateString('ar-EG')}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors text-sm">
                                  <ThumbsUp className="w-4 h-4" />
                                  إعجاب
                                </button>
                                <button className="text-gray-500 hover:text-blue-600 transition-colors text-sm">
                                  رد
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!user && (
                      <div className="text-center mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                        <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-blue-800 font-medium mb-2">
                          انضم للمحادثة
                        </p>
                        <p className="text-sm text-blue-600">
                        <button 
                          onClick={() => {
                            const event = new CustomEvent('openAuthModal');
                            window.dispatchEvent(event);
                          }}
                          className="btn-primary"
                        >
                          سجل الدخول للتعليق
                        </button>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Posts;