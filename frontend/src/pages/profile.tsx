import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Card, Button, Input, Badge, Textarea, Select } from "@/components/ui-custom";
import { useUpdateUser } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Camera, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Globe, 
  ArrowLeft,
  CloudUpload,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

const MOROCCAN_REGIONS = [
  "Tanger-Tétouan-Al Hoceïma",
  "L'Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab",
  "Moroccan Diaspora / الجالية المغربية",
];

export default function Profile() {
  const { user } = useAuth();
  const { t, isAr } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    fullNameAr: user?.fullNameAr || "",
    bio: user?.bio || "",
    region: user?.region || ""
  });
  
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  
  const updateUserMutation = useUpdateUser();

  // Sync state with user data when it changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        fullNameAr: user.fullNameAr || "",
        bio: user.bio || "",
        region: user.region || ""
      });
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check Cloudinary Credentials
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName === "your_cloud_name" || !cloudName || !uploadPreset) {
      toast({
        title: t("Cloud Identity Offline", "هوية السحابة غير متصلة"),
        description: t(`Please ensure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set in your environment.`, `يرجى التأكد من تعيين VITE_CLOUDINARY_CLOUD_NAME و VITE_CLOUDINARY_UPLOAD_PRESET في بيئتك.`),
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Cloudinary Error Log:", data);
        throw new Error(data.error?.message || "Uplink rejected");
      }

      if (data.secure_url) {
        setAvatarUrl(data.secure_url);
        
        // Auto-save the new avatar to the database
        updateUserMutation.mutate({
          id: user.id,
          data: {
            ...formData,
            avatarUrl: data.secure_url
          }
        });

        toast({
          title: t("Identity Synchronized", "تمت مزامنة الهوية"),
          description: t("Your profile picture has been processed at HQ.", "تمت معالجة صورة ملفك الشخصي في المقر الرئيسي."),
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: t("Uplink Failure", "فشل الارتباط الصاعد"),
        description: t("The secure connection to the media server timed out.", "انتهت مهلة الاتصال الآمن بخادم الوسائط."),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    updateUserMutation.mutate({
      id: user.id,
      data: {
        ...formData,
        avatarUrl
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        toast({
          title: t("Profile Finalized", "تم الانتهاء من الملف الشخصي"),
          description: t("Your civic record has been updated across the network.", "تم تحديث سجلك المدني عبر الشبكة."),
        });
      },
      onError: () => {
        toast({
          title: t("Update Error", "خطأ في التحديث"),
          description: t("Something went wrong while synchronizing your identity.", "حدث خطأ ما أثناء مزامنة هويتك."),
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Identity Hero */}
      <div className="bg-slate-950 pt-32 pb-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] -mr-64 -mt-64" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white/60 hover:text-white mb-12 gap-2 -ml-4">
              <ArrowLeft className="w-4 h-4" /> {t("Back to Control Center", "العودة إلى مركز التحكم")}
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative group">
               <div className="w-48 h-48 rounded-[56px] bg-slate-900 border-4 border-white/5 overflow-hidden shadow-2xl relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.fullName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white/10 italic font-black text-4xl select-none">ID-PHOTO</div>
                  )}
                  
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-primary">
                       <Loader2 className="w-10 h-10 animate-spin mb-2" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{t("Syncing", "مزامنة")}</span>
                    </div>
                  )}
               </div>
               
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-4 -right-4 w-14 h-14 bg-primary text-white rounded-[20px] flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-110 transition-transform active:scale-95 border-4 border-slate-950"
               >
                 <Camera className="w-6 h-6" />
               </button>
               <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*" 
               />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <Badge className="bg-primary/20 text-primary border-none rounded-lg px-4 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10">
                  {user.role === 'admin' ? t("Platform Overseer", "مشرف المنصة") : t("Citizen Delegate", "مندوب مواطن")}
                </Badge>
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <Fingerprint className="w-3.5 h-3.5" />
                  ID: #{String(user.id).padStart(5, '0')}
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-4 tracking-tighter leading-none">
                {isAr ? user.fullNameAr || user.fullName : user.fullName}
              </h1>
              <p className="text-slate-400 font-bold max-w-xl text-lg flex items-center justify-center md:justify-start gap-4">
                 <Globe className="w-5 h-5 text-primary" />
                 {user.region || t("Unassigned Sector", "قطاع غير محدد")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Identity Editor */}
          <Card className="lg:col-span-2 p-10 md:p-14 rounded-[48px] border-none bg-white shadow-2xl shadow-slate-200/50">
             <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t("Civic Profile Data", "بيانات الملف الشخصي المدني")}</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t("HQ Records Department", "قسم السجلات بالمقر الرئيسي")}</p>
                </div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">{t("Official Name (Latin)", "الاسم الرسمي (لاتيني)")}</label>
                      <div className="relative group">
                         <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                         <Input 
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="pl-16 h-16 bg-slate-50 border-slate-100 rounded-[24px] font-bold focus-visible:ring-primary/20 focus-visible:bg-white transition-all"
                         />
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mr-2 text-right">{t("Official Name (Arabic)", "الاسم الرسمي (عربي)")}</label>
                      <div className="relative group dir-rtl">
                         <Input 
                            name="fullNameAr"
                            value={formData.fullNameAr}
                            onChange={handleInputChange}
                            placeholder="جون دو"
                            className="h-16 bg-slate-50 border-slate-100 rounded-[24px] font-bold text-right focus-visible:ring-primary/20 focus-visible:bg-white transition-all px-8"
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">{t("Civic Region / Sector", "المنطقة المدنية / القطاع")}</label>
                   <div className="relative group">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors z-10" />
                      <Select 
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="pl-16 h-16 bg-slate-50 border-slate-100 rounded-[24px] font-bold focus-visible:ring-primary/20 focus-visible:bg-white transition-all appearance-none"
                      >
                        <option value="">{t("Select a Region", "اختر جهة")}</option>
                        {MOROCCAN_REGIONS.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </Select>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">{t("Statement of Purpose / Bio", "بيان الغرض / السيرة الذاتية")}</label>
                   <Textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder={t("Briefly describe your journalistic or legislative focus within the simulation...", "صف بإيجاز تركيزك الصحفي أو التشريعي ضمن المحاكاة...")}
                      className="min-h-[160px] p-8 bg-slate-50 border-slate-100 rounded-[32px] font-bold focus-visible:ring-primary/20 focus-visible:bg-white transition-all resize-none leading-relaxed"
                   />
                </div>

                <div className="pt-6">
                   <Button 
                    type="submit" 
                    disabled={updateUserMutation.isPending}
                    className="w-full md:w-auto h-16 px-12 rounded-2xl gap-3 shadow-2xl shadow-primary/30 text-lg font-black"
                   >
                     {updateUserMutation.isPending ? (
                       <Loader2 className="w-6 h-6 animate-spin" />
                     ) : (
                       <CheckCircle2 className="w-6 h-6" />
                     )}
                     {t("Finalize Identity Updates", "الانتهاء من تحديثات الهوية")}
                   </Button>
                </div>
             </form>
          </Card>

          {/* Member Card Preview */}
          <div className="space-y-8 h-full flex flex-col justify-end">
             <div className="p-8 bg-slate-950 text-white rounded-[40px] shadow-2xl shadow-slate-900/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-16 -mt-16" />
                <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase mb-6 tracking-[0.3em]">
                   {t("Live Simulation Passport", "جواز سفر المحاكاة المباشر")}
                </Badge>
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden border border-white/10 shrink-0">
                      {avatarUrl ? (
                         <img src={avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-slate-800" />
                      )}
                   </div>
                   <div className="overflow-hidden">
                      <h4 className="font-black text-lg truncate leading-tight">{formData.fullName || "IDENT-000"}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.email}</p>
                   </div>
                </div>
                <div className="space-y-4 pt-6 border-t border-white/10">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">{t("Status", "الحالة")}</span>
                      <span className="text-green-500">{user.status}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">{t("Simulation Role", "دور المحاكاة")}</span>
                      <span className="text-white">{user.simulationRole || "MEMBER"}</span>
                   </div>
                </div>
                <CloudUpload className="absolute -bottom-6 -right-6 w-24 h-24 text-white/5 -rotate-12" />
             </div>

             <Card className="p-10 bg-white rounded-[40px] border-none shadow-2xl shadow-slate-200/40">
                <Mail className="w-10 h-10 text-primary mb-6" />
                <h4 className="text-xl font-black text-slate-900 mb-2">{t("Communications Hub", "مركز الاتصالات")}</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                   {t("Your official correspondences will be directed to your verified HQ address.", "سيتم توجيه مراسلاتك الرسمية إلى عنوان المقر الرئيسي الذي تم التحقق منه.")}
                </p>
                <p className="font-bold text-slate-900 select-all border-b border-primary/20 pb-2 mb-2">{user.email}</p>
             </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
