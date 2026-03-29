import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button } from "@/components/ui-custom";
import { useGetEvents } from "@workspace/api-client-react";
import { Calendar as CalendarIcon, Video, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Events() {
  const { t, isAr } = useLanguage();
  const { data: eventsData } = useGetEvents({ upcoming: true });

  const events = eventsData?.events || [];

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {t("Simulation Events", "أحداث المحاكاة")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("Join live parliamentary sessions, workshops, and high-level summits.", "انضم إلى الجلسات البرلمانية الحية وورش العمل ومؤتمرات القمة رفيعة المستوى.")}
          </p>
        </div>

        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{t("No upcoming events scheduled.", "لا توجد أحداث قادمة مجدولة.")}</p>
            </Card>
          ) : (
            events.map(event => {
              const eventDate = new Date(event.startAt);
              return (
                <Card key={event.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center hover:border-primary/50 transition-colors">
                  <div className="bg-secondary text-primary w-full md:w-32 h-32 rounded-2xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-sm font-bold uppercase">{format(eventDate, 'MMM')}</span>
                    <span className="text-4xl font-display font-bold">{format(eventDate, 'dd')}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="gold">{event.type.replace('_', ' ').toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {format(eventDate, 'h:mm a')}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{isAr ? event.titleAr : event.title}</h3>
                    <p className="text-muted-foreground mb-4">{isAr ? event.descriptionAr : event.description}</p>
                  </div>
                  
                  <div className="w-full md:w-auto shrink-0">
                    {event.meetingUrl ? (
                      <a href={event.meetingUrl} target="_blank" rel="noreferrer">
                        <Button variant="primary" className="w-full gap-2">
                          <Video className="w-4 h-4" /> {t("Join Link", "رابط الانضمام")}
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        {t("Link Pending", "الرابط قريباً")}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
