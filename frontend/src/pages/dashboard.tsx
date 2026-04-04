import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button } from "@/components/ui-custom";
import { useGetCrises, useGetPolls } from "@workspace/api-client-react";
import { AlertTriangle, Vote, MessageSquare, Calendar, User as UserIcon } from "lucide-react";
import { Link, Redirect } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, isAr } = useLanguage();
  const { data: crisesData } = useGetCrises({ query: { enabled: !isLoading && isAuthenticated } } as any);
  const { data: pollsData } = useGetPolls({ query: { enabled: !isLoading && isAuthenticated } } as any);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Redirect to="/login" />;

  const activeCrises = crisesData?.crises.filter(c => c.isActive) || [];
  const activePolls = pollsData?.polls.filter(p => p.status === "active") || [];

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary mb-2">
              {t("Welcome, ", "مرحباً، ")} {isAr && user?.fullNameAr ? user.fullNameAr : user?.fullName}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("Simulation Dashboard", "لوحة تحكم المحاكاة")}
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant={user?.applicationStatus === "approved" ? "gold" : "outline"} className="text-sm px-4 py-1">
              {t("Status: ", "الحالة: ")} {user?.applicationStatus?.toUpperCase()}
            </Badge>
            {user?.simulationRole && (
              <Badge variant="default" className="text-sm px-4 py-1">
                {t("Role: ", "الدور: ")} {user.simulationRole}
              </Badge>
            )}
          </div>
        </div>

        {/* Active Crises Alert */}
        {activeCrises.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle /> {t("Active Crises", "الأزمات النشطة")}
            </h2>
            {activeCrises.map(crisis => (
              <Card key={crisis.id} className="border-l-4 border-l-destructive bg-destructive/5 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="destructive" className="mb-2">{crisis.severity.toUpperCase()}</Badge>
                    <h3 className="text-xl font-bold mb-2">{isAr ? crisis.titleAr : crisis.title}</h3>
                    <p className="text-muted-foreground">{isAr ? crisis.descriptionAr : crisis.description}</p>
                  </div>
                  <Link href="/community">
                    <Button variant="danger" size="sm">{t("Discuss Strategy", "ناقش الاستراتيجية")}</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold">{t("Active Polls", "التصويتات النشطة")}</h2>
            {activePolls.length > 0 ? (
              <div className="grid gap-4">
                {activePolls.map(poll => (
                  <Card key={poll.id} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">{isAr ? poll.titleAr : poll.title}</h3>
                      <Badge variant="gold">{t("Active", "نشط")}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-6">{poll.description}</p>
                    <Link href={`/polls/${poll.id}`}>
                      <Button variant="outline" className="w-full gap-2">
                        <Vote className="w-4 h-4" /> {t("Cast Your Vote", "أدل بصوتك")}
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                {t("No active polls at the moment.", "لا توجد تصويتات نشطة حالياً.")}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("Quick Actions", "إجراءات سريعة")}</h2>
            <Link href="/community" className="block">
              <Card className="p-6 hover:bg-secondary/50 transition-colors cursor-pointer group">
                <MessageSquare className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-1">{t("Parliament Forum", "منتدى البرلمان")}</h3>
                <p className="text-sm text-muted-foreground">{t("Join the latest policy debates", "انضم لأحدث مناقشات السياسات")}</p>
              </Card>
            </Link>
            <Link href="/events" className="block">
              <Card className="p-6 hover:bg-secondary/50 transition-colors cursor-pointer group">
                <Calendar className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-1">{t("Upcoming Sessions", "الجلسات القادمة")}</h3>
                <p className="text-sm text-muted-foreground">{t("View schedule and join live", "شاهد الجدول وانضم للبث")}</p>
              </Card>
            </Link>
            <Link href="/profile" className="block">
              <Card className="p-6 bg-primary/5 hover:bg-primary/10 border-primary/20 transition-all cursor-pointer group rounded-[28px] shadow-lg shadow-primary/5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                   <UserIcon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg mb-1">{t("Civic Identity", "الهوية المدنية")}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("Manage Profile & Media", "إدارة الملف الشخصي والوسائط")}</p>
              </Card>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
