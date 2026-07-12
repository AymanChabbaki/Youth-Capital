import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button, Input, PageHero } from "@/components/ui-custom";
import { useGetArticles } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Search,
  Newspaper,
  ArrowRight,
  Calendar,
  User,
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

  const filteredArticles = articles.filter((article: any) => {
    const matchesCategory = activeCategory === "all" || article.type === activeCategory;
    const matchesSearch = (isAr ? article.titleAr : article.title).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const heroArticle = filteredArticles[0];
  const secondaryArticles = filteredArticles.slice(1, 3);
  const feedArticles = filteredArticles.slice(3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-muted-foreground font-bold animate-pulse text-sm uppercase tracking-widest">
          {t("Syncing with Press Desk...", "جاري المزامنة مع مكتب الصحافة...")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHero
        compact
        eyebrow={t("The National Press", "الصحافة الوطنية")}
        title={t("Civic Pulse", "نشرة نبض")}
        highlight={t("Dispatch", "المواطنة")}
        subtitle={t("Direct investigative reporting on the Youth Capital simulation and official legislative proceedings.", "تقارير استقصائية مباشرة عن محاكاة عاصمة الشباب والإجراءات التشريعية الرسمية.")}
      />

      {/* Control Bar */}
      <div className="sticky top-[81px] z-40 bg-background/80 backdrop-blur-2xl border-b border-border/50 py-5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2 bg-secondary/40 p-1.5 rounded-2xl border border-border/50 w-full md:w-auto overflow-x-auto no-scrollbar">
            {["all", "simulation", "platform"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-navy-dark text-white shadow-lg shadow-navy-dark/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(cat === "all" ? "Whole Feed" : cat, cat === "all" ? "الكل" : cat)}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors z-10" />
            <Input
              placeholder={t("Filter reports...", "تصفية التقارير...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-11 h-12 bg-secondary/40 border-border/50 rounded-2xl focus-visible:ring-gold/30 text-sm font-bold"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
        {heroArticle ? (
          <>
            {/* Hero Article */}
            <Link href={`/press/${heroArticle.id}`}>
              <motion.div
                whileHover={{ y: -8 }}
                className="relative h-[60vh] md:h-[65vh] w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden mb-12 cursor-pointer group shadow-2xl shadow-navy/10 border border-border/30"
              >
                {heroArticle.thumbnailUrl ? (
                  <img src={heroArticle.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" title={heroArticle.title} />
                ) : (
                  <div className="w-full h-full bg-navy-dark bg-grid-gold p-20 flex items-center justify-center text-gold/10 font-display font-black text-[10vw]">PRESS</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />
                <div className="absolute bottom-0 start-0 p-8 md:p-16 w-full">
                  <div className="max-w-4xl">
                    <Badge className="bg-gold border-none text-navy-dark rounded-lg px-4 py-1.5 mb-6 text-xs font-black tracking-widest uppercase shadow-xl shadow-gold/20">
                      {heroArticle.type}
                    </Badge>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white mb-8 group-hover:text-gold-pale transition-colors leading-[1.08] tracking-tight">
                      {isAr ? heroArticle.titleAr : heroArticle.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm font-bold border-t border-white/20 pt-6">
                      <span className="flex items-center gap-2"><User className="w-4 h-4 text-gold" /> {heroArticle.author.fullName}</span>
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold" /> {format(new Date(heroArticle.publishedAt), 'MMMM dd, yyyy')}</span>
                      <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gold" /> {t("Headline Story", "القصة الرئيسية")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Secondary & Feed Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
              {/* Feed */}
              <div className="lg:col-span-8 space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-border/60" />
                  <h3 className="text-xs uppercase font-black tracking-[0.3em] text-muted-foreground">{t("Recent Briefings", "إيجازات حديثة")}</h3>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                {feedArticles.length > 0 ? (
                  feedArticles.map((article: any) => (
                    <Link key={article.id} href={`/press/${article.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row gap-8 p-6 md:p-8 bg-card border border-border/50 rounded-[2rem] hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="w-full md:w-64 h-48 rounded-3xl overflow-hidden shrink-0 border border-border/50 relative">
                          {article.thumbnailUrl ? (
                            <img src={article.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" title={article.title} />
                          ) : (
                            <div className="w-full h-full bg-secondary/40 flex items-center justify-center text-muted-foreground/40 font-display font-black">PRESS</div>
                          )}
                          <div className="absolute top-4 start-4 bg-card/95 backdrop-blur-md px-3 py-1 rounded-lg text-foreground text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {article.type}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-xl md:text-2xl font-display font-bold text-foreground group-hover:text-gold transition-colors mb-4 leading-tight tracking-tight">
                            {isAr ? article.titleAr : article.title}
                          </h4>
                          <p className="text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                            {isAr ? article.contentAr : article.content}
                          </p>
                          <div className="flex items-center gap-6 mt-auto">
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center text-xs font-black text-gold gap-1.5 uppercase tracking-widest group-hover:gap-3 transition-all">
                              {t("Full Report", "التقرير الكامل")} <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-24 bg-secondary/20 rounded-[2rem] border-2 border-dashed border-border">
                    <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground font-bold">{t("No matching reports found.", "لم يتم العثور على تقارير مطابقة.")}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-4 space-y-10">
                <div className="p-8 md:p-10 rounded-[2.5rem] bg-card border border-border/50 shadow-sm">
                  <h3 className="text-2xl font-display font-black text-foreground mb-8 tracking-tight">{t("Featured Stories", "قصص مميزة")}</h3>
                  <div className="space-y-10">
                    {secondaryArticles.map((article: any) => (
                      <Link key={article.id} href={`/press/${article.id}`}>
                        <div className="cursor-pointer group">
                          <div className="h-44 w-full rounded-3xl overflow-hidden mb-6 relative border border-border/40">
                            {article.thumbnailUrl ? (
                              <img src={article.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" title={article.title} />
                            ) : (
                              <div className="w-full h-full bg-secondary/50 flex items-center justify-center text-muted-foreground/40 font-display font-black">IMAGE</div>
                            )}
                            <Badge className="absolute bottom-4 start-4 bg-gold text-navy-dark border-none rounded-lg text-xs font-black shadow-lg">
                              {article.type}
                            </Badge>
                          </div>
                          <h4 className="text-xl font-display font-bold text-foreground group-hover:text-gold transition-colors leading-tight tracking-tight mb-2">
                            {isAr ? article.titleAr : article.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <Card className="p-8 md:p-10 rounded-[2.5rem] bg-navy-dark text-white border-none shadow-2xl shadow-navy/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-gold opacity-20" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 blur-3xl -mr-16 -mt-16 group-hover:bg-gold/20 transition-colors" />
                  <div className="relative z-10">
                    <BookOpen className="w-10 h-10 mb-6 text-gold" />
                    <h4 className="text-2xl font-display font-black mb-4 tracking-tight">{t("Citizen Journalist", "المواطن الصحفي")}</h4>
                    <p className="text-white/70 leading-relaxed mb-8">
                      {t("Become a witness to history. Report on simulation sessions and community motions.", "كن شاهداً على التاريخ. أبلغ عن جلسات المحاكاة ومقترحات المجتمع.")}
                    </p>
                    <Button
                      onClick={handleContribute}
                      variant="gold"
                      className="w-full rounded-2xl h-14 font-black"
                    >
                      {t("Contribute Now", "ساهم الآن")}
                    </Button>
                  </div>
                </Card>
              </aside>
            </div>
          </>
        ) : (
          <div className="text-center py-40 bg-card rounded-[3rem] border border-dashed border-border">
            <Newspaper className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-3xl font-display font-black text-foreground mb-2">{t("The Press Desk is Empty", "مكتب الصحافة فارغ")}</h2>
            <p className="text-muted-foreground">{t("New reports will be dispatched soon.", "سيتم إرسال تقارير جديدة قريباً.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
