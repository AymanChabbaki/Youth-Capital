import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button, Input, Textarea } from "@/components/ui-custom";
import { useGetForums, useGetForumPosts, useCreatePost } from "@workspace/api-client-react";
import { MessageSquare, Users, Clock, Search, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Redirect } from "wouter";

export default function Community() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t, isAr } = useLanguage();
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const { data: forumsData } = useGetForums();
  const { data: postsData, refetch: refetchPosts } = useGetForumPosts(selectedForumId || 0, {}, { query: { enabled: !!selectedForumId } });
  const createPostMutation = useCreatePost();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;

  const forums = forumsData?.forums || [];

  const handlePostSubmit = async () => {
    if (!selectedForumId || !newPostContent) return;
    await createPostMutation.mutateAsync({
      forumId: selectedForumId,
      data: { title: newPostTitle, content: newPostContent }
    });
    setIsComposing(false);
    setNewPostTitle("");
    setNewPostContent("");
    refetchPosts();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-secondary/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-card border-r border-border p-6 shrink-0 md:min-h-screen">
        <h2 className="text-xl font-display font-bold mb-6">{t("Chambers & Forums", "الغرف والمنتديات")}</h2>
        <div className="space-y-2">
          {forums.map(forum => (
            <button
              key={forum.id}
              onClick={() => { setSelectedForumId(forum.id); setIsComposing(false); }}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                selectedForumId === forum.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <div className="font-bold mb-1">{isAr ? forum.nameAr : forum.name}</div>
              <div className={`text-xs ${selectedForumId === forum.id ? "text-primary-foreground/80" : "text-muted-foreground"} flex items-center justify-between`}>
                <span>{isAr ? forum.category : forum.category.replace('_', ' ').toUpperCase()}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/> {forum.postCount}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {!selectedForumId ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <Users className="w-16 h-16 mb-4 text-border" />
            <h3 className="text-2xl font-bold mb-2">{t("Select a Forum", "اختر منتدى")}</h3>
            <p>{t("Join the debate by selecting a chamber from the sidebar.", "انضم إلى النقاش باختيار إحدى الغرف من القائمة الجانبية.")}</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {isAr ? forums.find(f => f.id === selectedForumId)?.nameAr : forums.find(f => f.id === selectedForumId)?.name}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isAr ? forums.find(f => f.id === selectedForumId)?.descriptionAr : forums.find(f => f.id === selectedForumId)?.description}
                </p>
              </div>
              <Button onClick={() => setIsComposing(!isComposing)} className="gap-2">
                {isComposing ? t("Cancel", "إلغاء") : <><Plus className="w-4 h-4"/> {t("New Motion", "موضوع جديد")}</>}
              </Button>
            </div>

            {isComposing && (
              <Card className="p-6 border-primary/20 shadow-primary/5">
                <h3 className="text-lg font-bold mb-4">{t("Propose a New Motion", "اقتراح موضوع جديد")}</h3>
                <div className="space-y-4">
                  <Input 
                    placeholder={t("Title (optional)", "العنوان (اختياري)")} 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <Textarea 
                    placeholder={t("State your argument...", "اطرح حجتك...")}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="gold" 
                      onClick={handlePostSubmit}
                      disabled={!newPostContent || createPostMutation.isPending}
                    >
                      {t("Publish", "نشر")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {postsData?.posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
                  {t("No debates yet. Be the first to speak!", "لا توجد نقاشات بعد. كن أول المتحدثين!")}
                </div>
              ) : (
                postsData?.posts.map(post => (
                  <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {(isAr && post.author.fullNameAr ? post.author.fullNameAr : post.author.fullName).charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            {isAr && post.author.fullNameAr ? post.author.fullNameAr : post.author.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{post.author.simulationRole || t("Member", "عضو")}</Badge>
                    </div>
                    {post.title && <h4 className="text-lg font-bold mb-2">{post.title}</h4>}
                    <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex justify-end border-t border-border pt-4">
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <MessageSquare className="w-4 h-4" /> {post.replyCount} {t("Replies", "ردود")}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
