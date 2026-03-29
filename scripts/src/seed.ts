import { db } from "@workspace/db";
import {
  usersTable,
  forumsTable,
  articlesTable,
  eventsTable,
  pollsTable,
  pollOptionsTable,
  crisesTable,
} from "@workspace/db/schema";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "ycc_salt_2024").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  const [admin] = await db
    .insert(usersTable)
    .values({
      email: "admin@youthcapitalcore.ma",
      passwordHash: hashPassword("admin123"),
      fullName: "Admin Platform",
      fullNameAr: "مدير المنصة",
      role: "admin",
      languagePreference: "en",
      status: "active",
      applicationStatus: "approved",
      simulationRole: "Platform Administrator",
    })
    .onConflictDoNothing()
    .returning();

  const [user1] = await db
    .insert(usersTable)
    .values({
      email: "younes@example.ma",
      passwordHash: hashPassword("user123"),
      fullName: "Younes El Fassi",
      fullNameAr: "يونس الفاسي",
      role: "user",
      languagePreference: "ar",
      status: "active",
      applicationStatus: "approved",
      simulationRole: "Minister of Economy",
      region: "Casablanca-Settat",
    })
    .onConflictDoNothing()
    .returning();

  const [user2] = await db
    .insert(usersTable)
    .values({
      email: "sofia@example.ma",
      passwordHash: hashPassword("user123"),
      fullName: "Sofia Benali",
      fullNameAr: "صوفيا بنعلي",
      role: "user",
      languagePreference: "en",
      status: "active",
      applicationStatus: "approved",
      simulationRole: "MP - House of Representatives",
      region: "Rabat-Salé-Kénitra",
    })
    .onConflictDoNothing()
    .returning();

  const [user3] = await db
    .insert(usersTable)
    .values({
      email: "adam@example.com",
      passwordHash: hashPassword("user123"),
      fullName: "Adam Mansouri",
      fullNameAr: "آدم المنصوري",
      role: "user",
      languagePreference: "en",
      status: "active",
      applicationStatus: "none",
      region: "Marrakech-Safi",
    })
    .onConflictDoNothing()
    .returning();

  console.log("Users seeded");

  const adminId = admin?.id || 1;

  await db
    .insert(forumsTable)
    .values([
      {
        name: "House of Representatives",
        nameAr: "مجلس النواب",
        description: "Debates and legislation for the House of Representatives",
        descriptionAr: "مناقشات وتشريعات مجلس النواب",
        category: "parliament",
      },
      {
        name: "House of Councillors",
        nameAr: "مجلس المستشارين",
        description: "Upper chamber discussions and deliberations",
        descriptionAr: "مناقشات ومداولات الغرفة العليا",
        category: "parliament",
      },
      {
        name: "Ministry of Economy & Finance",
        nameAr: "وزارة الاقتصاد والمالية",
        description: "Economic policy, budgets, and financial discussions",
        descriptionAr: "السياسة الاقتصادية والميزانيات والنقاشات المالية",
        category: "ministry",
      },
      {
        name: "Ministry of Health",
        nameAr: "وزارة الصحة",
        description: "Healthcare policy, public health, and medical initiatives",
        descriptionAr: "سياسات الرعاية الصحية والصحة العامة",
        category: "ministry",
      },
      {
        name: "Ministry of Education",
        nameAr: "وزارة التربية الوطنية",
        description: "Education reform and youth empowerment",
        descriptionAr: "إصلاح التعليم وتمكين الشباب",
        category: "ministry",
      },
      {
        name: "Casablanca-Settat Regional Council",
        nameAr: "مجلس جهة الدار البيضاء-سطات",
        description: "Regional governance discussions for Casablanca-Settat",
        descriptionAr: "مناقشات الحوكمة الإقليمية لجهة الدار البيضاء-سطات",
        category: "regional",
      },
      {
        name: "General Assembly",
        nameAr: "الجمعية العامة",
        description: "Open discussions for all platform members",
        descriptionAr: "نقاشات مفتوحة لجميع أعضاء المنصة",
        category: "general",
      },
    ])
    .onConflictDoNothing();

  console.log("Forums seeded");

  await db
    .insert(articlesTable)
    .values([
      {
        title: "Youth Parliament Passes Historic Education Reform Bill",
        titleAr: "البرلمان الشبابي يصادق على مشروع إصلاح تاريخي للتعليم",
        content:
          "In a landmark session held at the Youth CapitalCore platform, the simulated House of Representatives voted 78-12 in favor of the Youth Education Reform Act 2024. The bill proposes increasing public education funding by 15%, introducing civic education as a mandatory subject in secondary schools, and establishing a network of youth innovation hubs across all 12 regions of Morocco. 'This is exactly what civic participation looks like,' said simulation participant Younes El Fassi. 'We debated every clause for three weeks, and the result reflects real democratic consensus.' The bill now moves to the House of Councillors for review.",
        contentAr:
          "في جلسة تاريخية عُقدت على منصة Youth CapitalCore، صوّت مجلس النواب الاصطناعي بنسبة 78 مقابل 12 لصالح مشروع قانون إصلاح التعليم الشبابي 2024. يقترح مشروع القانون زيادة تمويل التعليم العام بنسبة 15%، وإدراج التربية المدنية كمادة إلزامية في المدارس الثانوية، وإنشاء شبكة من مراكز الابتكار الشبابي عبر جميع الجهات الـ12 بالمغرب.",
        type: "simulation",
        authorId: adminId,
        thumbnailUrl: null,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: "New Crisis Scenario: Water Scarcity Emergency Declared in Southern Regions",
        titleAr: "سيناريو أزمة جديد: إعلان حالة طوارئ شُح المياه في المناطق الجنوبية",
        content:
          "Platform administrators have activated a new crisis scenario targeting southern Moroccan regions. Ministers and regional council members are now tasked with drafting emergency water management policies within 72 hours. The crisis scenario, rated High severity, tests participants' ability to coordinate cross-ministry responses and manage public communication during a national emergency. Teams from the Ministry of Agriculture, Interior, and Environment are expected to collaborate in the Community hub.",
        contentAr:
          "نشّط مدراء المنصة سيناريو أزمة جديدة تستهدف المناطق الجنوبية بالمغرب. يُطلب من الوزراء وأعضاء المجالس الإقليمية الآن صياغة سياسات طارئة لإدارة المياه خلال 72 ساعة.",
        type: "simulation",
        authorId: adminId,
        thumbnailUrl: null,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Welcome to Youth CapitalCore : Platform Launch Announcement",
        titleAr: "مرحباً بكم في Youth CapitalCore : إعلان إطلاق المنصة",
        content:
          "We are thrilled to announce the official launch of Youth CapitalCore, Morocco's first digital civic governance simulation platform for youth. Youth CapitalCore gives young Moroccans, diaspora members, and youth across the Arab and African world the tools to simulate real government functions, debate policies, vote on legislation, and develop authentic leadership skills. Apply today for your role in one of 22 simulated ministries, regional councils, or parliamentary houses. The platform operates in both Arabic and English, with full RTL support for Arabic speakers.",
        contentAr:
          "يسعدنا الإعلان عن الإطلاق الرسمي لمنصة Youth CapitalCore، أول منصة مغربية لمحاكاة الحوكمة المدنية الرقمية للشباب. تمنح Youth CapitalCore الشباب المغربي وأبناء المهجر وشباب العالم العربي والأفريقي أدوات محاكاة الوظائف الحكومية الحقيقية.",
        type: "platform",
        authorId: adminId,
        thumbnailUrl: null,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ])
    .onConflictDoNothing();

  console.log("Articles seeded");

  await db
    .insert(eventsTable)
    .values([
      {
        title: "Annual Budget Vote : Live Session",
        titleAr: "التصويت على الميزانية السنوية : جلسة مباشرة",
        description: "The simulated Parliament will convene to vote on the Annual National Budget. Ministers of Finance and Economy will present their allocations, followed by debate and final vote.",
        descriptionAr: "سيجتمع البرلمان الاصطناعي للتصويت على الميزانية الوطنية السنوية. سيقدم وزيرا المالية والاقتصاد مخصصاتهما، يعقبها نقاش وتصويت نهائي.",
        startAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        meetingUrl: "https://zoom.us/j/example",
        type: "vote",
      },
      {
        title: "Leadership Workshop: Negotiation & Diplomacy Skills",
        titleAr: "ورشة قيادة: مهارات التفاوض والدبلوماسية",
        description: "An interactive workshop with experienced political mentors covering negotiation techniques, diplomatic communication, and coalition-building strategies for young leaders.",
        descriptionAr: "ورشة تفاعلية مع مرشدين سياسيين متمرسين تغطي تقنيات التفاوض والتواصل الدبلوماسي واستراتيجيات بناء التحالفات للقادة الشباب.",
        startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        meetingUrl: "https://meet.google.com/example",
        type: "workshop",
      },
      {
        title: "African Youth Governance Summit 2024",
        titleAr: "قمة الشباب الأفريقي للحوكمة 2024",
        description: "A major summit bringing together youth governance simulation platforms from across Africa and the Arab world. Participants will share insights, debate continental challenges, and build cross-border networks.",
        descriptionAr: "قمة كبرى تجمع منصات محاكاة الحوكمة الشبابية من جميع أنحاء أفريقيا والعالم العربي.",
        startAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        meetingUrl: null,
        type: "summit",
      },
      {
        title: "Q&A: How to Apply for a Simulation Role",
        titleAr: "أسئلة وأجوبة: كيفية التقدم لدور في المحاكاة",
        description: "Live session for new members to learn about the application process, available roles, and what to expect as a simulation participant.",
        descriptionAr: "جلسة مباشرة للأعضاء الجدد للتعرف على عملية التقديم والأدوار المتاحة وما يمكن توقعه كمشارك في المحاكاة.",
        startAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        meetingUrl: "https://zoom.us/j/example2",
        type: "live_session",
      },
    ])
    .onConflictDoNothing();

  console.log("Events seeded");

  const [poll] = await db
    .insert(pollsTable)
    .values({
      title: "Should the simulated government prioritize healthcare or education spending in 2025?",
      titleAr: "هل يجب على الحكومة الاصطناعية إيلاء الأولوية للإنفاق على الرعاية الصحية أم التعليم في 2025؟",
      description: "Cast your vote as a Parliament member. Results will be presented in the next Budget Session.",
      status: "active",
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdById: adminId,
    })
    .onConflictDoNothing()
    .returning();

  if (poll) {
    await db
      .insert(pollOptionsTable)
      .values([
        { pollId: poll.id, optionKey: "opt_1", label: "Healthcare (60% increase)", labelAr: "الرعاية الصحية (زيادة 60%)", votes: 34, percentage: 56 },
        { pollId: poll.id, optionKey: "opt_2", label: "Education (60% increase)", labelAr: "التعليم (زيادة 60%)", votes: 21, percentage: 34 },
        { pollId: poll.id, optionKey: "opt_3", label: "Split equally (30% each)", labelAr: "توزيع متساوٍ (30% لكل منهما)", votes: 6, percentage: 10 },
      ])
      .onConflictDoNothing();
  }

  console.log("Polls seeded");

  await db
    .insert(crisesTable)
    .values([
      {
        title: "Water Scarcity Emergency : Southern Regions",
        titleAr: "حالة طوارئ شُح المياه : المناطق الجنوبية",
        description: "Severe drought conditions have been declared in the Drâa-Tafilalet and Souss-Massa regions. Ministers must coordinate emergency water distribution, agricultural support, and public communication within 72 hours.",
        descriptionAr: "أُعلنت حالة جفاف حادة في جهتي درعة-تافيلالت وسوس-ماسة. يجب على الوزراء تنسيق توزيع المياه الطارئة ودعم الزراعة والتواصل العام خلال 72 ساعة.",
        severity: "high",
        isActive: true,
        createdById: adminId,
      },
    ])
    .onConflictDoNothing();

  console.log("Crises seeded");
  console.log("✅ Database seeding complete!");
  console.log("Admin login: admin@youthcapitalcore.ma / admin123");
  console.log("User login: younes@example.ma / user123");
}

seed().catch(console.error).finally(() => process.exit());
