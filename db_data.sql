--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'admin@youthcapitalcore.ma', '8f2a62f5cc02ee16e357e1ffc6ba4bcde3eda5e3e0fef852b06665aae3222404', 'Admin Platform', 'مدير المنصة', 'admin', 'Platform Administrator', NULL, NULL, 'en', 'active', 'approved', '2026-03-29 00:45:25.752887', NULL);
INSERT INTO public.users VALUES (2, 'younes@example.ma', 'baf344752f255aec074b65b6000db9c511177851a19a891343674be78753a6b2', 'Younes El Fassi', 'يونس الفاسي', 'user', 'Minister of Economy', 'Casablanca-Settat', NULL, 'ar', 'active', 'approved', '2026-03-29 00:45:25.768367', NULL);
INSERT INTO public.users VALUES (3, 'sofia@example.ma', 'baf344752f255aec074b65b6000db9c511177851a19a891343674be78753a6b2', 'Sofia Benali', 'صوفيا بنعلي', 'user', 'MP - House of Representatives', 'Rabat-Salé-Kénitra', NULL, 'en', 'active', 'approved', '2026-03-29 00:45:25.775623', NULL);
INSERT INTO public.users VALUES (5, 'admin@KoumAISystems.com', 'af8161529674b335e40375213db818f9cbe35cbbd85e08adfac8a22e3b290eed', 'ayman', NULL, 'user', NULL, NULL, NULL, 'en', 'active', 'pending', '2026-03-29 01:15:58.314409', 'https://res.cloudinary.com/dmznisgxq/image/upload/v1774749419/WhatsApp_Image_2026-02-11_at_4.23.05_PM_gfbdsa.jpg');
INSERT INTO public.users VALUES (6, 'mgr@KoumAISystems.com', 'af8161529674b335e40375213db818f9cbe35cbbd85e08adfac8a22e3b290eed', 'Aexeee', NULL, 'user', 'mp', NULL, NULL, 'en', 'active', 'approved', '2026-03-29 04:04:50.865377', NULL);
INSERT INTO public.users VALUES (4, 'adam@example.com', 'baf344752f255aec074b65b6000db9c511177851a19a891343674be78753a6b2', 'Adam Mansouri', 'آدم المنصوري', 'user', NULL, 'Marrakech-Safi', NULL, 'en', 'banned', 'none', '2026-03-29 00:45:25.778512', NULL);


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.articles VALUES (1, 'Youth Parliament Passes Historic Education Reform Bill', 'البرلمان الشبابي يصادق على مشروع إصلاح تاريخي للتعليم', 'In a landmark session held at the Youth CapitalCore platform, the simulated House of Representatives voted 78-12 in favor of the Youth Education Reform Act 2024. The bill proposes increasing public education funding by 15%, introducing civic education as a mandatory subject in secondary schools, and establishing a network of youth innovation hubs across all 12 regions of Morocco. ''This is exactly what civic participation looks like,'' said simulation participant Younes El Fassi. ''We debated every clause for three weeks, and the result reflects real democratic consensus.'' The bill now moves to the House of Councillors for review.', 'في جلسة تاريخية عُقدت على منصة Youth CapitalCore، صوّت مجلس النواب الاصطناعي بنسبة 78 مقابل 12 لصالح مشروع قانون إصلاح التعليم الشبابي 2024. يقترح مشروع القانون زيادة تمويل التعليم العام بنسبة 15%، وإدراج التربية المدنية كمادة إلزامية في المدارس الثانوية، وإنشاء شبكة من مراكز الابتكار الشبابي عبر جميع الجهات الـ12 بالمغرب.', 'simulation', 1, NULL, '2026-03-26 23:45:25.785', '2026-03-29 00:45:25.790124');
INSERT INTO public.articles VALUES (2, 'New Crisis Scenario: Water Scarcity Emergency Declared in Southern Regions', 'سيناريو أزمة جديد: إعلان حالة طوارئ شُح المياه في المناطق الجنوبية', 'Platform administrators have activated a new crisis scenario targeting southern Moroccan regions. Ministers and regional council members are now tasked with drafting emergency water management policies within 72 hours. The crisis scenario, rated High severity, tests participants'' ability to coordinate cross-ministry responses and manage public communication during a national emergency. Teams from the Ministry of Agriculture, Interior, and Environment are expected to collaborate in the Community hub.', 'نشّط مدراء المنصة سيناريو أزمة جديدة تستهدف المناطق الجنوبية بالمغرب. يُطلب من الوزراء وأعضاء المجالس الإقليمية الآن صياغة سياسات طارئة لإدارة المياه خلال 72 ساعة.', 'simulation', 1, NULL, '2026-03-23 23:45:25.785', '2026-03-29 00:45:25.790124');
INSERT INTO public.articles VALUES (3, 'Welcome to Youth CapitalCore — Platform Launch Announcement', 'مرحباً بكم في Youth CapitalCore — إعلان إطلاق المنصة', 'We are thrilled to announce the official launch of Youth CapitalCore, Morocco''s first digital civic governance simulation platform for youth. Youth CapitalCore gives young Moroccans, diaspora members, and youth across the Arab and African world the tools to simulate real government functions, debate policies, vote on legislation, and develop authentic leadership skills. Apply today for your role in one of 22 simulated ministries, regional councils, or parliamentary houses. The platform operates in both Arabic and English, with full RTL support for Arabic speakers.', 'يسعدنا الإعلان عن الإطلاق الرسمي لمنصة Youth CapitalCore، أول منصة مغربية لمحاكاة الحوكمة المدنية الرقمية للشباب. تمنح Youth CapitalCore الشباب المغربي وأبناء المهجر وشباب العالم العربي والأفريقي أدوات محاكاة الوظائف الحكومية الحقيقية.', 'platform', 1, NULL, '2026-03-18 23:45:25.785', '2026-03-29 00:45:25.790124');


