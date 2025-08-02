import React, { useEffect, useState } from 'react';
import { MessageSquare, Calendar, User } from 'lucide-react';
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
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">إعلانات وأخبار الجمعية</h2>
          <p className="text-lg text-gray-600">آخر الأخبار والإعلانات المهمة من جمعيتنا</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد إعلانات حالياً</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Post Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <User className="w-8 h-8 text-blue-600 bg-blue-100 rounded-full p-1" />
                      <div className="mr-3">
                        <p className="font-semibold text-gray-900">{post.author_name}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 ml-1" />
                          {new Date(post.created_at).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>

                  {/* Media */}
                  {post.media_url && (
                    <div className="mb-4">
                      {post.media_type === 'image' ? (
                        <img
                          src={post.media_url}
                          alt="صورة الإعلان"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : post.media_type === 'video' ? (
                        <video
                          src={post.media_url}
                          controls
                          className="w-full h-64 rounded-lg"
                        />
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className="border-t bg-gray-50">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <MessageSquare className="w-5 h-5 text-gray-600 ml-2" />
                      <h4 className="font-semibold text-gray-900">
                        التعليقات ({comments[post.id]?.length || 0})
                      </h4>
                    </div>

                    {/* Add Comment (only for verified users) */}
                    {user && profile && (
                      <div className="mb-4">
                        <div className="flex gap-3">
                          <textarea
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="اكتب تعليقك هنا..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            {submittingComment[post.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                جارٍ الإرسال...
                              </>
                            ) : (
                              'إرسال'
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="bg-white p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">
                              {comment.author_name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    {!user && (
                      <p className="text-sm text-gray-500 mt-4 text-center">
                        <button 
                          onClick={() => {
                            const event = new CustomEvent('openAuthModal');
                            window.dispatchEvent(event);
                          }}
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          سجل الدخول للتعليق
                        </button>
                      </p>
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