import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button, Input } from "@/components/ui-custom";
import { useGetArticles } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Newspaper, 
  ArrowRight, 
  Calendar, 
  User,
  Filter,
  TrendingUp,
  Bookmark,
  Clock,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Press() {
  const { t, isAr } = useLanguage();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleContribute = () => {
    toast({
      title: t("Drafting Protocol", "بروتوكول الصياغة"),
      description: t("The press desk is currently full. Contact the National Admin for press credentials.", "مكتب الصحافة ممتلئ حالياً. اتصل بالمسؤول الوطني للحصول على أوراق الاعتماد الصحفية."),
    });
  };
  
  const { data: articlesData, isLoading } = useGetArticles();
  const articles = articlesData?.articles || [];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === "all" || article.type === activeCategory;
    const matchesSearch = (isAr ? article.titleAr : article.title).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const heroArticle = filteredArticles[0];
  const secondaryArticles = filteredArticles.slice(1, 3);
  const feedArticles = filteredArticles.slice(3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-slate-500 font-bold animate-pulse">{t("Syncing with Press Desk...", "جاري المزامنة مع مكتب الصحافة...")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      {/* Editorial Header */}
      <div className="bg-slate-900 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary/20 rounded-full text-primary border border-primary/20 mb-8"
          >
            <Newspaper className="w-4 h-4" />
            <span className="text-xs font-black tracking-widest uppercase">{t("THE NATIONAL PRESS", "الصحافة الوطنية")}</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[1.05]">
            {t("Civic Pulse Dispatch", "نشرة نبض المواطنة")}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            {t("Direct investigative reporting on the Youth Capital simulation and official legislative proceedings.", "تقارير استقصائية مباشرة عن محاكاة عاصمة الشباب والإجراءات التشريعية الرسمية.")}
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full md:w-auto overflow-x-auto no-scrollbar">
            {["all", "simulation", "platform"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t(cat === "all" ? "Whole Feed" : cat, cat === "all" ? "الكل" : cat)}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder={t("Filter reports...", "تصفية التقارير...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 text-sm font-bold"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {heroArticle ? (
          <>
            {/* Hero Article */}
            <Link href={`/press/${heroArticle.id}`}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="relative h-[65vh] w-full rounded-[48px] overflow-hidden mb-12 cursor-pointer group shadow-2xl shadow-slate-200/50"
              >
                {heroArticle.thumbnailUrl ? (
                  <img src={heroArticle.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" title={heroArticle.title} />
                ) : (
                  <div className="w-full h-full bg-slate-900 p-20 flex items-center justify-center text-white/10 font-black text-[10vw]">PRESS</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-10 md:p-16 lg:p-20 w-full">
                  <div className="max-w-4xl">
                    <Badge className="bg-primary border-none text-white rounded-lg px-4 py-1.5 mb-6 text-xs font-black tracking-widest uppercase shadow-xl shadow-primary/20">
                      {heroArticle.type}
                    </Badge>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-white mb-8 group-hover:text-primary transition-colors leading-[1.05] tracking-tight">
                      {isAr ? heroArticle.titleAr : heroArticle.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm font-bold border-t border-white/20 pt-8 mt-4">
                       <span className="flex items-center gap-2"><User className="w-4 h-4" /> {heroArticle.author.fullName}</span>
                       <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {format(new Date(heroArticle.publishedAt), 'MMMM dd, yyyy')}</span>
                       <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> {t("Headline Story", "القصة الرئيسية")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Secondary & Feed Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20">
              {/* Left Column: Recent News Feed */}
              <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center gap-4 mb-4">
                   <div className="h-[1px] flex-1 bg-slate-100" />
                   <h3 className="text-xs uppercase font-black tracking-[0.3em] text-slate-400">{t("Recent Briefings", "إيجازات حديثة")}</h3>
                   <div className="h-[1px] flex-1 bg-slate-100" />
                </div>
                
                {feedArticles.length > 0 ? (
                  feedArticles.map(article => (
                    <Link key={article.id} href={`/press/${article.id}`}>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row gap-8 p-8 bg-white border border-slate-100 rounded-[40px] hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
                      >
                        <div className="w-full md:w-64 h-48 rounded-[32px] overflow-hidden shrink-0 border border-slate-200 shadow-sm relative">
                           {article.thumbnailUrl ? (
                              <img src={article.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" title={article.title} />
                           ) : (
                              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 font-bold">PRESS</div>
                           )}
                           <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-slate-900 text-[10px] font-black uppercase tracking-widest border-none shadow-sm">
                             {article.type}
                           </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                           <h4 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors mb-4 leading-tight tracking-tight">
                             {isAr ? article.titleAr : article.title}
                           </h4>
                           <p className="text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">
                             {isAr ? article.contentAr : article.content}
                           </p>
                           <div className="flex items-center gap-6 mt-auto">
                              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Clock className="w-3 h-3" />
                                {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
                              </span>
                              <Button variant="ghost" className="p-0 h-auto text-xs font-black text-primary gap-1.5 uppercase tracking-widest group-hover:gap-3 transition-all">
                                {t("Full Report", "التقرير الكامل")} <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                           </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                     <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                     <p className="text-slate-500 font-bold">{t("No matching reports found.", "لم يتم العثور على تقارير مطابقة.")}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Trending / Sidebar */}
              <aside className="lg:col-span-4 space-y-12">
                <div className="p-10 rounded-[48px] bg-slate-50 border border-slate-100 shadow-sm">
                  <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">{t("Featured Stories", "قصص مميزة")}</h3>
                  <div className="space-y-10">
                    {secondaryArticles.map(article => (
                      <Link key={article.id} href={`/press/${article.id}`}>
                        <div className="cursor-pointer group">
                           <div className="h-44 w-full rounded-3xl overflow-hidden mb-6 relative">
                              {article.thumbnailUrl ? (
                                <img src={article.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" title={article.title} />
                              ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">IMAGE</div>
                              )}
                              <Badge className="absolute bottom-4 left-4 bg-primary text-white border-none rounded-lg text-xs font-black shadow-lg">
                                 {article.type}
                              </Badge>
                           </div>
                           <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight tracking-tight mb-2">
                             {isAr ? article.titleAr : article.title}
                           </h4>
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <Calendar className="w-3 h-3" />
                             {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
                           </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <Card className="p-10 rounded-[48px] bg-primary text-white border-none shadow-2xl shadow-primary/20 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
                   <BookOpen className="w-10 h-10 mb-6 text-white/50" />
                   <h4 className="text-2xl font-black mb-4 tracking-tight">{t("Citizen Journalist", "المواطن الصحفي")}</h4>
                   <p className="text-white/80 leading-relaxed mb-8 font-medium">
                     {t("Become a witness to history. Report on simulation sessions and community motions.", "كن شاهداً على التاريخ. أبلغ عن جلسات المحاكاة ومقترحات المجتمع.")}
                   </p>
                   <Button 
                     onClick={handleContribute}
                     className="w-full bg-white text-primary hover:bg-slate-100 rounded-2xl h-14 font-black shadow-xl"
                   >
                     {t("Contribute Now", "ساهم الآن")}
                   </Button>
                </Card>
              </aside>
            </div>
          </>
        ) : (
          <div className="text-center py-40 bg-white rounded-[60px] border border-dashed border-slate-200">
             <Newspaper className="w-20 h-20 text-slate-300 mx-auto mb-6" />
             <h2 className="text-3xl font-bold text-slate-900 mb-2">{t("The Press Desk is Empty", "مكتب الصحافة فارغ")}</h2>
             <p className="text-slate-500 font-medium">{t("New reports will be dispatched soon.", "سيتم إرسال تقارير جديدة قريباً.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