--
-- Data for Name: crises; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.crises VALUES (1, 'Water Scarcity Emergency — Southern Regions', 'حالة طوارئ شُح المياه — المناطق الجنوبية', 'Severe drought conditions have been declared in the Drâa-Tafilalet and Souss-Massa regions. Ministers must coordinate emergency water distribution, agricultural support, and public communication within 72 hours.', 'أُعلنت حالة جفاف حادة في جهتي درعة-تافيلالت وسوس-ماسة. يجب على الوزراء تنسيق توزيع المياه الطارئة ودعم الزراعة والتواصل العام خلال 72 ساعة.', 'high', true, 1, '2026-03-29 00:45:25.807282');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.events VALUES (1, 'Annual Budget Vote — Live Session', 'التصويت على الميزانية السنوية — جلسة مباشرة', 'The simulated Parliament will convene to vote on the Annual National Budget. Ministers of Finance and Economy will present their allocations, followed by debate and final vote.', 'سيجتمع البرلمان الاصطناعي للتصويت على الميزانية الوطنية السنوية. سيقدم وزيرا المالية والاقتصاد مخصصاتهما، يعقبها نقاش وتصويت نهائي.', '2026-03-31 23:45:25.793', '2026-04-01 01:45:25.793', 'https://zoom.us/j/example', 'vote', '2026-03-29 00:45:25.795299');
INSERT INTO public.events VALUES (2, 'Leadership Workshop: Negotiation & Diplomacy Skills', 'ورشة قيادة: مهارات التفاوض والدبلوماسية', 'An interactive workshop with experienced political mentors covering negotiation techniques, diplomatic communication, and coalition-building strategies for young leaders.', 'ورشة تفاعلية مع مرشدين سياسيين متمرسين تغطي تقنيات التفاوض والتواصل الدبلوماسي واستراتيجيات بناء التحالفات للقادة الشباب.', '2026-04-04 23:45:25.793', '2026-04-05 02:45:25.793', 'https://meet.google.com/example', 'workshop', '2026-03-29 00:45:25.795299');
INSERT INTO public.events VALUES (3, 'African Youth Governance Summit 2024', 'قمة الشباب الأفريقي للحوكمة 2024', 'A major summit bringing together youth governance simulation platforms from across Africa and the Arab world. Participants will share insights, debate continental challenges, and build cross-border networks.', 'قمة كبرى تجمع منصات محاكاة الحوكمة الشبابية من جميع أنحاء أفريقيا والعالم العربي.', '2026-04-11 23:45:25.793', '2026-04-12 23:45:25.793', NULL, 'summit', '2026-03-29 00:45:25.795299');
INSERT INTO public.events VALUES (4, 'Q&A: How to Apply for a Simulation Role', 'أسئلة وأجوبة: كيفية التقدم لدور في المحاكاة', 'Live session for new members to learn about the application process, available roles, and what to expect as a simulation participant.', 'جلسة مباشرة للأعضاء الجدد للتعرف على عملية التقديم والأدوار المتاحة وما يمكن توقعه كمشارك في المحاكاة.', '2026-03-29 23:45:25.793', '2026-03-30 00:45:25.793', 'https://zoom.us/j/example2', 'live_session', '2026-03-29 00:45:25.795299');


