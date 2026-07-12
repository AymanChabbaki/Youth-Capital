import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button, Input, Textarea } from "@/components/ui-custom";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  useGetForums, 
  useGetForumPosts, 
  useCreatePost, 
  useDeletePost,
  customFetch
} from "@workspace/api-client-react";
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Plus, 
  Heart, 
  Trash2, 
  CornerDownRight, 
  Send,
  Hash,
  Filter,
  ArrowLeft,
  Search
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Redirect, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface APIPost {
  id: number;
  forumId: number;
  parentId: number | null;
  authorId: number;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Post extends APIPost {
  author: {
    id: number;
    fullName: string;
    fullNameAr?: string;
    simulationRole?: string;
    avatarUrl?: string;
  };
  replyCount: number;
  likesCount: number;
  isLiked: boolean;
}

export default function Community() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, isAr } = useLanguage();
  const { toast } = useToast();
  const [location] = useLocation();
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forumParam = params.get("forum");
    if (forumParam) {
      const parsedId = parseInt(forumParam);
      if (!isNaN(parsedId)) {
        setSelectedForumId(parsedId);
      }
    }
  }, [location]);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  const { data: forumsData } = useGetForums({ query: { enabled: !authLoading && isAuthenticated } } as any);
  const { data: postsData, refetch: refetchPosts, isLoading: isLoadingPosts } = useGetForumPosts(
    selectedForumId || 0, 
    { search: searchQuery, sort: sortBy } as any, 
    { query: { enabled: !!selectedForumId } as any }
  );
  
  const [replies, setReplies] = useState<Record<number, Post[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<number, boolean>>({});

  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();

  const fetchReplies = async (postId: number) => {
    setLoadingReplies(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await customFetch<{ posts: Post[] }>(`/api/community/posts/${postId}/replies`);
      setReplies(prev => ({ ...prev, [postId]: res.posts }));
    } catch (error) {
      console.error("Failed to fetch replies", error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleLike = async (post: Post, isReply = false, parentId?: number) => {
    const endpoint = `/api/community/posts/${post.id}/like`;
    const method = post.isLiked ? "DELETE" : "POST";
    
    try {
      await customFetch(endpoint, { method });
      if (isReply && parentId) {
        fetchReplies(parentId);
      } else {
        refetchPosts();
      }
    } catch (error) {
      toast({ title: t("Error", "خطأ"), variant: "destructive" });
    }
  };

  const handlePostSubmit = async () => {
    if (!selectedForumId || !newPostContent) return;
    try {
      await createPostMutation.mutateAsync({
        forumId: selectedForumId,
        data: { title: newPostTitle, content: newPostContent }
      });
      setIsComposing(false);
      setNewPostTitle("");
      setNewPostContent("");
      refetchPosts();
      toast({ title: t("Motion Published", "تم نشر المقترح") });
    } catch (error) {
      toast({ title: t("Error", "خطأ"), variant: "destructive" });
    }
  };

  const handleReplySubmit = async (postId: number) => {
    if (!replyContent[postId]) return;
    try {
      await customFetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        body: JSON.stringify({ content: replyContent[postId] })
      });
      setReplyContent(prev => ({ ...prev, [postId]: "" }));
      fetchReplies(postId);
      refetchPosts(); // To update reply count on main post
      toast({ title: t("Reply Sent", "تم إرسال الرد") });
    } catch (error) {
      toast({ title: t("Error", "خطأ"), variant: "destructive" });
    }
  };

  const handleDelete = async (postId: number, isReply = false, parentId?: number) => {
    try {
      await deletePostMutation.mutateAsync({ id: postId });
      if (isReply && parentId) {
        fetchReplies(parentId);
      } else {
        refetchPosts();
      }
      toast({ title: t("Deleted", "تم الحذف") });
    } catch (error) {
      toast({ title: t("Error", "خطأ"), variant: "destructive" });
    }
  };

  if (authLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;

  const forums = forumsData?.forums || [];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-sans">
      {/* Sidebar - Chambers of Debate */}
      <aside className="w-full lg:w-85 bg-card border-e border-border/50 p-6 lg:h-screen lg:sticky lg:top-0 overflow-y-auto shrink-0 z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black text-foreground tracking-tight">{t("Civic Pulse", "النبض المدني")}</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{t("Community Chambers", "غرف المجتمع")}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {forums.map(forum => (
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              key={forum.id}
              onClick={() => { setSelectedForumId(forum.id); setIsComposing(false); setActivePostId(null); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                selectedForumId === forum.id 
                  ? "bg-navy-dark text-white shadow-xl shadow-navy/20 ring-1 ring-gold/40" 
                  : "hover:bg-secondary/40 text-muted-foreground"
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                selectedForumId === forum.id ? "bg-white/20 text-white" : "bg-secondary/60 text-muted-foreground group-hover:bg-card"
              }`}>
                <Hash className="w-4 h-4" />
              </div>
              <div className="flex-1 text-start">
                <div className="font-bold text-sm leading-tight">{isAr ? forum.nameAr : forum.name}</div>
                <div className={`text-[10px] uppercase font-bold tracking-tighter mt-0.5 opacity-70 ${
                  selectedForumId === forum.id ? "text-gold" : "text-muted-foreground"
                }`}>
                  {forum.postCount} {t("Motions", "مقترحات")}
                </div>
              </div>
              {selectedForumId === forum.id && (
                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-3xl bg-navy-dark text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 blur-3xl -mr-16 -mt-16 group-hover:bg-gold/30 transition-colors" />
           <p className="text-xs font-bold text-gold mb-2 uppercase tracking-widest">{t("Guidelines", "الإرشادات")}</p>
           <p className="text-sm text-white/70 mb-4 leading-relaxed font-medium">
             {t("Respect the constitutional framework in all debates.", "احترم الإطار الدستوري في جميع النقاشات.")}
           </p>
           <Link href="/rules">
             <Button variant="outline" className="w-full text-xs font-bold border-white/20 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl border-dashed">
               {t("View Rules", "عرض القواعد")}
             </Button>
           </Link>
        </div>
      </aside>

      {/* Main Discourse Feed */}
      <main className="flex-1 lg:max-w-4xl p-4 md:p-10 lg:p-12 mx-auto w-full">
        {!selectedForumId ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[80vh] flex flex-col items-center justify-center text-center px-6"
          >
            <div className="w-24 h-24 bg-card rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-gold/10 rounded-[2.5rem] animate-ping opacity-50" />
                <MessageSquare className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-3xl font-display font-black text-foreground mb-4">{t("Enter a Debate Chamber", "ادخل غرفة النقاش")}</h2>
            <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
              {t("Select a forum from the sidebar to represent your constituency and engage in the legislative simulation.", "اختر منتدى من القائمة الجانبية لتمثيل دائرتك الانتخابية والمشاركة في محاكاة العمل التشريعي.")}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-display font-black text-foreground mb-2">
                    {isAr ? forums.find(f => f.id === selectedForumId)?.nameAr : forums.find(f => f.id === selectedForumId)?.name}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                     <span className="flex items-center gap-1.5">
                       <Users className="w-4 h-4" />
                       {t("Simulation Members", "أعضاء المحاكاة")}
                     </span>
                     <span className="w-1 h-1 bg-border rounded-full" />
                     <span className="px-2 py-0.5 bg-secondary/50 rounded text-[10px] uppercase font-bold tracking-wider">
                       {forums.find(f => f.id === selectedForumId)?.category}
                     </span>
                  </div>
                </div>
                
                <div className="flex flex-1 items-center gap-3">
                   <div className="relative flex-1 max-w-sm">
                     <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <Input 
                       placeholder={t("Search motions...", "بحث في المقترحات...")}
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="ps-11 h-12 bg-card border-border/50 rounded-2xl shadow-sm focus-visible:ring-gold/30"
                     />
                   </div>
                   
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 border-border/50 bg-card shrink-0">
                          <Filter className="w-5 h-5 text-muted-foreground" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-border/50 shadow-xl">
                       <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground font-black px-3 py-2">
                         {t("Sort By", "ترتيب حسب")}
                       </DropdownMenuLabel>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem 
                         onClick={() => setSortBy("newest")}
                         className={`rounded-xl py-3 px-4 font-bold flex items-center justify-between cursor-pointer ${sortBy === 'newest' ? 'bg-gold/10 text-gold' : ''}`}
                       >
                         {t("Newest Motions", "أحدث المقترحات")}
                         {sortBy === 'newest' && <div className="w-1.5 h-1.5 bg-gold rounded-full" />}
                       </DropdownMenuItem>
                       <DropdownMenuItem 
                         onClick={() => setSortBy("popular")}
                         className={`rounded-xl py-3 px-4 font-bold flex items-center justify-between cursor-pointer ${sortBy === 'popular' ? 'bg-gold/10 text-gold' : ''}`}
                       >
                         {t("Most Supported", "الأكثر تأييداً")}
                         {sortBy === 'popular' && <div className="w-1.5 h-1.5 bg-gold rounded-full" />}
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>

                   <Button
                      variant="gold"
                      onClick={() => setIsComposing(!isComposing)}
                      className="gap-3 h-12 px-6 rounded-2xl shadow-xl shadow-gold/20 text-[15px] font-bold shrink-0"
                    >
                      {isComposing ? t("Cancel", "إلغاء") : <><Plus className="w-5 h-5"/> {t("New Motion", "موضوع جديد")}</>}
                   </Button>
                </div>
              </div>

            <AnimatePresence>
              {isComposing && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="p-8 border-gold/25 shadow-2xl shadow-gold/5 relative">
                    <div className="absolute top-4 right-4 text-[10px] uppercase font-bold text-gold tracking-widest">{t("DRAFTING PHASE", "مرحلة الصياغة")}</div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Send className="w-5 h-5 text-gold" />
                      {t("Propose a New Motion", "اقتراح موضوع جديد")}
                    </h3>
                    <div className="space-y-5">
                      <Input 
                        placeholder={t("Subject line...", "موضوع النقاش...")} 
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="bg-secondary/30 border-none h-14 text-lg font-bold px-6 rounded-2xl"
                      />
                      <Textarea 
                        placeholder={t("Elaborate on your proposal... Use evidence-based arguments for better impact.", "اشرح مقترحك بالتفصيل... استخدم حججاً مبنية على أدلة لتأثير أفضل.")}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[150px] bg-secondary/30 border-none text-md leading-relaxed p-6 rounded-2xl"
                      />
                      <div className="flex justify-between items-center bg-secondary/20 p-4 rounded-2xl border border-dashed border-border/50">
                        <p className="text-xs text-muted-foreground font-medium italic">
                          {t("This proposal will be visible to all members of this chamber.", "سيكون هذا المقترح مرئياً لجميع أعضاء هذه الغرفة.")}
                        </p>
                        <Button 
                          variant="gold" 
                          onClick={handlePostSubmit}
                          disabled={!newPostContent || createPostMutation.isPending}
                          className="h-12 px-8 font-bold shadow-lg shadow-gold/20"
                        >
                          {t("Publish to Forum", "نشر في المنتدى")}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts Grid */}
            <div className="space-y-8">
              {isLoadingPosts ? (
                <div className="space-y-8">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-64 bg-foreground/[0.06] rounded-[2rem] animate-pulse" />
                  ))}
                </div>
              ) : !postsData?.posts || postsData.posts.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-[2.5rem] border border-dashed border-border">
                  <div className="w-16 h-16 bg-secondary/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-display font-black text-foreground mb-1">{t("Floor is open", "الباب مفتوح")}</h3>
                  <p className="text-muted-foreground font-medium">{t("No motions have been tabled yet.", "لم يتم طرح أي مقترحات بعد.")}</p>
                </div>
              ) : (
                (postsData.posts as any as Post[]).map(post => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={post.id}
                  >
                    <Card className={`group p-0 overflow-hidden border-border/50 transition-all duration-300 hover:border-gold/40 hover:shadow-2xl hover:shadow-gold/5 rounded-[2rem] ${
                      activePostId === post.id ? 'ring-2 ring-gold ring-offset-2 ring-offset-background' : ''
                    }`}>
                      <div className="p-8 pb-4">
                        <div className="flex items-start justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-14 h-14 bg-gradient-to-tr from-primary to-primary/60 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20 overflow-hidden">
                                {post.author.avatarUrl ? (
                                  <img src={post.author.avatarUrl} alt={post.author.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  (isAr && post.author.fullNameAr ? post.author.fullNameAr : post.author.fullName).charAt(0)
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-card rounded-full" />
                            </div>
                            <div>
                              <div className="font-black text-foreground text-lg leading-tight flex items-center gap-2">
                                {isAr && post.author.fullNameAr ? post.author.fullNameAr : post.author.fullName}
                                {post.author.simulationRole?.includes('Admin') && (
                                  <Badge className="bg-primary/10 text-primary border-none text-[10px] py-0 px-2 uppercase font-bold tracking-tighter">ADMIN</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-2 mt-1">
                                {post.author.simulationRole || t("Member", "عضو")}
                                <span className="w-1 h-1 bg-border rounded-full" />
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {user?.id === post.author.id && (
                              <button 
                                onClick={() => handleDelete(post.id)}
                                className="w-10 h-10 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {post.title && <h4 className="text-2xl font-display font-black text-foreground mb-4 leading-tight">{post.title}</h4>}
                        <p className="text-foreground/80 text-lg leading-relaxed mb-8 font-medium whitespace-pre-wrap">{post.content}</p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-border/40">
                          <div className="flex items-center gap-2">
                            <motion.button 
                              whileTap={{ scale: 0.8 }}
                              onClick={() => handleLike(post)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                                post.isLiked 
                                  ? 'bg-destructive text-white shadow-lg shadow-destructive/25' 
                                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                              {post.likesCount}
                            </motion.button>
                            
                            <button 
                              onClick={() => {
                                if (activePostId === post.id) setActivePostId(null);
                                else {
                                  setActivePostId(post.id);
                                  if (!replies[post.id]) fetchReplies(post.id);
                                }
                              }}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                                activePostId === post.id 
                                  ? 'bg-navy-dark text-white shadow-lg shadow-navy/20' 
                                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
                              }`}
                            >
                              <MessageSquare className="w-4 h-4" />
                              {post.replyCount} {t("Comments", "تعليق")}
                            </button>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {activePostId === post.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-secondary/20 border-t border-border/40 overflow-hidden"
                          >
                            <div className="p-8">
                              {/* Reply Input */}
                              <div className="flex gap-4 mb-10">
                                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold font-black shrink-0 overflow-hidden shadow-lg shadow-primary/5">
                                  {user?.avatarUrl ? (
                                     <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                     (isAr && user?.fullNameAr ? user.fullNameAr : user?.fullName)?.charAt(0)
                                  )}
                                </div>
                                <div className="flex-1 relative group">
                                  <Textarea 
                                    placeholder={t("Draft a constructive reply...", "اكتب رداً بناءً...")}
                                    value={replyContent[post.id] || ""}
                                    onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    className="min-h-[60px] max-h-[200px] w-full bg-card border-2 border-border/50 group-focus-within:border-gold group-focus-within:ring-4 ring-gold/10 p-4 rounded-2xl text-md pe-14 transition-all"
                                  />
                                  <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleReplySubmit(post.id)}
                                    disabled={!replyContent[post.id]}
                                    className="absolute end-3 bottom-3 w-10 h-10 bg-gold text-navy-dark rounded-xl flex items-center justify-center disabled:opacity-30 transition-opacity shadow-lg shadow-primary/20"
                                  >
                                    <Send className="w-5 h-5" />
                                  </motion.button>
                                </div>
                              </div>

                              {/* Replies List */}
                              <div className="space-y-6">
                                {loadingReplies[post.id] ? (
                                  <div className="flex justify-center py-4">
                                     <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                  </div>
                                ) : replies[post.id]?.length === 0 ? (
                                  <div className="text-center py-6 text-muted-foreground font-bold text-sm uppercase tracking-widest">{t("No replies yet", "لا توجد ردود بعد")}</div>
                                ) : (
                                  replies[post.id]?.map((reply: any) => (
                                    <motion.div 
                                      initial={{ x: -10, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      key={reply.id} 
                                      className="flex gap-4 relative"
                                    >
                                      <div className="w-10 h-10 bg-card border border-border/50 rounded-xl flex items-center justify-center text-foreground font-black shrink-0 shadow-sm overflow-hidden">
                                        {reply.author.avatarUrl ? (
                                           <img src={reply.author.avatarUrl} alt={reply.author.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                           (isAr && reply.author.fullNameAr ? reply.author.fullNameAr : reply.author.fullName).charAt(0)
                                        )}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50 relative">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="font-bold text-foreground text-sm">
                                              {isAr && reply.author.fullNameAr ? reply.author.fullNameAr : reply.author.fullName}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                              </span>
                                              {user?.id === reply.author.id && (
                                                <button onClick={() => handleDelete(reply.id, true, post.id)} className="text-muted-foreground/40 hover:text-destructive">
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-foreground/80 text-md leading-relaxed font-medium">{reply.content}</p>
                                          
                                          <motion.button 
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => handleLike(reply, true, post.id)}
                                            className={`absolute -bottom-2 -end-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all shadow-lg ${
                                              reply.isLiked 
                                                ? 'bg-rose-500 text-white shadow-rose-200' 
                                                : 'bg-card text-muted-foreground border border-border/50 hover:bg-secondary/40'
                                            }`}
                                          >
                                            <Heart className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                            {reply.likesCount}
                                          </motion.button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
