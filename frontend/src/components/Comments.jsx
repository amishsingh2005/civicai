import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import commentApi from '../api/comments';
import { MessageSquare, Send, User } from 'lucide-react';

const Comment = ({ comment, allComments, onReply, theme }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const replies = allComments.filter(c => c.parent_id === comment.id);

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col gap-3 mt-4 ${isDark ? 'bg-[#151B28]/30 border border-white/5 p-4 rounded-xl' : ''}`}>
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-500/20' : 'bg-slate-200'}`}>
          <User size={16} className={isDark ? 'text-indigo-400' : 'text-slate-500'} />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[var(--text-primary)]'}`}>
               User {comment.user_id.slice(-4)}
            </span>
            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-[var(--text-secondary)]'}`}>
               {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className={`text-[14px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-[var(--text-primary)]'}`}>
            {comment.content}
          </p>
          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-[12px] font-bold text-indigo-500 hover:text-indigo-600 mt-1 self-start"
          >
            Reply
          </button>
          
          {showReplyInput && (
            <div className="mt-2 flex gap-2">
              <input 
                type="text"
                placeholder="Write a reply..."
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-[#0B0F19] border border-white/10 text-white' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]'}`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button 
                onClick={() => {
                  onReply(replyContent, comment.id);
                  setReplyContent('');
                  setShowReplyInput(false);
                }}
                className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className={`ml-8 pl-4 border-l-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          {replies.map(reply => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              allComments={allComments} 
              onReply={onReply} 
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Comments = ({ reportId, theme }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isDark = theme === 'dark';

  const fetchComments = async () => {
    try {
      const data = await commentApi.getComments(reportId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const handlePostComment = async (content, parentId = null) => {
    if (!user) {
      alert("Please sign in to comment");
      return;
    }
    if (!content.trim()) return;

    try {
      await commentApi.createComment({
        report_id: reportId,
        user_id: user.user_id,
        content,
        parent_id: parentId
      });
      fetchComments();
      if (!parentId) setNewComment('');
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className={`mt-10 pt-8 border-t ${isDark ? 'border-white/5' : 'border-[var(--border-color)]'}`}>
      <h3 className={`text-xl font-black mb-8 flex items-center gap-3 ${isDark ? 'text-white' : 'text-[var(--text-primary)]'}`}>
        Comments ({comments.length})
      </h3>

      {/* Nested Comments List */}
      <div className="flex flex-col gap-4 mb-10">
        {loading ? (
          <div className="text-center py-4 text-slate-500 text-sm">Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div className={`text-center py-12 rounded-3xl border border-dashed ${isDark ? 'border-white/10 bg-white/5' : 'bg-slate-50/50 border-slate-200'}`}>
            <p className="text-slate-500 text-sm italic">Be the first to share your thoughts on this issue.</p>
          </div>
        ) : (
          comments.filter(c => !c.parent_id).map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              allComments={comments} 
              onReply={handlePostComment} 
              theme={theme}
            />
          ))
        )}
      </div>

      {/* Main Comment Input at Bottom (Mockup Style) */}
      <div className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${isDark ? 'bg-[#0B0F19] border-white/10 focus-within:border-indigo-500/50' : 'bg-white border-slate-200'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-500/10' : 'bg-slate-100'}`}>
          <User size={20} className={isDark ? 'text-indigo-400' : 'text-slate-400'} />
        </div>
        <input 
          placeholder="Write a comment..."
          className={`flex-1 bg-transparent py-3 text-sm focus:outline-none ${isDark ? 'text-white' : 'text-slate-800'}`}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePostComment(newComment)}
        />
        <button 
          onClick={() => handlePostComment(newComment)}
          className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Comments;
