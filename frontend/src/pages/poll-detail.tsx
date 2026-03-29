import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { customFetch, Poll, useCastVote } from "@workspace/api-client-react";
import { Button, Card, Badge, Progress } from "@/components/ui-custom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Vote as VoteIcon, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Lock, 
  BarChart3,
  Info,
  Share2,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function PollDetail() {
  const [, params] = useRoute("/polls/:id");
  const [, setLocation] = useLocation();
  const { t, isAr } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const castVoteMutation = useCastVote();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const pollId = params?.id ? parseInt(params.id) : null;

  const { data: poll, isLoading, error, refetch } = useQuery<Poll>({
    queryKey: [`/api/polls/${pollId}`],
    queryFn: () => customFetch<Poll>(`/api/polls/${pollId}`),
    enabled: !!pollId
  });

  const handleVote = async () => {
    if (!pollId || !selectedOption) return;

    try {
      await castVoteMutation.mutateAsync({ 
        id: pollId, 
        data: { optionId: selectedOption } 
      });
      toast({
        title: t("Vote Cast", "تم تسجيل صوتك"),
        description: t("Your participation strengthens our simulation.", "مشاركتك تعزز محاكاتنا."),
      });
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error", "خطأ"),
        description: error?.message || t("Failed to cast vote", "فشل في تسجيل الصوت"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">
          {t("Consultation Not Found", "الاستشارة غير موجودة")}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t("The consultation session you are looking for may have been archived or moved.", "جلسة الاستشارة التي تبحث عنها قد تم أرشفتها أو نقلها.")}
        </p>
        <Link href="/polls">
          <Button variant="outline">{t("Return to Agenda", "العودة إلى الأجندة")}</Button>
        </Link>
      </div>
    );
  }

  const hasVoted = !!poll.userVote;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Decorative Header Gradient */}
      <div className="h-64 bg-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10">
        {/* Navigation / Breadcrumbs */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/polls">
            <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
              <ChevronLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${isAr ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
              <span className="font-medium">{t("Back to Consultations", "العودة إلى الاستشارات")}</span>
            </button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Focus Area */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 md:p-12 shadow-2xl border-border/40 bg-card/80 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge variant="gold" className="px-4 py-1 text-sm uppercase tracking-wider font-bold">
                    {poll.status === "active" ? t("Live Consultation", "استشارة مباشرة") : t("Archived", "مؤرشف")}
                  </Badge>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    {new Date(poll.createdAt).toLocaleDateString(isAr ? 'ar-MA' : 'en-US')}
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-8 leading-tight">
                  {isAr ? poll.titleAr : poll.title}
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                   <p className="text-xl text-muted-foreground leading-relaxed">
                     {poll.description}
                   </p>
                </div>

                <div className="bg-secondary/20 rounded-3xl p-8 border border-border/50">
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                     <VoteIcon className="w-6 h-6 text-primary" />
                     {hasVoted ? t("Official Results", "النتائج الرسمية") : t("Cast Your Decision", "اتخذ قرارك")}
                   </h3>

                   <AnimatePresence mode="wait">
                     {hasVoted ? (
                       <motion.div 
                         key="results"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="space-y-6"
                       >
                         {poll.options.map((option: any) => (
                           <div key={option.id} className="relative">
                             <div className="flex justify-between items-end mb-3">
                               <span className="font-bold text-lg flex items-center gap-2">
                                 {isAr ? option.labelAr : option.label}
                                 {poll.userVote === option.id && (
                                   <Badge className="bg-primary text-white text-[10px] py-0">{t("Your Choice", "اختيارك")}</Badge>
                                 )}
                               </span>
                               <span className="text-lg font-black text-primary">{option.percentage}%</span>
                             </div>
                             <Progress value={option.percentage} className="h-4 bg-primary/10" />
                           </div>
                         ))}
                         <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between text-muted-foreground">
                            <div className="flex items-center gap-2">
                               <Users className="w-5 h-5" />
                               <span className="font-bold text-foreground">{poll.totalVotes}</span>
                               {t("Total Participants", "إجمالي المشاركين")}
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-primary/40" />
                         </div>
                       </motion.div>
                     ) : (
                       <motion.div 
                         key="voting"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="space-y-4"
                       >
                         {poll.options.map((option: any) => (
                           <button
                             key={option.id}
                             onClick={() => setSelectedOption(option.id)}
                             disabled={!isAuthenticated}
                             className={`w-full p-6 rounded-2xl border-2 text-start transition-all duration-300 flex items-center justify-between group ${
                               selectedOption === option.id 
                                 ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg' 
                                 : 'border-border/50 bg-background/50 hover:border-primary/50'
                             } ${!isAuthenticated ? 'opacity-60 grayscale' : ''}`}
                           >
                             <span className="font-bold text-xl">
                               {isAr ? option.labelAr : option.label}
                             </span>
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                               selectedOption === option.id ? 'border-primary bg-primary scale-110' : 'border-border'
                             }`}>
                               {selectedOption === option.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                             </div>
                           </button>
                         ))}

                         <div className="pt-8">
                           {!isAuthenticated ? (
                              <Link href="/login">
                                <Button variant="outline" className="w-full gap-3 py-8 text-xl border-dashed">
                                  <Lock className="w-6 h-6" />
                                  {t("Sign in to Influence Policy", "سجل الدخول للتأثير في السياسة")}
                                </Button>
                              </Link>
                           ) : (
                             <Button 
                               onClick={handleVote} 
                               className="w-full py-8 text-xl shadow-2xl shadow-primary/30"
                               disabled={!selectedOption || castVoteMutation.isPending}
                               isLoading={castVoteMutation.isPending}
                             >
                               {t("Submit Final Decision", "تقديم القرار النهائي")}
                             </Button>
                           )}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Context Sidebar */}
          <div className="space-y-8">
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
             >
               <Card className="p-8 border-border/40 bg-card/50">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border pb-4">
                   <Info className="w-5 h-5 text-gold" />
                   {t("Impact Report", "تقرير الأثر")}
                 </h3>
                 <p className="text-muted-foreground leading-relaxed mb-6 font-medium">
                    {t(
                      "This consultation directly influences the Simulation Budget allocation for Q3 2026. Your choice represents your constituency's interests.",
                      "هذه الاستشارة تؤثر بشكل مباشر على تخصيص ميزانية المحاكاة للربع الثالث من عام 2026. خيارك يمثل مصالح دائرتك الانتخابية."
                    )}
                 </p>
                 <div className="space-y-4">
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">{t("Status", "الحالة")}</span>
                     <span className="font-bold text-gold uppercase">{poll.status}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">{t("Visibility", "الظهور")}</span>
                     <span className="font-bold text-foreground">{t("Public", "عام")}</span>
                   </div>
                 </div>
               </Card>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.25 }}
             >
               <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5">
                 <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-primary" />
                   {t("Engagement Pulse", "نبض المشاركة")}
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs text-muted-foreground uppercase font-bold">{t("Momentum", "الزخم")}</span>
                       <Badge variant="gold" className="text-[10px] animate-pulse">HIGH</Badge>
                    </div>
                    <div className="flex -space-x-2">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-slate-200" />
                       ))}
                       <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                         +24
                       </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      {t("24 new votes in the last hour", "24 صوتاً جديداً في الساعة الماضية")}
                    </p>
                 </div>
               </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
             >
               <Card className="p-8 border-border/40 bg-navy-dark text-white overflow-hidden relative group cursor-pointer">
                 <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform">
                   <Share2 className="w-12 h-12" />
                 </div>
                 <h3 className="text-xl font-bold mb-2 relative z-10">{t("Spread the word", "شارك الاستشارة")}</h3>
                 <p className="text-white/60 text-sm mb-4 relative z-10">
                   {t("Engage more participants to get a representative result.", "أشرك المزيد من المشاركين للحصول على نتيجة تمثيلية.")}
                 </p>
                 <Button variant="gold" size="sm" className="w-full font-bold">
                   {t("Copy Invite Link", "نسخ رابط الدعوة")}
                 </Button>
               </Card>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

