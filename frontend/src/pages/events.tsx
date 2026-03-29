import { useState, useMemo } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button, Input } from "@/components/ui-custom";
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
  ArrowRight,
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

  const filteredEvents = events.filter(event => {
    const title = isAr ? event.titleAr : event.title;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.startAt), day));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-slate-500 font-bold animate-pulse">{t("Syncing Simulation Calendar...", "جاري مزامنة تقويم المحاكاة...")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* High-End Header */}
      <div className="bg-slate-950 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -ml-32 -mb-32" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary rounded-lg text-white mb-8 text-xs font-black tracking-widest uppercase shadow-lg shadow-primary/20"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                {t("National Legislative Calendar", "التقويم التشريعي الوطني")}
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-8 tracking-tight leading-[1.05]">
                {t("The Grand Simulation Agenda", "أجندة المحاكاة الكبرى")}
              </h1>
              <div className="flex flex-wrap gap-8 text-slate-400 font-bold text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white text-lg">{events.length}</p>
                    <p className="text-[10px] uppercase tracking-tighter">{t("Scheduled Sessions", "الجلسات المجدولة")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white text-lg">{events.filter(e => !!e.meetingUrl).length}</p>
                    <p className="text-[10px] uppercase tracking-tighter">{t("Live Broadcasts", "بث مباشر")}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 w-full lg:w-auto">
              <div className="flex items-center p-1.5 bg-white/5 rounded-2xl border border-white/10 self-end lg:self-auto backdrop-blur-md">
                 <button 
                  onClick={() => setViewMode("agenda")}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'agenda' ? 'bg-white text-slate-950 shadow-xl' : 'text-white/60 hover:text-white'}`}
                 >
                   <List className="w-4 h-4" /> {t("Agenda", "الأجندة")}
                 </button>
                 <button 
                  onClick={() => setViewMode("calendar")}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-950 shadow-xl' : 'text-white/60 hover:text-white'}`}
                 >
                   <LayoutGrid className="w-4 h-4" /> {t("Calendar", "التقويم")}
                 </button>
              </div>
              
              <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder={t("Locate an event...", "تحديد موقع حدث...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-[20px] text-white placeholder:text-white/20 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <AnimatePresence mode="wait">
          {viewMode === "agenda" ? (
            <motion.div 
              key="agenda"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid gap-8">
                {filteredEvents.length === 0 ? (
                  <Card className="p-32 text-center bg-white rounded-[48px] border-none shadow-2xl shadow-slate-200/50">
                    <CalendarIcon className="w-20 h-20 mx-auto mb-6 text-slate-200" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t("Nothing in the Pipeline", "لا يوجد شيء في المتناول")}</h3>
                    <p className="text-slate-500 font-medium">{t("No events match your current journalistic inquiry.", "لا توجد أحداث تتطابق مع استفسارك الصحفي الحالي.")}</p>
                  </Card>
                ) : (
                  filteredEvents.map((event, idx) => {
                    const eventDate = new Date(event.startAt);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="group p-0 overflow-hidden rounded-[40px] border-none bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col md:flex-row h-full lg:h-56">
                          <div className="bg-slate-50 w-full md:w-56 h-48 md:h-full flex flex-col items-center justify-center shrink-0 border-r border-slate-100 group-hover:bg-primary/5 transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{format(eventDate, 'MMMM')}</span>
                            <span className="text-6xl font-display font-black text-slate-900 group-hover:text-primary transition-colors leading-none">{format(eventDate, 'dd')}</span>
                            <span className="text-[10px] font-black text-slate-400 mt-2">{format(eventDate, 'EEEE')}</span>
                          </div>
                          
                          <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                              <Badge className="bg-primary/10 text-primary border-none rounded-lg px-3 text-[10px] font-black uppercase tracking-widest">{event.type}</Badge>
                              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" />
                                {format(eventDate, 'h:mm a')}
                              </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight tracking-tight group-hover:text-primary transition-colors">
                              {isAr ? event.titleAr : event.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-8 text-slate-500 text-sm font-bold">
                               <div className="flex items-center gap-2">
                                 <MapPin className="w-4 h-4 text-primary" />
                                 {t("National Assembly Hall", "قاعة المجلس الوطني")}
                               </div>
                               <div className="flex items-center gap-2">
                                 <Users className="w-4 h-4 text-primary" />
                                 {t("Open Session", "جلسة مفتوحة")}
                               </div>
                            </div>
                          </div>
                          
                          <div className="p-8 md:p-10 flex items-center justify-center shrink-0">
                            {event.meetingUrl ? (
                              <a href={event.meetingUrl} target="_blank" rel="noreferrer" className="w-full">
                                <Button className="w-full lg:w-auto h-16 px-10 rounded-2xl gap-3 shadow-xl shadow-primary/20 text-lg font-black">
                                  <Video className="w-6 h-6" /> {t("Join Briefing", "انضم للإيجاز")}
                                </Button>
                              </a>
                            ) : (
                              <div className="px-8 py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t("Link Pending", "الرابط قيد الانتظار")}</p>
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
              className="bg-white rounded-[48px] shadow-2xl shadow-slate-200/50 p-10 border border-white"
            >
              {/* Calendar Header Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                    <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">{t("Legislative Cycle", "الدورة التشريعية")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <Button variant="ghost" onClick={prevMonth} className="w-12 h-12 p-0 rounded-xl hover:bg-white hover:shadow-md">
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" onClick={() => setCurrentDate(new Date())} className="px-6 h-12 font-black text-xs uppercase tracking-widest hover:bg-white hover:shadow-md">
                    {t("Today", "اليوم")}
                  </Button>
                  <Button variant="ghost" onClick={nextMonth} className="w-12 h-12 p-0 rounded-xl hover:bg-white hover:shadow-md">
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pb-6">{day}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 border-t border-l border-slate-50 rounded-3xl overflow-hidden">
                {calendarDays.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  
                  return (
                    <div 
                      key={day.toISOString()}
                      className={`min-h-[160px] p-4 border-r border-b border-slate-50 transition-colors ${
                        isCurrentMonth ? "bg-white" : "bg-slate-50/50 opacity-40"
                      } ${idx < 7 ? "pt-6" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                          isToday(day) 
                            ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" 
                            : "text-slate-900"
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/20" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {dayEvents.slice(0, 3).map(event => (
                          <div 
                            key={event.id}
                            className="p-2.5 bg-primary/5 hover:bg-primary/10 rounded-xl border-l-2 border-primary transition-all group cursor-pointer"
                          >
                            <p className="text-[10px] font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-primary">
                              {isAr ? event.titleAr : event.title}
                            </p>
                            <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase mt-1">
                               <Clock className="w-2.5 h-2.5 opacity-50" />
                               {format(new Date(event.startAt), 'h:mm a')}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[10px] font-black text-primary px-1 mt-1">+{dayEvents.length - 3} {t("More", "أكثر")}</p>
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

      {/* Corporate Sidebar Widget / Floating CTA */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed bottom-12 right-12 z-50 flex flex-col gap-4"
      >
        <Card className="p-6 bg-slate-950 text-white rounded-[32px] border-none shadow-2xl shadow-slate-900/40 w-64 hidden xl:block">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Simulation Active", "المحاكاة نشطة")}</p>
           </div>
           <p className="text-sm font-medium mb-6 leading-relaxed">
             {t("All events follow the Standard Simulation Time (SST). Join 15m early for technical sync.", "تتبع جميع الأحداث توقيت المحاكاة القياسي (SST). انضم قبل 15 دقيقة للمزامنة الفنية.")}
           </p>
           <Link href="/dashboard">
             <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl h-12 font-black text-xs gap-2">
                <ExternalLink className="w-4 h-4" /> {t("Simulation Hub", "مركز المحاكاة")}
             </Button>
           </Link>
        </Card>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleCreateRequest}
            size="icon" 
            className="w-16 h-16 rounded-[24px] shadow-2xl shadow-primary/30 group bg-slate-950 hover:bg-slate-900 border border-white/10"
          >
             <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300 text-white" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
