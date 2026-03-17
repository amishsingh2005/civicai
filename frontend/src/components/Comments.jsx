import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import commentApi from '../api/comments';
import { MessageSquare, Send, CornerDownRight, User } from 'lucide-react';

const Comment = ({ comment, allComments, onReply }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const replies = allComments.filter(c => c.parent_id === comment.id);

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
          <User size={16} className="text-slate-500" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--text-primary)]">User {comment.user_id.slice(-4)}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">{new Date(comment.created_at).toLocaleString()}</span>
          </div>
          <p className="text-[14px] text-[var(--text-primary)] leading-relaxed">
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
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
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
        <div className="ml-8 border-l-2 border-slate-100 pl-4">
          {replies.map(reply => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              allComments={allComments} 
              onReply={onReply} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Comments = ({ reportId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
    <div className="mt-10 pt-8 border-t border-[var(--border-color)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <MessageSquare size={20} className="text-indigo-500" />
        Discussion ({comments.length})
      </h3>

      {/* Main Comment Input */}
      <div className="mb-8 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
          <User size={20} className="text-slate-500" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <textarea 
            placeholder="What are your thoughts?"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 min-h-[100px] resize-none"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            onClick={() => handlePostComment(newComment)}
            className="self-end px-6 py-2 bg-indigo-500 text-white rounded-full font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            Post Comment
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Nested Comments List */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="text-center py-4 text-slate-400 text-sm">Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm italic">Be the first to share your thoughts on this issue.</p>
          </div>
        ) : (
          comments.filter(c => !c.parent_id).map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              allComments={comments} 
              onReply={handlePostComment} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
