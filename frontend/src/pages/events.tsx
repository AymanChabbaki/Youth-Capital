import { useState, useMemo } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button, Input, PageHero, HeroStat } from "@/components/ui-custom";
import { useGetEvents } from "@workspace/api-client-react";
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  Search,
  MapPin,
  Users,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Events() {
  const { t, isAr } = useLanguage();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"agenda" | "calendar">("agenda");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateRequest = () => {
    toast({
      title: t("Legislative Scheduling", "الجدولة التشريعية"),
      description: t("Event creation is reserved for Simulation Administrators. Submit your proposal via the Support Portal.", "إنشاء الأحداث محجوز لمديري المحاكاة. قدم مقترحك عبر بوابة الدعم."),
    });
  };

  const { data: eventsData, isLoading } = useGetEvents();
  const events = eventsData?.events || [];

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const filteredEvents = events.filter((event: any) => {
    const title = isAr ? event.titleAr : event.title;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getEventsForDay = (day: Date) => {
    return events.filter((event: any) => isSameDay(new Date(event.startAt), day));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-muted-foreground font-bold animate-pulse text-sm uppercase tracking-widest">
          {t("Syncing Simulation Calendar...", "جاري مزامنة تقويم المحاكاة...")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHero
        compact
        eyebrow={t("National Legislative Calendar", "التقويم التشريعي الوطني")}
        title={t("The Grand", "أجندة المحاكاة")}
        highlight={t("Simulation Agenda", "الكبرى")}
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="flex flex-wrap gap-8 sm:gap-14">
            <HeroStat label={t("Scheduled Sessions", "الجلسات المجدولة")} value={events.length} accent />
            <HeroStat label={t("Live Broadcasts", "بث مباشر")} value={events.filter((e: any) => !!e.meetingUrl).length} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex items-center p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md w-fit">
              <button
                onClick={() => setViewMode("agenda")}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === "agenda" ? "bg-gold text-navy-dark shadow-xl shadow-gold/20" : "text-white/60 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" /> {t("Agenda", "الأجندة")}
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === "calendar" ? "bg-gold text-navy-dark shadow-xl shadow-gold/20" : "text-white/60 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> {t("Calendar", "التقويم")}
              </button>
            </div>

            <div className="relative group min-w-[260px]">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-gold transition-colors z-10" />
              <Input
                placeholder={t("Locate an event...", "تحديد موقع حدث...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-12 h-[52px] bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-gold/40 focus-visible:bg-white/10 transition-all font-bold"
              />
            </div>
          </div>
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 relative z-20">
        <AnimatePresence mode="wait">
          {viewMode === "agenda" ? (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid gap-6">
                {filteredEvents.length === 0 ? (
                  <Card className="p-24 md:p-32 text-center rounded-[3rem] border border-border/40 shadow-2xl shadow-navy/5">
                    <CalendarIcon className="w-20 h-20 mx-auto mb-6 text-muted-foreground/20" />
                    <h3 className="text-2xl font-display font-black text-foreground mb-2">{t("Nothing in the Pipeline", "لا يوجد شيء في المتناول")}</h3>
                    <p className="text-muted-foreground">{t("No events match your current journalistic inquiry.", "لا توجد أحداث تتطابق مع استفسارك الصحفي الحالي.")}</p>
                  </Card>
                ) : (
                  filteredEvents.map((event: any, idx: number) => {
                    const eventDate = new Date(event.startAt);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                      >
                        <Card className="group p-0 overflow-hidden rounded-[2.5rem] border border-border/40 hover:border-gold/40 hover:shadow-2xl hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-500 flex flex-col md:flex-row h-full lg:h-56">
                          {/* Date Block */}
                          <div className="bg-navy-dark w-full md:w-56 h-48 md:h-full flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-gold opacity-25" />
                            <span className="relative text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-2">{format(eventDate, "MMMM")}</span>
                            <span className="relative text-6xl font-display font-black text-white group-hover:text-gradient-gold transition-colors leading-none">{format(eventDate, "dd")}</span>
                            <span className="relative text-[10px] font-black text-white/40 mt-2 uppercase tracking-widest">{format(eventDate, "EEEE")}</span>
                          </div>

                          <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                              <Badge variant="gold" className="rounded-lg px-3 text-[10px] font-black uppercase tracking-widest">{event.type}</Badge>
                              <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5 text-gold" />
                                {format(eventDate, "h:mm a")}
                              </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-display font-black text-foreground mb-4 leading-tight tracking-tight group-hover:text-gold transition-colors">
                              {isAr ? event.titleAr : event.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-8 text-muted-foreground text-sm font-bold">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gold" />
                                {t("National Assembly Hall", "قاعة المجلس الوطني")}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gold" />
                                {t("Open Session", "جلسة مفتوحة")}
                              </div>
                            </div>
                          </div>

                          <div className="p-8 md:p-10 flex items-center justify-center shrink-0">
                            {event.meetingUrl ? (
                              <a href={event.meetingUrl} target="_blank" rel="noreferrer" className="w-full">
                                <Button variant="gold" className="w-full lg:w-auto h-16 px-10 rounded-2xl gap-3 text-lg font-black">
                                  <Video className="w-6 h-6" /> {t("Join Briefing", "انضم للإيجاز")}
                                </Button>
                              </a>
                            ) : (
                              <div className="px-8 py-4 bg-secondary/30 rounded-2xl border border-dashed border-border">
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest text-center">{t("Link Pending", "الرابط قيد الانتظار")}</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card rounded-[3rem] shadow-2xl shadow-navy/5 p-6 md:p-10 border border-border/40"
            >
              {/* Calendar Header Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-4">
                  <div className="bg-gold/10 w-16 h-16 rounded-3xl flex items-center justify-center text-gold">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-black text-foreground tracking-tight">{format(currentDate, "MMMM yyyy")}</h2>
                    <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">{t("Legislative Cycle", "الدورة التشريعية")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-secondary/30 rounded-2xl border border-border/40">
                  <Button variant="ghost" onClick={prevMonth} className="w-12 h-12 p-0 rounded-xl hover:bg-card hover:shadow-md">
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" onClick={() => setCurrentDate(new Date())} className="px-6 h-12 font-black text-xs uppercase tracking-widest hover:bg-card hover:shadow-md">
                    {t("Today", "اليوم")}
                  </Button>
                  <Button variant="ghost" onClick={nextMonth} className="w-12 h-12 p-0 rounded-xl hover:bg-card hover:shadow-md">
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pb-6">{day}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 border-t border-s border-border/30 rounded-3xl overflow-hidden">
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[120px] md:min-h-[160px] p-2 md:p-4 border-e border-b border-border/30 transition-colors ${
                        isCurrentMonth ? "bg-card hover:bg-gold/[0.03]" : "bg-secondary/20 opacity-40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                          isToday(day)
                            ? "bg-gold text-navy-dark shadow-lg shadow-gold/30 scale-110"
                            : "text-foreground"
                        }`}>
                          {format(day, "d")}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="w-2 h-2 bg-gold rounded-full animate-pulse shadow-lg shadow-gold/20" />
                        )}
                      </div>

                      <div className="space-y-2">
                        {dayEvents.slice(0, 3).map((event: any) => (
                          <div
                            key={event.id}
                            className="p-2.5 bg-gold/5 hover:bg-gold/15 rounded-xl border-s-2 border-gold transition-all group cursor-pointer"
                          >
                            <p className="text-[10px] font-bold text-foreground line-clamp-1 leading-tight group-hover:text-gold">
                              {isAr ? event.titleAr : event.title}
                            </p>
                            <div className="flex items-center gap-1 text-[8px] font-black text-muted-foreground uppercase mt-1">
                              <Clock className="w-2.5 h-2.5 opacity-50" />
                              {format(new Date(event.startAt), "h:mm a")}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[10px] font-black text-gold px-1 mt-1">+{dayEvents.length - 3} {t("More", "أكثر")}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Info Widget + CTA */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed bottom-12 right-12 z-40 flex flex-col gap-4 items-end"
      >
        <Card className="p-6 bg-navy-dark text-white rounded-[2rem] border border-white/10 shadow-2xl shadow-navy/40 w-64 hidden xl:block relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-gold opacity-20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 bg-gold rounded-full animate-ping" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{t("Simulation Active", "المحاكاة نشطة")}</p>
            </div>
            <p className="text-sm font-medium mb-6 leading-relaxed text-white/80">
              {t("All events follow the Standard Simulation Time (SST). Join 15m early for technical sync.", "تتبع جميع الأحداث توقيت المحاكاة القياسي (SST). انضم قبل 15 دقيقة للمزامنة الفنية.")}
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl h-12 font-black text-xs gap-2">
                <ExternalLink className="w-4 h-4" /> {t("Simulation Hub", "مركز المحاكاة")}
              </Button>
            </Link>
          </div>
        </Card>

        <Button
          onClick={handleCreateRequest}
          size="icon"
          className="w-16 h-16 rounded-3xl shadow-2xl shadow-gold/30 group bg-navy-dark hover:bg-navy border border-gold/30"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300 text-gold" />
        </Button>
      </motion.div>
    </div>
  );
}
