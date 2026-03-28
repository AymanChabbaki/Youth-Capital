import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useGetRoleApplications, useUpdateRoleApplication, useGetUsers, useTriggerCrisis } from "@workspace/api-client-react";
import { Card, Badge, Button, Input, Textarea, Select } from "@/components/ui-custom";
import { Redirect } from "wouter";
import { Shield, Users, FileCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const { isAdmin, isLoading } = useAuth();
  const { t, isAr } = useLanguage();
  const [activeTab, setActiveTab] = useState("applications");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appsData, refetch: refetchApps } = useGetRoleApplications({ status: "pending" });
  const { data: usersData } = useGetUsers();
  
  const updateAppMutation = useUpdateRoleApplication();
  const triggerCrisisMutation = useTriggerCrisis();

  const [crisisForm, setCrisisForm] = useState({ title: "", titleAr: "", description: "", descriptionAr: "", severity: "high" });

  if (isLoading) return null;
  if (!isAdmin) return <Redirect to="/" />;

  const handleApprove = async (id: number, role: string) => {
    await updateAppMutation.mutateAsync({ id, data: { status: "approved", assignedRole: role } });
    toast({ title: "Approved!" });
    refetchApps();
  };

  const handleCrisisSubmit = async () => {
    await triggerCrisisMutation.mutateAsync({ data: crisisForm as any });
    toast({ title: "Crisis Triggered!" });
    setCrisisForm({ title: "", titleAr: "", description: "", descriptionAr: "", severity: "high" });
  };

  return (
    <div className="min-h-screen bg-secondary/20 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-navy text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">{t("Platform Administration", "إدارة المنصة")}</h1>
            <p className="text-muted-foreground">{t("Manage users, applications, and simulation events.", "إدارة المستخدمين والطلبات وأحداث المحاكاة.")}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto pb-2">
          {[
            { id: "applications", icon: FileCheck, label: t("Applications", "الطلبات") },
            { id: "users", icon: Users, label: t("Users", "المستخدمين") },
            { id: "crises", icon: AlertTriangle, label: t("Crises", "الأزمات") }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "bg-card text-primary border-t border-x border-border shadow-[0_4px_0_0_hsl(var(--card))_max]" : "text-muted-foreground hover:bg-card/50"
              }`}
              style={activeTab === tab.id ? { transform: "translateY(1px)" } : {}}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            {appsData?.applications.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">{t("No pending applications.", "لا توجد طلبات معلقة.")}</Card>
            ) : (
              appsData?.applications.map(app => (
                <Card key={app.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{app.user?.fullName}</h3>
                      <p className="text-muted-foreground">{app.user?.email}</p>
                    </div>
                    <Badge variant="gold">{app.preferredRole.toUpperCase()}</Badge>
                  </div>
                  <div className="bg-secondary p-4 rounded-xl mb-4">
                    <p className="font-semibold mb-1">{t("Motivation:", "الدافع:")}</p>
                    <p className="text-sm italic text-muted-foreground">"{app.motivation}"</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                      {t("Reject", "رفض")}
                    </Button>
                    <Button variant="primary" onClick={() => handleApprove(app.id, app.preferredRole)}>
                      {t("Approve", "قبول")}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "users" && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="p-4">{t("Name", "الاسم")}</th>
                    <th className="p-4">{t("Role", "الدور")}</th>
                    <th className="p-4">{t("Status", "الحالة")}</th>
                    <th className="p-4">{t("Actions", "إجراءات")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersData?.users.map(user => (
                    <tr key={user.id} className="hover:bg-secondary/20">
                      <td className="p-4 font-medium">{user.fullName}</td>
                      <td className="p-4"><Badge variant="outline">{user.simulationRole || user.role}</Badge></td>
                      <td className="p-4">
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" className="text-destructive">Ban</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "crises" && (
          <Card className="p-8 max-w-2xl border-destructive/20 shadow-destructive/5">
            <h2 className="text-2xl font-bold text-destructive mb-6 flex items-center gap-2">
              <AlertTriangle /> {t("Trigger New Crisis", "إطلاق أزمة جديدة")}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">{t("Title (EN)", "العنوان (إنجليزي)")}</label>
                  <Input value={crisisForm.title} onChange={e => setCrisisForm({...crisisForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">{t("Title (AR)", "العنوان (عربي)")}</label>
                  <Input value={crisisForm.titleAr} onChange={e => setCrisisForm({...crisisForm, titleAr: e.target.value})} dir="rtl" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">{t("Description (EN)", "الوصف (إنجليزي)")}</label>
                <Textarea value={crisisForm.description} onChange={e => setCrisisForm({...crisisForm, description: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">{t("Severity", "الخطورة")}</label>
                <Select value={crisisForm.severity} onChange={e => setCrisisForm({...crisisForm, severity: e.target.value})}>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
              <Button variant="danger" className="w-full mt-4" onClick={handleCrisisSubmit} disabled={!crisisForm.title || triggerCrisisMutation.isPending}>
                {t("Broadcast Crisis to All Users", "بث الأزمة لجميع المستخدمين")}
              </Button>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