--
-- Data for Name: forums; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.forums VALUES (1, 'House of Representatives', 'مجلس النواب', 'Debates and legislation for the House of Representatives', 'مناقشات وتشريعات مجلس النواب', 'parliament', '2026-03-29 00:45:25.78305');
INSERT INTO public.forums VALUES (2, 'House of Councillors', 'مجلس المستشارين', 'Upper chamber discussions and deliberations', 'مناقشات ومداولات الغرفة العليا', 'parliament', '2026-03-29 00:45:25.78305');
INSERT INTO public.forums VALUES (3, 'Ministry of Economy & Finance', 'وزارة الاقتصاد والمالية', 'Economic policy, budgets, and financial discussions', 'السياسة الاقتصادية والميزانيات والنقاشات المالية', 'ministry', '2026-03-29 00:45:25.78305');
INSERT INTO public.forums VALUES (4, 'Ministry of Health', 'وزارة الصحة', 'Healthcare policy, public health, and medical initiatives', 'سياسات الرعاية الصحية والصحة العامة', 'ministry', '2026-03-29 00:45:25.78305');
INSERT INTO public.forums VALUES (5, 'Ministry of Education', 'وزارة التربية الوطنية', 'Education reform and youth empowerment', 'إصلاح التعليم وتمكين الشباب', 'ministry', '2026-03-29 00:45:25.78305');
INSERT INTO public.forums VALUES (6, 'Casablanca-Settat Regional Council', 'مجلس جهة الدار البيضاء-سطات', 'Regional governance discussions for Casablanca-Settat', 'مناقشات الحوكمة الإقليمية لجهة الدار البيضاء-سطات', 'regional', '2026-03-29 00:45:25.78305');
INSERT INTO public.forums VALUES (7, 'General Assembly', 'الجمعية العامة', 'Open discussions for all platform members', 'نقاشات مفتوحة لجميع أعضاء المنصة', 'general', '2026-03-29 00:45:25.78305');


--
-- Data for Name: polls; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.polls VALUES (1, 'Should the simulated government prioritize healthcare or education spending in 2025?', 'هل يجب على الحكومة الاصطناعية إيلاء الأولوية للإنفاق على الرعاية الصحية أم التعليم في 2025؟', 'Cast your vote as a Parliament member. Results will be presented in the next Budget Session.', 'active', '2026-04-04 23:45:25.797', 1, '2026-03-29 00:45:25.799418');


--
-- Data for Name: poll_options; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.poll_options VALUES (1, 1, 'opt_1', 'Healthcare (60% increase)', 'الرعاية الصحية (زيادة 60%)', 34, 56);
INSERT INTO public.poll_options VALUES (2, 1, 'opt_2', 'Education (60% increase)', 'التعليم (زيادة 60%)', 21, 34);
INSERT INTO public.poll_options VALUES (3, 1, 'opt_3', 'Split equally (30% each)', 'توزيع متساوٍ (30% لكل منهما)', 7, 10);


--
-- Data for Name: poll_votes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.poll_votes VALUES (1, 1, 2, 'opt_3', '2026-03-29 01:41:05.728354');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: role_applications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.role_applications VALUES (1, 5, 'mp', 'casa', NULL, 'house_of_representatives', 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', 'en', 'pending', NULL, NULL, '2026-03-29 01:15:58.451981');
INSERT INTO public.role_applications VALUES (2, 6, 'mp', 'Béni Mellal-Khénifra', NULL, 'house_of_representatives', 'bghit nkun meakom hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh', 'en', 'approved', 'mp', NULL, '2026-03-29 04:04:50.889183');


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.articles_id_seq', 3, true);


--
-- Name: crises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.crises_id_seq', 1, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 4, true);


--
-- Name: forums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forums_id_seq', 7, true);


--
-- Name: poll_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.poll_options_id_seq', 3, true);


--
-- Name: poll_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.poll_votes_id_seq', 1, true);


--
-- Name: polls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.polls_id_seq', 1, true);


--
-- Name: post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.post_likes_id_seq', 1, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.posts_id_seq', 1, true);


--
-- Name: role_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_applications_id_seq', 2, true);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- PostgreSQL database dump complete

