import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Badge, Button, Card } from "@/components/ui-custom";
import { useGetArticle, useGetArticles } from "@workspace/api-client-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Share2, 
  Calendar,
  ChevronRight,
  BookOpen,
  Newspaper,
  Search,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, isAr } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const articleId = parseInt(id || "0");
  
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: isAr ? article?.titleAr : article?.title,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: t("Link Copied", "تم نسخ الرابط"),
          description: t("The report link has been copied to your clipboard.", "تم نسخ رابط التقرير إلى الحافظة."),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  const { data: article, isLoading } = useGetArticle(articleId);
  const { data: latestArticlesData } = useGetArticles({ limit: 4 });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-slate-500 font-bold animate-pulse">{t("Loading report...", "جاري تحميل التقرير...")}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
          <Newspaper className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("Report Not Found", "التقرير غير موجود")}</h2>
        <p className="text-slate-500 mb-8 max-w-xs">{t("The article you are looking for might have been archived or moved.", "قد يكون المقال الذي تبحث عنه قد تم أرشفته أو نقله.")}</p>
        <Link href="/press">
          <Button className="rounded-2xl px-8 h-12 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("Back to Press Portal", "العودة إلى بوابة الصحافة")}
          </Button>
        </Link>
      </div>
    );
  }

  const latestArticles = latestArticlesData?.articles?.filter(a => a.id !== article.id).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Article Hero */}
      <div className="relative h-[60vh] lg:h-[75vh] w-full overflow-hidden">
        {article.thumbnailUrl ? (
          <img 
            src={article.thumbnailUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
             <span className="text-white/10 font-black text-[20vw] select-none uppercase">PRESS</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-primary hover:bg-primary text-white border-none rounded-lg px-4 py-1.5 mb-6 text-xs font-black tracking-widest uppercase shadow-lg shadow-primary/20">
                {article.type}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-white mb-8 leading-[1.05] tracking-tight">
                {isAr ? article.titleAr : article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-bold border-t border-white/20 pt-8 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-xs opacity-60 uppercase tracking-tighter mb-0.5">{t("Reported By", "تقرير بواسطة")}</p>
                    <p>{article.author.fullName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-xs opacity-60 uppercase tracking-tighter mb-0.5">{t("Published At", "تاريخ النشر")}</p>
                    <p>{format(new Date(article.publishedAt), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-xs opacity-60 uppercase tracking-tighter mb-0.5">{t("Reading Time", "وقت القراءة")}</p>
                    <p>5 min read</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-12 uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap">
              <Link href="/" className="hover:text-primary transition-colors">HOME</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/press" className="hover:text-primary transition-colors">PRESS</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900 truncate">ARTICLE {article.id}</span>
            </div>

            {/* Article Body */}
            <article className="prose prose-lg prose-slate max-w-none">
              <div className="text-2xl md:text-3xl text-slate-600 font-bold leading-relaxed mb-16 border-l-8 border-primary pl-8 italic">
                {isAr ? article.contentAr.slice(0, 150) : article.content.slice(0, 150)}...
              </div>
              
              <div className="text-xl md:text-2xl text-slate-800 leading-[1.8] font-medium whitespace-pre-wrap selection:bg-primary/20">
                {isAr ? article.contentAr : article.content}
              </div>
              
              <div className="mt-24 p-12 rounded-[48px] bg-slate-950 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                 <Newspaper className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 -rotate-12" />
                 <h4 className="text-white font-black text-2xl mb-4 relative z-10 tracking-tight">{t("Stay Informed on Civic Pulse", "ابق على اطلاع بنبض المواطنة")}</h4>
                 <p className="text-slate-400 leading-relaxed mb-8 font-medium relative z-10 max-w-md">
                   {t("This report is transcribed in our Simulation Archives. Every motion, debate, and law passed is documented for transparency and historical record.", "يتم نسخ هذا التقرير في أرشيف المحاكاة الخاص بنا. يتم توثيق كل اقتراح ومناقشة وقانون تم تمريره من أجل الشفافية والسجلات التاريخية.")}
                 </p>
                 <div className="flex flex-wrap gap-4 relative z-10">
                    <Button 
                      onClick={handleShare}
                      className="rounded-2xl h-14 px-8 gap-3 bg-white text-slate-950 hover:bg-slate-100 font-black shadow-xl shadow-white/5"
                    >
                      <Share2 className="w-5 h-5" />
                      {t("Distribute Report", "توزيع التقرير")}
                    </Button>
                    <Link href="/press">
                       <Button variant="outline" className="rounded-2xl h-14 px-8 gap-3 border-white/20 text-white hover:bg-white/10 font-black">
                         <BookOpen className="w-5 h-5" />
                         {t("Explore Archive", "استكشاف الأرشيف")}
                       </Button>
                    </Link>
                 </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Latest Stories Footer */}
      {latestArticles.length > 0 && (
        <div className="bg-slate-50 py-32 border-t border-slate-100 mt-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-20">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Search className="w-6 h-6" />
                 </div>
                 <h3 className="text-4xl font-display font-black text-slate-900 tracking-tight">{t("Related Inquiries", "تحقيقات ذات صلة")}</h3>
              </div>
              <Link href="/press">
                <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-primary/5 rounded-xl h-12 px-6">
                  {t("Back to Portal", "العودة للبوابة")} <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {latestArticles.map(a => (
                <Link key={a.id} href={`/press/${a.id}`}>
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-[40px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer group h-full"
                  >
                    <div className="h-60 relative overflow-hidden">
                      {a.thumbnailUrl ? (
                        <img src={a.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-black text-2xl">YC PRESS</div>
                      )}
                      <Badge className="absolute top-6 left-6 bg-slate-950 text-white rounded-lg text-[10px] font-black border-none px-4 py-1 tracking-widest uppercase">
                        {a.type}
                      </Badge>
                    </div>
                    <div className="p-10">
                       <h4 className="text-2xl font-bold mb-4 line-clamp-2 text-slate-900 group-hover:text-primary transition-colors leading-tight">
                         {isAr ? a.titleAr : a.title}
                       </h4>
                       <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                         <Calendar className="w-3.5 h-3.5" />
                         {format(new Date(a.publishedAt), 'MMM dd, yyyy')}
                       </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
