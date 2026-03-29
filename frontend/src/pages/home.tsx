import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button, Card } from "@/components/ui-custom";
import { Link } from "wouter";
import { useGetPlatformStats } from "@workspace/api-client-react";
import { Users, FileText, Landmark, ShieldAlert, ArrowRight, Gavel, Briefcase, AlertCircle, Sparkles, Target, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { t, isAr } = useLanguage();
  const { data: stats } = useGetPlatformStats();
  const [activeFeature, setActiveFeature] = useState(1);

  const heroStyle = {
    backgroundImage: `linear-gradient(to right, rgba(13, 24, 40, 0.9), rgba(27, 42, 74, 0.8)), url('${import.meta.env.BASE_URL}images/hero-bg.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4 overflow-hidden" style={heroStyle}>
        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 text-gold-pale text-sm font-semibold uppercase tracking-wider"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            {t("Simulation Season 2 is Live", "الموسم الثاني من المحاكاة متاح الآن")}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight max-w-4xl text-balance"
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
            className="text-lg md:text-xl text-white/80 max-w-2xl mb-10"
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
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/apply">
              <Button variant="gold" size="lg" className="w-full sm:w-auto text-lg px-12 group">
                {t("Apply Now", "قدّم طلبك الآن")}
                <ArrowRight className={`ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 text-lg px-8">
                {t("How it Works", "كيف تعمل المنصة")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="glass-panel p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
            <div className="flex flex-col items-center">
              <Landmark className="w-8 h-8 text-primary mb-3" />
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {stats?.activeMinistries || 12}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {t("Active Ministries", "الوزارات النشطة")}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {stats?.billsPassed || 156}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {t("Bills Passed", "مشاريع القوانين")}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-primary mb-3" />
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {stats?.activeMembers || "1,204"}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {t("Active Members", "الأعضاء النشطين")}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <ShieldAlert className="w-8 h-8 text-destructive mb-3" />
              <div className="text-3xl font-display font-bold text-destructive mb-1">
                {stats?.activeCrises || 2}
              </div>
              <div className="text-sm text-destructive/80 font-medium uppercase tracking-wide">
                {t("Active Crises", "الأزمات النشطة")}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Immersive Feature Showcase */}
      <section className="py-24 px-4 bg-background relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-gold/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
            >
              {t("Experience the Simulation", "عش تجربة المحاكاة")}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-2xl mx-auto text-lg"
            >
              {t("Immerse yourself in a fully functional replica of the Moroccan governance system.", "انغمس في نسخة تفاعلية كاملة من نظام الحوكمة المغربي.")}
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[600px] w-full items-stretch">
            {[
              {
                id: 0,
                title: t("Parliamentary Debates", "النقاشات البرلمانية"),
                shortDesc: t("Legislative Process", "العملية التشريعية"),
                fullDesc: t(
                  "Draft, debate, and vote on legislation mirroring real-world issues. Experience the checks and balances of parliamentary life.",
                  "صياغة ومناقشة والتصويت على التشريعات التي تعكس قضايا العالم الحقيقي. عِش تجربة توازنات الحياة البرلمانية."
                ),
                icon: Gavel,
                img: "parliament.png",
                color: "from-blue-900/40 to-blue-800/20"
              },
              {
                id: 1,
                title: t("Ministerial Portfolios", "الحقائب الوزارية"),
                shortDesc: t("Policy Management", "إدارة السياسات"),
                fullDesc: t(
                  "Take charge of a specific sector, manage budgets, and implement policies that shape the future of the nation.",
                  "تولى مسؤولية قطاع معين، أدر الميزانيات، ونفذ السياسات التي تشكل مستقبل الأمة."
                ),
                icon: Briefcase,
                img: "hero-bg.png",
                color: "from-gold/40 to-yellow-900/20"
              },
              {
                id: 2,
                title: t("Crisis Management", "إدارة الأزمات"),
                shortDesc: t("Emergency Response", "الاستجابة للطوارئ"),
                fullDesc: t(
                  "Respond to unexpected national emergencies injected by Game Masters. Test your leadership under pressure.",
                  "استجب لحالات الطوارئ الوطنية غير المتوقعة من قبل مديري المحاكاة. اختبر قيادتك تحت الضغط."
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
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  className={`relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out border border-white/10 group ${
                    isActive ? 'flex-[3] shadow-2xl shadow-primary/10' : 'flex-1 hover:bg-white/5 opacity-80'
                  }`}
                  transition={{ layout: { duration: 0.6, type: "spring", stiffness: 100, damping: 20 } }}
                >
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 z-0 scale-110 group-hover:scale-100 transition-transform duration-[3000ms]">
                    <img 
                      src={`${import.meta.env.BASE_URL}images/${feature.img}`} 
                      alt={feature.title} 
                      className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} via-background/80 to-transparent opacity-90`} />
                  </div>

                  {/* Content Container */}
                  <div className={`relative z-10 h-full p-8 flex ${isActive ? 'flex-col justify-end' : 'flex-col items-center justify-center'}`}>
                    <motion.div 
                      layout="position"
                      className={`mb-4 p-4 rounded-2xl ${isActive ? 'bg-gold/20' : 'bg-white/5'} backdrop-blur-md border border-white/10 transition-colors duration-500`}
                    >
                      <Icon className={`w-8 h-8 ${isActive ? 'text-gold' : 'text-white/60'}`} />
                    </motion.div>

                    <motion.h3 
                      layout="position"
                      className={`font-display font-bold text-white transition-all duration-500 ${
                        isActive ? 'text-3xl mb-4' : 'text-xl rotate-0 lg:-rotate-90 lg:whitespace-nowrap'
                      }`}
                    >
                      {feature.title}
                    </motion.h3>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.4 }}
                        >
                          <p className="text-gold-pale/80 font-medium mb-3 uppercase tracking-wider text-sm">
                            {feature.shortDesc}
                          </p>
                          <p className="text-white/80 leading-relaxed max-w-md text-lg">
                            {feature.fullDesc}
                          </p>
                          
                          <Link href="/about">
                            <Button variant="ghost" className="mt-8 text-gold hover:text-gold hover:bg-gold/10 px-0 group/btn">
                              {t("Learn More", "اكتشف المزيد")}
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

      {/* Interactive Leadership Journey Section */}
      <section className="py-24 px-4 bg-secondary/30 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-gold/30 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex p-3 rounded-2xl bg-gold/10 text-gold mb-4"
            >
            </motion.div> */}
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

            <div className="flex-1 relative h-[400px] w-full max-w-lg mt-12 lg:mt-0">
              {/* Floating Bubble Cards */}
              {[
                { label: t("Youth Engaged", "شباب مشاركون"), val: "15k+", top: "10%", left: "10%", color: "bg-blue-500/10", icon: Users, delay: 0 },
                { label: t("Policies Drafted", "سياسات مقترحة"), val: "450", top: "35%", left: "55%", color: "bg-gold/10", icon: FileText, delay: 1.5 },
                { label: t("Impact Score", "معدل التأثير"), val: "94%", top: "70%", left: "15%", color: "bg-green-500/10", icon: ShieldAlert, delay: 3 },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  animate={{ 
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4 + idx,
                    repeat: Infinity,
                    delay: card.delay,
                    ease: "easeInOut"
                  }}
                  className={`absolute p-5 rounded-3xl ${card.color} backdrop-blur-xl border border-white/20 shadow-xl flex items-center gap-4 z-10`}
                  style={{ top: card.top, left: card.left }}
                >
                  <div className="p-3 rounded-2xl bg-white/20 dark:bg-charcoal/30">
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-display text-foreground">{card.val}</div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap uppercase tracking-wider">{card.label}</div>
                  </div>
                </motion.div>
              ))}
              
              {/* Decorative Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/10 rounded-full blur-[100px] z-0" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
