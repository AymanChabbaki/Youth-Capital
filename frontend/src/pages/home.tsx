import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button, Card } from "@/components/ui-custom";
import { Link } from "wouter";
import { useGetPlatformStats, useGetForums, useGetArticles, useGetPolls } from "@workspace/api-client-react";
import { Users, FileText, Landmark, ShieldAlert, ArrowRight, Gavel, Briefcase, AlertCircle, Target, Zap, ArrowUp, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { t, isAr } = useLanguage();
  const { data: stats } = useGetPlatformStats();
  const { data: forumsData } = useGetForums();
  const { data: articlesData } = useGetArticles();
  const { data: pollsData } = useGetPolls();
  const communityLink = import.meta.env.VITE_COMMUNITY_LINK || "https://chat.whatsapp.com/LC5mqBrIPXdLJhK6cLJsmu";
  const [activeFeature, setActiveFeature] = useState(1);
  const [activeCommunity, setActiveCommunity] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-32 md:pb-40 px-4 overflow-hidden bg-[#0d1828]">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-75"
          poster={`${import.meta.env.BASE_URL}images/hero-bg.png`}
        >
          <source src={`${import.meta.env.BASE_URL}herobg.mp4`} type="video/mp4" />
        </video>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1828]/75 via-[#0d1828]/40 to-[#1b2a4a]/30 z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 md:mb-8 text-gold-pale text-[10px] md:text-sm font-bold uppercase tracking-widest"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            {t("Simulation Season 2 is Live", "الموسم الثاني من المحاكاة متاح الآن")}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-[1.1] max-w-4xl text-balance"
          >
            {t("Experience the Future of ", "عش مستقبل ")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-pale">
              {t("Civic Leadership", "القيادة المدنية")}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-xl text-white/80 max-w-2xl mb-10 px-4 md:px-0"
          >
            {t(
              "Join the ultimate digital governance simulation for Moroccan youth. Debate policy, pass legislation, and manage crises in real-time.",
              "انضم إلى منصة محاكاة الحوكمة الرقمية للشباب المغربي. ناقش السياسات، مرر القوانين، وأدر الأزمات في الوقت الفعلي."
            )}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 md:px-0"
          >
            <Link href="/apply">
              <Button variant="gold" size="lg" className="w-full sm:w-auto text-lg px-12 group h-14 md:h-16 shadow-2xl shadow-gold/20">
                {t("Apply Now", "قدّم طلبك الآن")}
                <ArrowRight className={`ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10 text-lg px-8 h-14 md:h-16 backdrop-blur-sm">
                {t("How it Works", "كيف تعمل المنصة")}
              </Button>
            </Link>
          </motion.div>
        </div>
        
        {/* Decorative elements for Hero */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-0" />
      </section>

      {/* Live Stats Bar */}
      <section className="relative -mt-12 md:-mt-16 z-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Card className="glass-panel p-6 md:p-8 flex flex-wrap md:grid md:grid-cols-4 gap-6 md:gap-8 justify-center text-center">
            <div className="flex-[1_1_140px] md:flex-none flex flex-col items-center">
              <Landmark className="w-6 h-6 md:w-8 md:h-8 text-primary mb-3" />
              <div className="text-2xl md:text-3xl font-display font-black text-foreground mb-1">
                {stats?.activeMinistries || 12}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                {t("Ministries", "الوزارات")}
              </div>
            </div>
            <div className="flex-[1_1_140px] md:flex-none flex flex-col items-center md:border-l md:border-border/50">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary mb-3" />
              <div className="text-2xl md:text-3xl font-display font-black text-foreground mb-1">
                {stats?.billsPassed || 156}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                {t("Bills Passed", "قوانين مُقرة")}
              </div>
            </div>
            <div className="flex-[1_1_140px] md:flex-none flex flex-col items-center md:border-l md:border-border/50">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-primary mb-3" />
              <div className="text-2xl md:text-3xl font-display font-black text-foreground mb-1">
                {stats?.activeMembers || "1.2k"}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                {t("Citizens", "المواطنين")}
              </div>
            </div>
            <div className="flex-[1_1_140px] md:flex-none flex flex-col items-center md:border-l md:border-border/50">
              <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-destructive mb-3" />
              <div className="text-2xl md:text-3xl font-display font-black text-destructive mb-1">
                {stats?.activeCrises || 2}
              </div>
              <div className="text-[10px] md:text-xs text-destructive/80 font-bold uppercase tracking-widest">
                {t("Live Crises", "الأزمات")}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 md:py-28 px-4 bg-secondary/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side: Heading and Intro */}
            <div className="lg:col-span-5 text-center lg:text-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-6 text-gold text-xs font-bold uppercase tracking-widest"
              >
                {t("About Youth Capital", "حول منصتنا")}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-display font-black text-foreground mb-6 leading-tight"
              >
                {t("Pioneering Civic ", "رواد الحوكمة ")}
                <span className="text-gold">{t("Governance", "المدنية")}</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed"
              >
                {t(
                  "Youth Capital is Morocco's premier digital sandbox for civic empowerment. We bridge the gap between young minds and national governance institutions, offering a dynamic, real-time environment to shape tomorrow's leaders.",
                  "منصتنا هي المساحة الرقمية الرائدة في المغرب لتمكين الشباب مدنياً. نحن نسد الفجوة بين العقول الشابة ومؤسسات الحوكمة الوطنية، ونقدم بيئة تفاعلية ديناميكية لصنع قادة الغد."
                )}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/about">
                  <Button variant="outline" className="border-gold/30 hover:bg-gold/10 text-gold font-bold">
                    {t("Read Our Full Story", "اقرأ قصتنا الكاملة")}
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right side: 4 Pillar Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Landmark,
                  title: t("Institutional Replication", "محاكاة المؤسسات"),
                  desc: t("Experience the exact inner workings of Moroccan parliament houses and ministerial offices.", "عش التجربة الدقيقة للعمل البرلماني والحقائب الوزارية المغربية.")
                },
                {
                  icon: Target,
                  title: t("Policy Impact", "التأثير في السياسات"),
                  desc: t("Draft genuine bills, propose national budgets, and debate critical socioeconomic reforms.", "صِغ مشاريع قوانين حقيقية، واقترح ميزانيات عامة، وناقش الإصلاحات الحيوية.")
                },
                {
                  icon: Users,
                  title: t("Collaborative Blocs", "الكتل التفاعلية"),
                  desc: t("Forge coalitions, debate opposition members, and build consensus on national governance.", "شكّل تحالفات قوية، وناظر المعارضة، وابنِ توافقاً وطنياً فعالاً.")
                },
                {
                  icon: Zap,
                  title: t("Crisis Response", "الاستجابة للأزمات"),
                  desc: t("Respond under pressure to real-time national emergency simulations injected by Game Masters.", "تعامل تحت الضغط مع محاكاة الطوارئ الوطنية التي يطلقها مديرو المحاكاة.")
                }
              ].map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx }}
                    className="p-6 rounded-2xl border border-border/50 bg-card hover:border-gold/40 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground font-display">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Feature Showcase */}
      <section className="py-20 md:py-32 px-4 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-gold/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-6xl font-display font-black text-foreground mb-4"
            >
              {t("The Simulation Core", "قلب المحاكاة")}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg"
            >
              {t("A technically superior replica of the Moroccan governance system.", "نسخة متطورة تقنياً من نظام الحوكمة المغربي.")}
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[600px] w-full items-stretch">
            {[
              {
                id: 0,
                title: t("Parliament", "البرلمان"),
                shortDesc: t("Legislative Power", "السلطة التشريعية"),
                fullDesc: t(
                  "Draft and vote on legislation mirroring real-world issues. Experience national checks and balances.",
                  "صياغة والتصويت على التشريعات التي تعكس قضايا العالم الحقيقي."
                ),
                icon: Gavel,
                img: "parliament.png",
                color: "from-blue-900/40 to-blue-800/20"
              },
              {
                id: 1,
                title: t("Ministries", "الوزارات"),
                shortDesc: t("Executive Branch", "السلطة التنفيذية"),
                fullDesc: t(
                  "Take charge of a sector, lead budgets, and implement national policies that shape the future.",
                  "تولى مسؤولية قطاع، قد الميزانيات، ونفذ السياسات الوطنية."
                ),
                icon: Briefcase,
                img: "hero-bg.png",
                color: "from-gold/40 to-yellow-900/20"
              },
              {
                id: 2,
                title: t("Crises", "الطوارئ"),
                shortDesc: t("Crisis Response", "إدارة الأزمات"),
                fullDesc: t(
                  "Respond to emergencies injected by Game Masters. Test your leadership under pressure.",
                  "استجب لحالات الطوارئ الوطنية غير المتوقعة واختبر قيادتك."
                ),
                icon: AlertCircle,
                img: "parliament.png",
                color: "from-red-900/40 to-red-800/20"
              }
            ].map((feature, i) => {
              const isActive = activeFeature === feature.id;
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={feature.id}
                  layout
                  onClick={() => setActiveFeature(feature.id)}
                  className={`relative cursor-pointer overflow-hidden rounded-[2rem] transition-all duration-700 ease-in-out border border-white/10 group ${
                    isActive ? 'flex-[4] lg:flex-[3] shadow-2xl shadow-primary/10' : 'flex-1 hover:bg-white/5'
                  }`}
                >
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={`${import.meta.env.BASE_URL}images/${feature.img}`} 
                      alt={feature.title} 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} via-background/90 to-transparent`} />
                  </div>

                  <div className={`relative z-10 h-full p-8 flex flex-col ${isActive ? 'justify-end' : 'items-center justify-center'}`}>
                    <div className={`mb-4 p-4 rounded-2xl transition-all duration-500 ${isActive ? 'bg-gold/20' : 'bg-white/5 opacity-50'}`}>
                      <Icon className={`w-8 h-8 ${isActive ? 'text-gold' : 'text-white'}`} />
                    </div>

                    <h3 className={`font-display font-black text-white transition-all duration-700 ${
                      isActive ? 'text-3xl mb-4' : 'text-xl lg:-rotate-90 lg:whitespace-nowrap'
                    }`}>
                      {feature.title}
                    </h3>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="space-y-4"
                        >
                          <p className="text-gold-pale/80 font-bold uppercase tracking-widest text-[10px]">
                            {feature.shortDesc}
                          </p>
                          <p className="text-white/80 leading-relaxed max-w-sm text-sm md:text-base">
                            {feature.fullDesc}
                          </p>
                          <Link href="/about">
                            <Button variant="ghost" className="text-gold hover:text-gold hover:bg-gold/10 px-0 group/btn h-auto py-2">
                              {t("View Details", "التفاصيل")}
                              <ArrowRight className={`ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1 ${isAr ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Path to Leadership - Stepper */}
      <section className="py-20 md:py-32 px-4 bg-secondary/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              {t("Your Path to Leadership", "طريقك نحو القيادة")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("Three simple steps to transform from a curious observer to a national decision maker.", "ثلاث خطوات بسيطة تتحول فيها من مراقب فضولي إلى صانع قرار وطني.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className={`hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent z-0`} />
            
            {[
              {
                step: "01",
                title: t("Submit Application", "قدم طلبك"),
                desc: t("Draft your vision for Morocco and choose your starting role.", "ارسم رؤيتك للمغرب واختبر دورك الأول."),
                icon: Target,
                delay: 0.1
              },
              {
                step: "02",
                title: t("Join a Team", "انضم إلى فريق"),
                desc: t("Collaborate with other youth in ministries or parliamentary blocs.", "تعاون مع شباب آخرين في الوزارات أو الكتل البرلمانية."),
                icon: Users,
                delay: 0.2
              },
              {
                step: "03",
                title: t("Influence Reality", "أثّر في الواقع"),
                desc: t("Propose laws and manage budgets that impact the simulation world.", "اقترح القوانين وأدر الميزانيات التي تؤثر على عالم المحاكاة."),
                icon: Zap,
                delay: 0.3
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: item.delay, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-3xl bg-background border-2 border-gold/20 flex items-center justify-center mb-6 group-hover:border-gold group-hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-500 relative bg-white dark:bg-charcoal shadow-lg">
                  <span className="absolute -top-3 -right-3 bg-gold text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                    {item.step}
                  </span>
                  <item.icon className="w-8 h-8 text-gold transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Communities Representation Section */}
      <section className="py-20 md:py-32 px-4 bg-background relative overflow-hidden border-t border-border/50">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center lg:text-start mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-display font-black text-foreground mb-4"
            >
              {t("Explore Our Chambers", "استكشف غرف النقاش لدينا")}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-2xl text-base md:text-lg"
            >
              {t("Hover or tap the list items to preview our active simulation hubs and enter your designated chamber.", "مرر المؤشر أو اضغط على عناصر القائمة لمعاينة مراكز المحاكاة النشطة والدخول إلى غرفتك المخصصة.")}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: Interactive Typography List */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-2">
              {!forumsData?.forums ? (
                <div className="py-8 text-center text-muted-foreground animate-pulse font-bold">
                  {t("Loading Chambers...", "جاري تحميل غرف النقاش...")}
                </div>
              ) : (
                forumsData.forums.map((community: any, idx: number) => {
                  const isActive = activeCommunity === community.id;
                  const numStr = String(idx + 1).padStart(2, "0");
                  return (
                    <Link href={`/community?forum=${community.id}`} key={community.id}>
                      <div
                        onMouseEnter={() => setActiveCommunity(community.id)}
                        className={`relative pl-4 pr-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-start gap-6 group ${
                          isActive ? 'bg-secondary/20 shadow-sm' : 'hover:bg-secondary/10'
                        }`}
                      >
                        <span className={`font-display font-bold text-xl transition-colors duration-300 mt-1 ${
                          isActive ? 'text-gold' : 'text-muted-foreground/50 group-hover:text-foreground'
                        }`}>
                          {numStr}
                        </span>
                        <div className="flex-1">
                          <h3 className={`text-xl md:text-2xl font-black font-display transition-colors duration-300 flex items-center gap-2 ${
                            isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                          }`}>
                            {isAr ? community.nameAr : community.name}
                            <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                              isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                            } text-gold ${isAr ? 'rotate-180' : ''}`} />
                          </h3>
                          <p className={`text-sm mt-1 transition-colors duration-300 max-w-xl ${
                            isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'
                          }`}>
                            {isAr ? community.descriptionAr : community.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Right Column: Dynamic Preview Frame */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[350px] lg:min-h-0">
              <Link href={`/community?forum=${activeCommunity}`} className="w-full h-full block">
                <div className="w-full h-full min-h-[380px] rounded-[2.5rem] overflow-hidden relative border border-white/10 shadow-2xl group cursor-pointer">
                  {/* Dynamic Image with Fade Effect */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeCommunity}
                      src={`${import.meta.env.BASE_URL}images/${(() => {
                        const forumObj = forumsData?.forums?.find((f: any) => f.id === activeCommunity);
                        switch (activeCommunity) {
                          case 1: return "parliament.png";
                          case 2: return "hero-bg.png";
                          case 3: return "ministry_finance.png";
                          case 4: return "ministry_health.png";
                          case 5: return "ministry_education.png";
                          case 6: return "regional_council.png";
                          case 7: return "general_assembly.png";
                          default:
                            if (forumObj?.category === "parliament") return "parliament.png";
                            if (forumObj?.category === "ministry") return "ministry_finance.png";
                            if (forumObj?.category === "regional") return "regional_council.png";
                            return "general_assembly.png";
                        }
                      })()}`}
                      alt="Chamber Preview"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </AnimatePresence>
                  
                  {/* Dark Vignette and Goldish Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />

                  {/* Active Chamber Label (Glassmorphic Card inside Frame) */}
                  <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl glass-panel border border-white/10 backdrop-blur-md">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-1">
                      {t("Live Session", "جلسة نشطة")}
                    </span>
                    <h4 className="text-xl font-bold font-display text-white">
                      {(() => {
                        const activeObj = forumsData?.forums?.find((f: any) => f.id === activeCommunity);
                        if (!activeObj) return t("Select a Chamber", "اختر غرفة");
                        return isAr ? activeObj.nameAr : activeObj.name;
                      })()}
                    </h4>
                    <span className="text-xs text-white/70 mt-2 inline-flex items-center gap-1 group-hover:text-gold transition-colors font-bold">
                      {t("Click to Join Debate", "انقر للانضمام للنقاش")}
                      <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Pulse (Floating Stats) */}
      <section className="py-32 px-4 bg-background overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-start px-0 lg:px-0">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight"
              >
                {t("Community-Driven ", "بقيادة المجتمع ")}
                <span className="text-gold">{t("Impact", "والتأثير")}</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="text-muted-foreground text-xl mb-10 leading-relaxed"
              >
                {t(
                  "Our simulation is more than just a game. It's a laboratory for modern Moroccan governance where every choice counts.",
                  "محاكاتنا أكثر من مجرد لعبة. إنها مختبر للحوكمة المغربية الحديثة حيث كل خيار له أهميته."
                )}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Link href="/apply">
                  <Button variant="gold" size="lg" className="rounded-2xl px-12 group shadow-xl shadow-gold/20">
                    {t("Start Your Journey", "ابدأ رحلتك الآن")}
                    <ArrowRight className={`ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </Button>
                </Link>
              </motion.div>
            </div>

            <div className="flex-1 relative min-h-[450px] md:h-[500px] w-full mt-12 lg:mt-0 flex flex-col items-center justify-center">
              {/* Decorative Circle - Centered Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-gold/5 rounded-full blur-[80px] md:blur-[100px] z-0" />

              {/* Floating Bubble Matrix - Responsive Architecture */}
              <div className="relative z-10 w-full h-full flex flex-col md:block items-center gap-6 md:gap-0">
                {[
                  { label: t("Youth Engaged", "شباب مشاركون"), val: "15k+", pos: "md:top-[10%] md:left-[5%] lg:left-[10%]", color: "bg-blue-500/10", icon: Users, delay: 0 },
                  { label: t("Policies Drafted", "سياسات مقترحة"), val: "450", pos: "md:top-[35%] md:left-[50%] lg:left-[55%]", color: "bg-gold/10", icon: FileText, delay: 1.5 },
                  { label: t("Impact Score", "معدل التأثير"), val: "94%", pos: "md:top-[70%] md:left-[10%] lg:left-[15%]", color: "bg-green-500/10", icon: ShieldAlert, delay: 3 },
                ].map((card, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ 
                      y: [0, -15, 0],
                    }}
                    transition={{
                      duration: 4 + idx,
                      repeat: Infinity,
                      delay: card.delay,
                      ease: "easeInOut"
                    }}
                    className={`relative md:absolute p-4 md:p-6 rounded-3xl ${card.color} ${card.pos} backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-4 z-10 w-fit min-w-[180px] md:min-w-0 mx-auto md:mx-0`}
                  >
                    <div className="p-3 rounded-2xl bg-white/20 dark:bg-charcoal/30 flex-shrink-0">
                      <card.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl md:text-3xl font-black font-display text-foreground">{card.val}</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground uppercase font-bold tracking-widest">{card.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Community Section */}
      <section className="py-24 px-4 bg-[#25D366]/5 relative overflow-hidden border-t border-[#25D366]/20">
        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#25D366]/10 rounded-full blur-[100px] z-0" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 bg-[#25D366] rounded-3xl flex items-center justify-center shadow-lg shadow-[#25D366]/30 mb-8"
          >
            <MessageCircle className="w-9 h-9 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-black text-foreground mb-6"
          >
            {t("Join the Community on WhatsApp", "انضم إلى مجتمعنا على واتساب")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
          >
            {t(
              "Our community is fully active on WhatsApp! Connect with hundreds of other Moroccan youth, join live discussions, vote on real-time crisis scenarios, and coordinate your ministerial efforts directly.",
              "مجتمعنا نشط بالكامل على واتساب! تواصل مع المئات من الشباب المغربي الآخر، وانضم إلى النقاشات المباشرة، وصوت على سيناريوهات الأزمات في الوقت الفعلي."
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <a
              href={communityLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-[#25D366] text-white text-xl font-bold px-12 py-5 rounded-[2rem] shadow-[0_8px_0_#1DA851] hover:shadow-[0_6px_0_#1DA851] active:shadow-none active:translate-y-[8px] hover:translate-y-[2px] transition-all transform duration-150 group"
            >
              <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              {t("Join WhatsApp Community", "انضم لمجتمع الواتساب")}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Press & Media Section */}
      <section className="py-24 px-4 bg-background relative overflow-hidden border-t border-border/50">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center lg:text-start mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-display font-black text-foreground mb-4"
            >
              {t("Press & Media", "الصحافة وآخر الأخبار")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-base md:text-lg"
            >
              {t("Stay informed with updates from our national chambers and platform announcements.", "ابقَ على اطلاع بآخر التحديثات من غرفنا الوطنية وإعلانات المنصة.")}
            </motion.p>
          </div>

          {!articlesData?.articles || articlesData.articles.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {t("No press coverage available at the moment.", "لا توجد تغطية صحفية متاحة حالياً.")}
            </div>
          ) : (
            <div className="divide-y divide-border/50 border-t border-b border-border/50">
              {articlesData.articles.slice(0, 4).map((article: any, idx: number) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * idx }}
                >
                  <Link href={`/press/${article.id}`}>
                    <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-2 py-0.5 rounded-full">
                            {t(article.category === "simulation" ? "Simulation" : "Platform", article.category === "simulation" ? "محاكاة" : "إعلان")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(article.createdAt).toLocaleDateString(isAr ? 'ar-MA' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black font-display text-foreground group-hover:text-gold transition-colors duration-350 leading-tight">
                          {isAr ? article.titleAr : article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed line-clamp-2">
                          {isAr ? article.summaryAr : article.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-gold font-bold text-sm shrink-0 self-end md:self-center transition-transform duration-300 group-hover:translate-x-2">
                        <span>{t("Read Release", "اقرأ الخبر")}</span>
                        <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Civic Polls Section */}
      <section className="py-24 px-4 bg-secondary/5 relative overflow-hidden border-t border-border/50">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center lg:text-start mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-display font-black text-foreground mb-4"
            >
              {t("Civic Polls", "الاستطلاعات المدنية")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-base md:text-lg"
            >
              {t("Participate in active public opinion voting to direct policy decisions in the simulation.", "شارك في استطلاعات الرأي العام النشطة لتوجيه قرارات السياسة في المحاكاة.")}
            </motion.p>
          </div>

          {!pollsData?.polls || pollsData.polls.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {t("No active polls at the moment. Check back soon!", "لا توجد استطلاعات نشطة حالياً. عد قريباً!")}
            </div>
          ) : (
            <div className="space-y-6">
              {pollsData.polls.slice(0, 3).map((poll: any, idx: number) => {
                const totalVotesVal = poll.totalVotes || 0;
                return (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 * idx }}
                  >
                    <Link href={`/polls/${poll.id}`}>
                      <div className="p-8 rounded-[2rem] border border-border/50 bg-card hover:border-gold/30 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1 space-y-3 w-full">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                              {t("Active Poll", "تصويت نشط")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {totalVotesVal} {t("Votes cast", "أصوات")}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold font-display text-foreground group-hover:text-gold transition-colors leading-tight">
                            {isAr ? poll.titleAr : poll.title}
                          </h3>
                          <div className="w-full h-1.5 bg-secondary/35 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: totalVotesVal > 0 ? "65%" : "0%" }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gold font-bold text-sm shrink-0 self-end md:self-center transition-transform duration-300 group-hover:translate-x-2">
                          <span>{t("Cast Vote", "صوّت الآن")}</span>
                          <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 left-6 md:bottom-8 md:left-8 z-50 p-3 rounded-full bg-primary/80 hover:bg-primary text-white border border-white/10 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in-95 flex items-center justify-center"
          title={t("Scroll to Top", "الرجوع للأعلى")}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
