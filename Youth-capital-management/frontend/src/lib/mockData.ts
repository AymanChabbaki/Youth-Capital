import { IdeaFull, IdeaPublic } from "../types/idea";

// ── Mock data — used automatically whenever VITE_API_BASE_URL is not set ──
// Shapes match the real API responses exactly, so removing this layer later
// is just flipping the env var back on.

export interface JihaInfo {
  code: string;
  name: string;
  members: number;
  ideasCount: number;
}

export const JIHAT: JihaInfo[] = [
  { code: "casablanca", name: "الدار البيضاء - سطات", members: 640, ideasCount: 14 },
  { code: "rabat", name: "الرباط - سلا - القنيطرة", members: 540, ideasCount: 11 },
  { code: "fes", name: "فاس - مكناس", members: 470, ideasCount: 9 },
  { code: "marrakech", name: "مراكش - آسفي", members: 410, ideasCount: 8 },
  { code: "tanger", name: "طنجة - تطوان - الحسيمة", members: 380, ideasCount: 7 },
  { code: "souss", name: "سوس - ماسة", members: 330, ideasCount: 6 },
  { code: "oriental", name: "الشرق", members: 260, ideasCount: 5 },
  { code: "benimellal", name: "بني ملال - خنيفرة", members: 220, ideasCount: 4 },
  { code: "draa", name: "درعة - تافيلالت", members: 170, ideasCount: 3 },
  { code: "guelmim", name: "كلميم - واد نون", members: 110, ideasCount: 2 },
  { code: "laayoune", name: "العيون - الساقية الحمراء", members: 95, ideasCount: 2 },
  { code: "dakhla", name: "الداخلة - وادي الذهب", members: 70, ideasCount: 1 },
];

export interface DepartmentInfo {
  id: string;
  name: string;
  desc: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  { id: "tech", name: "قسم التقنية والرقمنة", desc: "تطوير الأدوات الرقمية للأكاديمية — وهذه المنصة أول مشاريعه." },
  { id: "media", name: "قسم الإعلام والتواصل", desc: "صناعة المحتوى وتغطية الأنشطة وإيصال صوت الشباب." },
  { id: "training", name: "قسم التكوين السياسي", desc: "دورات ومناظرات في الفكر التعادلي والتدبير العمومي." },
  { id: "social", name: "قسم العمل الاجتماعي", desc: "القوافل التضامنية والمبادرات الميدانية في الأحياء والقرى." },
  { id: "culture", name: "قسم الثقافة والفنون", desc: "المسرح، الكتابة، والمعارض — الثقافة كأداة تأطير." },
  { id: "org", name: "قسم التنظيم", desc: "هيكلة الفروع وتتبع العضوية وتنسيق الجموع العامة." },
];

const now = "2026-07-01T10:00:00Z";

function idea(
  id: string,
  name: string,
  title: string,
  description: string,
  departmentId: string,
  status: IdeaPublic["status"],
  openToCollab = true
): IdeaPublic {
  return {
    id,
    name,
    title,
    description,
    founderId: `member-${id}`,
    departmentId,
    openToCollab,
    status,
    createdAt: now,
    updatedAt: now,
    approvedAt: status === "approved" ? now : null,
  };
}

export const MOCK_IDEAS: Record<string, IdeaPublic[]> = {
  casablanca: [
    idea("c1", "ideas-platform", "منصة الأفكار والمشاريع", "رقمنة مسار الفكرة داخل الأكاديمية: من العضو إلى القيادة الوطنية بمسار مرئي وشفاف.", "tech", "national_review"),
    idea("c2", "media-kit", "الحقيبة الإعلامية الموحدة", "قوالب جاهزة للبلاغات والتصاميم حتى تخرج كل الفروع بهوية بصرية واحدة.", "media", "regional_review"),
    idea("c3", "debate-league", "دوري المناظرات الجهوي", "مسابقة مناظرات شهرية بين فروع الجهة تنتهي بنهائي وطني.", "training", "submitted"),
    idea("c4", "hood-caravan", "قافلة الأحياء", "قافلة اجتماعية شهرية بشراكة مع قسم العمل الاجتماعي في أحياء البيضاء الكبرى.", "social", "approved"),
    idea("c5", "archive-lab", "مختبر الذاكرة الشبابية", "توثيق شهادات قدماء الشبيبة بالصوت والصورة قبل ضياعها.", "culture", "approved", false),
  ],
  rabat: [
    idea("r1", "policy-lab", "مختبر السياسات الشبابية", "أوراق سياسات قصيرة يعدها شباب الأكاديمية وتُرفع للفرق البرلمانية.", "training", "national_review"),
    idea("r2", "campus-cells", "خلايا الجامعات", "إعادة تنشيط حضور الأكاديمية داخل جامعات الرباط وسلا.", "org", "regional_review"),
    idea("r3", "podcast", "بودكاست صوت الميزان", "حلقات شهرية تحاور وجوها شابة من داخل الحزب وخارجه.", "media", "approved"),
  ],
  fes: [
    idea("f1", "heritage-routes", "مسارات التراث الفاسي", "جولات شبابية موثقة بالفيديو في المدينة العتيقة تربط التراث بالعمل الوطني.", "culture", "submitted"),
    idea("f2", "coding-club", "نادي البرمجة الشبابي", "تكوين مجاني في البرمجة لشباب الأحياء بشراكة مع قسم التقنية.", "tech", "regional_review"),
  ],
  marrakech: [
    idea("m1", "green-brigade", "الكتيبة الخضراء", "حملات تشجير ونظافة دورية توقعها الأكاديمية في أحياء مراكش.", "social", "approved"),
    idea("m2", "artisan-youth", "شباب الصنعة", "منصة تعرض منتجات الصناع التقليديين الشباب وتربطهم بالأسواق.", "culture", "submitted"),
  ],
  tanger: [
    idea("t1", "port-forum", "منتدى شباب البوغاز", "لقاء سنوي حول الاقتصاد الأزرق وفرص الشغل في الشمال.", "training", "regional_review"),
  ],
  souss: [
    idea("s1", "amazigh-content", "محتوى بالأمازيغية", "ترجمة مواد التكوين وأدبيات الأكاديمية إلى الأمازيغية.", "media", "submitted"),
  ],
};

// Full (unlocked) versions — what a founder/coordinator sees.
export const MOCK_IDEAS_FULL: Record<string, IdeaFull> = Object.fromEntries(
  Object.values(MOCK_IDEAS)
    .flat()
    .map((i) => [
      i.id,
      {
        ...i,
        pdfUrl: `https://example.org/ideas/${i.name}.pdf`,
        contactInfo: `${i.name}@iya.ma`,
      },
    ])
);

export const MOCK_STATS = {
  members: JIHAT.reduce((s, j) => s + j.members, 0),
  jihat: JIHAT.length,
  departments: DEPARTMENTS.length,
  ideas: JIHAT.reduce((s, j) => s + j.ideasCount, 0),
  approved: Object.values(MOCK_IDEAS).flat().filter((i) => i.status === "approved").length,
};

export function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
