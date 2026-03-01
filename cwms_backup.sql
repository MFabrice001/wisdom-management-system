--
-- PostgreSQL database dump
--

\restrict hv8h8Jrd3Sp68yAm9BCU77hhAkFr7lySinsM9L2AtbIIjcO5mmcx1DEHZKLLw0q

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Category" AS ENUM (
    'MARRIAGE_GUIDANCE',
    'AGRICULTURE',
    'CONFLICT_RESOLUTION',
    'RWANDAN_HISTORY',
    'MORAL_CONDUCT',
    'TRADITIONAL_CEREMONIES',
    'PROVERBS',
    'STORIES',
    'LIFE_LESSONS',
    'COMMUNITY_VALUES'
);


ALTER TYPE public."Category" OWNER TO postgres;

--
-- Name: Language; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Language" AS ENUM (
    'KINYARWANDA',
    'ENGLISH',
    'FRENCH'
);


ALTER TYPE public."Language" OWNER TO postgres;

--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."RequestStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ELDER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _UserConversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_UserConversations" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_UserConversations" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: awarded_badges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.awarded_badges (
    id text NOT NULL,
    "userId" text NOT NULL,
    "badgeType" text NOT NULL,
    "awardedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.awarded_badges OWNER TO postgres;

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookmarks (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "wisdomId" text NOT NULL
);


ALTER TABLE public.bookmarks OWNER TO postgres;

--
-- Name: certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificates (
    id text NOT NULL,
    "userId" text NOT NULL,
    "quizAttemptId" text NOT NULL,
    "certificateNumber" text NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.certificates OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "wisdomId" text NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: elder_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.elder_requests (
    id text NOT NULL,
    "userId" text NOT NULL,
    reason text NOT NULL,
    experience text NOT NULL,
    certificates text[] DEFAULT ARRAY[]::text[],
    "cvUrl" text,
    "documentsUrl" text[] DEFAULT ARRAY[]::text[],
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "reviewedBy" text,
    "reviewNote" text,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.elder_requests OWNER TO postgres;

--
-- Name: forum_replies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forum_replies (
    id text NOT NULL,
    content text NOT NULL,
    "topicId" text NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.forum_replies OWNER TO postgres;

--
-- Name: forum_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forum_topics (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.forum_topics OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "wisdomId" text NOT NULL
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: meetings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meetings (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    date timestamp(3) without time zone NOT NULL,
    link text NOT NULL,
    "hostId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.meetings OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id text NOT NULL,
    content text NOT NULL,
    "senderId" text NOT NULL,
    "conversationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read boolean DEFAULT false NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: polls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.polls (
    id text NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.polls OWNER TO postgres;

--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_attempts (
    id text NOT NULL,
    "userId" text NOT NULL,
    score integer NOT NULL,
    "totalQuestions" integer NOT NULL,
    percentage double precision NOT NULL,
    "tabSwitches" integer DEFAULT 0 NOT NULL,
    violations text[] DEFAULT ARRAY[]::text[],
    "isProctored" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "timeSpentMinutes" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.quiz_attempts OWNER TO postgres;

--
-- Name: suggestions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suggestions (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "repliedAt" timestamp(3) without time zone,
    "repliedBy" text,
    reply text
);


ALTER TABLE public.suggestions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "profileImage" text,
    bio text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "nationalId" text,
    residence text,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone,
    "requirePasswordChange" boolean DEFAULT false NOT NULL,
    gender text,
    "twoFactorCode" text,
    "twoFactorExpiry" timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votes (
    id text NOT NULL,
    "pollId" text NOT NULL,
    "userId" text NOT NULL,
    option text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.votes OWNER TO postgres;

--
-- Name: wisdoms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wisdoms (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category public."Category" NOT NULL,
    language public."Language" DEFAULT 'KINYARWANDA'::public."Language" NOT NULL,
    "audioUrl" text,
    tags text[],
    views integer DEFAULT 0 NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text NOT NULL,
    "documentUrl" text,
    images text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.wisdoms OWNER TO postgres;

--
-- Data for Name: _UserConversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_UserConversations" ("A", "B") FROM stdin;
cmm7r5a2v001ague98t65bqgm	cmm0o4gj10003usaq27ar3m08
cmm7r5a2v001ague98t65bqgm	cmm0quiqv0003usa1lbcrnjx1
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c36fc562-fcac-4f59-b258-5be5ae1523b7	5cacb34e95e90ddbdf128e83e4822a795278569a54d5e1a861abe0fb7c903bfc	2025-12-01 23:36:40.235571+02	20251007132516_init	\N	\N	2025-12-01 23:36:40.186663+02	1
db6df563-e447-47f9-a597-48ebbaeafd02	a9e530e1463375c629f4ce0a8d35b358fdd08d3ce1935cd89901535139306198	2026-02-24 16:39:39.513994+02	20260224143939_add_gender_field	\N	\N	2026-02-24 16:39:39.381265+02	1
e105b055-0559-43f5-a059-d0d5f2f93a1c	e0ca2e33833a8578375b4dafeb80ffc9b82a61938f9ca9efa97acc3e19696026	2025-12-01 23:36:40.254663+02	20251012213621_add_polls	\N	\N	2025-12-01 23:36:40.236775+02	1
26b0f98d-bedc-449c-a56c-42f0fb9b9f1c	6b722175eede80ea4fa9972242451d296983e8f9edac5e3cb15c06d7cdae2406	2025-12-15 13:07:36.663659+02	20251215110735_add_suggestions_and_meetings	\N	\N	2025-12-15 13:07:36.092916+02	1
492e2526-c73f-478d-8bf4-50eb24e470f6	119c77fb6aa3953b0777448306a36621649f1c5dfea47d750803fb9c015e7919	2025-12-15 16:26:52.945616+02	20251215142652_add_elder_fields	\N	\N	2025-12-15 16:26:52.798186+02	1
f6af4998-7681-49c5-9d70-a8206012aa30	86fcb406b32b1b3c51632f925db920ed5579cf134354708414e36ed1fa22f154	2026-02-26 12:23:05.496519+02	20260226102305_update_wisdom_images	\N	\N	2026-02-26 12:23:05.466199+02	1
7b538c0a-feae-473f-8cc8-ec68a54f7bd5	b93887a75ac96e963160f58f6f514bd32d487257bd4b4e39981d1efdf58e1723	2025-12-17 11:30:00.865344+02	20251217093000_add_forum_feature	\N	\N	2025-12-17 11:30:00.735506+02	1
081de993-d8b6-446c-a7ab-34d5da8a4d0d	bac6fc371795f5feac6e32694c1c7b9075e1629a7a214485f92017eef494df62	2025-12-18 15:48:31.714741+02	20251218134831_add_all_features	\N	\N	2025-12-18 15:48:31.585646+02	1
f2ea4bcb-8e1a-47a4-916a-8f026ae39c6a	2f7ed3f31f6650c7a070720629c486758eaa082de37805cb0488df77d8819e5a	2025-12-19 12:42:30.417742+02	20251219104230_final_schema_update	\N	\N	2025-12-19 12:42:30.333875+02	1
7b5c4e97-cebc-4ac7-b481-e1544d2b9fb8	cbaa5b55796edb6508876335bfbfd21e9747263979b49120e20cab6f1a9db01f	2025-12-22 13:19:39.698459+02	20251222111939_add_documents_sharing	\N	\N	2025-12-22 13:19:39.644139+02	1
8d0c43af-9403-4860-92b2-719190d24054	a5c8ff609218526415c1ec1cc7c2ebad9a77a73c20c1009f3e048fcb20d8ec67	2025-12-22 17:26:48.537681+02	20251222152648_add_monitered_quiz	\N	\N	2025-12-22 17:26:48.432806+02	1
a17d45c1-3574-4932-bc06-0b28ce88e3ea	a75db256b870bfb18aef3f30eafa031fc131e6baddeed9a087d7f99aa375b649	2025-12-22 18:23:35.197127+02	20251222162334_add_certificate	\N	\N	2025-12-22 18:23:34.88735+02	1
763d235a-18bc-40d3-8fb7-46d6cafa6096	ed5b9f52d793488eee0eb0590d61270785bfa1d967075b64af7465b64e605915	2026-01-14 16:47:13.234616+02	20260114144713_add_require_password_change	\N	\N	2026-01-14 16:47:13.153735+02	1
f9697c35-5e14-4cc6-a62e-be483126a188	6b6b0566a596dbd7681c19fea07580a04b170cbcb4da6d241b9b4c0e3e95f8b2	2026-01-15 10:04:05.654093+02	20260115080405_add_quiz_timer	\N	\N	2026-01-15 10:04:05.594567+02	1
343b3e2f-d883-439e-bd35-6d4f3a50ce6e	4d5880e4231300b50d2335ce2c4dcb78e93db7ecc0ba3d8b682914bc3150252f	2026-02-24 12:17:45.769533+02	20260224101745_add_application_form	\N	\N	2026-02-24 12:17:45.66574+02	1
\.


--
-- Data for Name: awarded_badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.awarded_badges (id, "userId", "badgeType", "awardedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: bookmarks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookmarks (id, "createdAt", "userId", "wisdomId") FROM stdin;
cmm7qno370001gue9nz9qey33	2026-03-01 12:40:59.058	cmm0o4gj10003usaq27ar3m08	cmm7eg6js000jwknacz7dq8dp
cmm7qpbpx000dgue9xs3nudvb	2026-03-01 12:42:16.341	cmm0o4gj10003usaq27ar3m08	cmm7ee0jv000hwknau2llmb12
cmm7qqecy000jgue9lsb94qxl	2026-03-01 12:43:06.419	cmm0o4gj10003usaq27ar3m08	cmm7e0gog0009wkna6gugpk1r
cmm7qr79u000tgue9v80f0c7g	2026-03-01 12:43:43.89	cmm0o4gj10003usaq27ar3m08	cmm7dss080003wkna0z9wkzzs
cmm7qstyz000zgue9jyyyx5sx	2026-03-01 12:44:59.964	cmm0o4gj10003usaq27ar3m08	cmm7e8gwt000dwkna0pqjfegg
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificates (id, "userId", "quizAttemptId", "certificateNumber", "issuedAt") FROM stdin;
cmm7qwea90017gue9rcpwcwcw	cmm0o4gj10003usaq27ar3m08	cmm7qwe940015gue9mrg5m8ig	WMS-1772369266254-3m08	2026-03-01 12:47:46.257
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, content, "createdAt", "updatedAt", "userId", "wisdomId") FROM stdin;
cmm7qo75h0005gue998s5ymx6	it is awsome	2026-03-01 12:41:23.594	2026-03-01 12:41:23.594	cmm0o4gj10003usaq27ar3m08	cmm7eg6js000jwknacz7dq8dp
cmm7qpl9h000fgue9d9j9lfzx	this is helpful	2026-03-01 12:42:28.71	2026-03-01 12:42:28.71	cmm0o4gj10003usaq27ar3m08	cmm7ee0jv000hwknau2llmb12
cmm7qqc2a000hgue9b78k9w8z	integrity commes first	2026-03-01 12:43:03.439	2026-03-01 12:43:03.439	cmm0o4gj10003usaq27ar3m08	cmm7e0gog0009wkna6gugpk1r
cmm7qrroi000vgue9d3nvb58k	Agriculture is nessecary	2026-03-01 12:44:10.334	2026-03-01 12:44:10.334	cmm0o4gj10003usaq27ar3m08	cmm7dss080003wkna0z9wkzzs
cmm7qsr65000xgue9k73a8m7m	This is a better advice	2026-03-01 12:44:56.175	2026-03-01 12:44:56.175	cmm0o4gj10003usaq27ar3m08	cmm7e8gwt000dwkna0pqjfegg
cmm7rwpjb0022gue99sziusb4	its perfect	2026-03-01 13:16:00.327	2026-03-01 13:16:00.327	cmke53zy40000wk4nwoqoqujp	cmm7e8gwt000dwkna0pqjfegg
cmm7ry2zu0024gue9kw82jwag	umuhindo its a season of growth	2026-03-01 13:17:04.554	2026-03-01 13:17:04.554	cmke53zy40000wk4nwoqoqujp	cmm7dss080003wkna0z9wkzzs
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, "updatedAt", "createdAt") FROM stdin;
cmjbktp8b0000wkvj9aloxtbk	2025-12-19 11:05:51.85	2025-12-18 15:09:40.449
cmm7r5a2v001ague98t65bqgm	2026-03-01 12:54:41.037	2026-03-01 12:54:40.71
\.


--
-- Data for Name: elder_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.elder_requests (id, "userId", reason, experience, certificates, "cvUrl", "documentsUrl", status, "reviewedBy", "reviewNote", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
cmm0quisw0005usa123v873kp	cmm0quiqv0003usa1lbcrnjx1	Elder application for Real Fabrice	Application submitted via elder registration form	{}	/uploads/1771945903477-JD_CyberSecurity_ID13_14_GRC Consultant.pdf	{"/uploads/1771945910870-JD_CyberSecurity_ID16_Security Architect.pdf"}	APPROVED	cminooiw20000gqulqcc1lcpn	\N	2026-02-24 15:12:43.105	2026-02-24 15:11:55.566	2026-02-24 15:12:43.107
cmm7s7xb80029gue9hgpgyree	cmm7s7x8v0027gue9522g1c1m	Elder application for CoK	Application submitted via elder registration form	{}	/uploads/1772371464611-JD_CyberSecurity_ID16_Security Architect.pdf	{/uploads/1772371473161-certificate-cmm7qwea90017gue9rcpwcwcw.pdf}	APPROVED	cminooiw20000gqulqcc1lcpn	\N	2026-03-01 13:35:31.346	2026-03-01 13:24:43.741	2026-03-01 13:35:31.348
\.


--
-- Data for Name: forum_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forum_replies (id, content, "topicId", "authorId", "createdAt", "updatedAt") FROM stdin;
cmm7rzfk10026gue9jq3m2kzx	nikobimeze rwose	cmm7r3ox60019gue9ume4p8qe	cmke53zy40000wk4nwoqoqujp	2026-03-01 13:18:07.488	2026-03-01 13:18:07.488
\.


--
-- Data for Name: forum_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forum_topics (id, title, content, category, views, "authorId", "createdAt", "updatedAt") FROM stdin;
cmm7r3ox60019gue9ume4p8qe	Ndabaga	Dushaka umugani wuzuye 	Stories	2	cmm0o4gj10003usaq27ar3m08	2026-03-01 12:53:26.611	2026-03-01 13:17:35.565
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (id, "createdAt", "userId", "wisdomId") FROM stdin;
cmm7rw3dw001qgue913y6f6o6	2026-03-01 13:15:31.746	cmke53zy40000wk4nwoqoqujp	cmm7ebi4r000fwknajz3vx2ab
cmm7rw4na001sgue9x3pq9x5l	2026-03-01 13:15:33.382	cmke53zy40000wk4nwoqoqujp	cmm7ee0jv000hwknau2llmb12
cmm7rw7yi001ugue9nfuidm8n	2026-03-01 13:15:37.674	cmke53zy40000wk4nwoqoqujp	cmm7eg6js000jwknacz7dq8dp
cmm7rw90m001wgue9w6nhw6fo	2026-03-01 13:15:39.046	cmke53zy40000wk4nwoqoqujp	cmm7e8gwt000dwkna0pqjfegg
cmm7rwaa9001ygue94rfs3fya	2026-03-01 13:15:40.689	cmke53zy40000wk4nwoqoqujp	cmm7e4z4q000bwknap8mg65y5
cmm7rwbfh0020gue9whcgqmji	2026-03-01 13:15:42.174	cmke53zy40000wk4nwoqoqujp	cmm7e0gog0009wkna6gugpk1r
cmm7qokn40007gue9xovt4a8s	2026-03-01 12:41:41.248	cmm0o4gj10003usaq27ar3m08	cmm7ee0jv000hwknau2llmb12
cmm7qoyrn000bgue9pr2679zz	2026-03-01 12:41:59.555	cmm0o4gj10003usaq27ar3m08	cmm7eg6js000jwknacz7dq8dp
cmm7qqm3u000lgue9jqxi41va	2026-03-01 12:43:16.459	cmm0o4gj10003usaq27ar3m08	cmm7e0gog0009wkna6gugpk1r
cmm7qqnp3000ngue9oisi3vpn	2026-03-01 12:43:18.519	cmm0o4gj10003usaq27ar3m08	cmm7e4z4q000bwknap8mg65y5
cmm7qqpr2000pgue9t5l3fpty	2026-03-01 12:43:21.182	cmm0o4gj10003usaq27ar3m08	cmm7dvc260005wknau6s745vy
cmm7qqri2000rgue9tqtzvmsv	2026-03-01 12:43:23.45	cmm0o4gj10003usaq27ar3m08	cmm7dxjiz0007wknaa9sv3j4x
cmm7qt3xc0011gue9xl6g0voz	2026-03-01 12:45:12.864	cmm0o4gj10003usaq27ar3m08	cmm7e8gwt000dwkna0pqjfegg
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meetings (id, title, description, date, link, "hostId", "createdAt") FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, content, "senderId", "conversationId", "createdAt", read) FROM stdin;
cmm7r5abl001cgue9ct1t202y	Hey you updated great wisdom about gacaca which is helpful	cmm0o4gj10003usaq27ar3m08	cmm7r5a2v001ague98t65bqgm	2026-03-01 12:54:41.025	f
\.


--
-- Data for Name: polls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.polls (id, question, options, "startDate", "endDate", "isActive", "createdBy", "createdAt", "updatedAt") FROM stdin;
cmioj9eba0001wk4yg3p4renj	which one do you prefer	[{"text": "igiti kigororerwa kikiri gito", "votes": 0}, {"text": "ntawumuhana avayo", "votes": 0}]	2025-12-02 12:07:11.533	2025-12-05 12:07:00	t	cminooiw20000gqulqcc1lcpn	2025-12-02 12:07:11.533	2025-12-02 12:07:11.533
cmjalcxjd0009wkqynffvk48c	Are you sure	[{"text": "one", "votes": 0}, {"text": "two", "votes": 0}]	2025-12-17 22:36:51.517	2025-12-18 22:36:00	t	cminooiw20000gqulqcc1lcpn	2025-12-17 22:36:51.517	2025-12-17 22:36:51.517
cmjbbudpy000hgqbzikywfoi8	do it please	[{"text": "first", "votes": 0}, {"text": "second", "votes": 0}]	2025-12-18 10:58:15.66	2025-12-19 10:58:00	t	cminooiw20000gqulqcc1lcpn	2025-12-18 10:58:15.66	2025-12-18 10:58:15.66
cmjbbv669000jgqbzwfo830sa	whats on your mind	[{"text": "cool", "votes": 0}, {"text": "Bad", "votes": 0}]	2025-12-18 10:58:52.544	2025-12-20 10:58:00	t	cminooiw20000gqulqcc1lcpn	2025-12-18 10:58:52.544	2025-12-18 10:58:52.544
cmkkw1k190004usyvk7n03rw1	whats are causes of confict behaviours in Rwanda famillies	[{"text": "culture dicline", "votes": 0}, {"text": "government policy", "votes": 0}, {"text": "poor communication among family mambers", "votes": 0}]	2026-01-19 08:13:20.61	2026-01-25 08:13:00	t	cminooiw20000gqulqcc1lcpn	2026-01-19 08:13:20.61	2026-01-19 08:13:20.61
cmm0l288g0001uscw5vr5y8ll	can you relate issues in Rwandan Families	[{"text": "Parents"}, {"text": "Children"}]	2026-02-24 12:29:56.921	2026-03-08 12:29:00	t	cminooiw20000gqulqcc1lcpn	2026-02-24 12:29:56.921	2026-02-24 12:29:56.921
cmm7rcy42001egue9c55c5cu5	Who was ndabaga	[{"text": "A pride girl"}, {"text": "A girl who wanted to change the mind set that a girl can't perform all activities like boys do"}, {"text": "Non of the answers are true"}]	2026-03-01 13:00:38.449	2026-03-31 13:00:00	t	cminooiw20000gqulqcc1lcpn	2026-03-01 13:00:38.449	2026-03-01 13:00:38.449
cmm7rdu76001ggue9q2gsfh5i	Is Gacaca still active	[{"text": "yes"}, {"text": "no"}]	2026-03-01 13:01:20.032	2026-03-30 13:01:00	t	cminooiw20000gqulqcc1lcpn	2026-03-01 13:01:20.032	2026-03-01 13:01:20.032
cmm7rfcan001igue9bz3qe558	Which story did you like?	[{"text": "Maguru"}, {"text": "Nabaga"}]	2026-03-01 13:02:30.078	2026-03-31 13:02:00	t	cminooiw20000gqulqcc1lcpn	2026-03-01 13:02:30.078	2026-03-01 13:02:30.078
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempts (id, "userId", score, "totalQuestions", percentage, "tabSwitches", violations, "isProctored", "createdAt", "timeSpentMinutes") FROM stdin;
cmkf6grnc0001guynn5t4d2cc	cmke53zy40000wk4nwoqoqujp	0	7	0	0	{}	t	2026-01-15 08:18:29.487	1
cmkf6mz6m0003guyn8u16bl33	cmke53zy40000wk4nwoqoqujp	0	7	0	0	{}	t	2026-01-15 08:23:19.198	1
cmkf6nerf0005guynvfo3fjie	cmke53zy40000wk4nwoqoqujp	1	7	14.28571428571428	0	{}	t	2026-01-15 08:23:39.386	1
cmm7qwe940015gue9mrg5m8ig	cmm0o4gj10003usaq27ar3m08	6	7	85.71428571428571	1	{}	t	2026-03-01 12:47:46.214	2
\.


--
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suggestions (id, title, content, status, "userId", "createdAt", "repliedAt", "repliedBy", reply) FROM stdin;
cmkf79ave000fguynxqr1jyam	[REQUEST] Quiz inhencement	please can you add more attempts on the quiz 	PENDING	cmke53zy40000wk4nwoqoqujp	2026-01-15 08:40:40.607	\N	\N	\N
cmkf7akn3000hguynl7usbv40	wisdom inhencement	wisdom must be well organized	REVIEWED	cmke53zy40000wk4nwoqoqujp	2026-01-15 08:41:40.095	2026-01-15 08:48:35.102	kevin	you are right
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, role, "profileImage", bio, "createdAt", "updatedAt", "isVerified", "nationalId", residence, "resetToken", "resetTokenExpiry", "requirePasswordChange", gender, "twoFactorCode", "twoFactorExpiry") FROM stdin;
cminooiw20000gqulqcc1lcpn	m.fabrice001@gmail.com	$2b$10$KyL9Zdeh4OttBxcwx8/SYeMJS8splkdthCtPlns38uveeVKtn7etG	Fabrice MUSENGIMANA	ADMIN	\N	\N	2025-12-01 21:51:09.209	2025-12-02 11:54:30.056	f	\N	\N	\N	\N	f	\N	\N	\N
cmke53zy40000wk4nwoqoqujp	veda@gmail.com	$2b$12$.wNsjcjc0oEZb6og0HizWu3O0LVeUSmojPG5IPbHjFjhnnsCQYHGe	veda	USER	\N	\N	2026-01-14 14:52:47.932	2026-01-14 14:52:47.932	f	\N	\N	\N	\N	t	\N	\N	\N
cmm0quiqv0003usa1lbcrnjx1	realfabrice20@gmail.com	$2b$10$/fGhdkFxY47.H178UosAb.vurxbCB2BdAQ14hVLnHkA1eN4OobK1i	Real Fabrice	ELDER	\N	\N	2026-02-24 15:11:55.493	2026-03-01 06:33:38.921	f	1200080045487567	gasabo,remera	\N	\N	t	Male	\N	\N
cmm0o4gj10003usaq27ar3m08	davis@gmail.com	$2b$10$GuMKPqzgQW.tYHkgHnPXxeh4X.DboCs.lAS9v1Sn6vlw27qTpfIAS	Davis	USER	\N	\N	2026-02-24 13:55:40.321	2026-03-01 12:56:28.123	f	\N	\N	\N	\N	f	\N	\N	\N
cmm7s7x8v0027gue9522g1c1m	cokservicedelivery@gmail.com	$2b$10$zcFmzSa9yRQmxYrwwKCYH.P71VrKtrN/j7wdYT3aY1zIlhyrCvVGS	CoK	ELDER	\N	\N	2026-03-01 13:24:43.662	2026-03-01 13:37:27.616	f	1198970043763356	Gasabo, Kacyiru	\N	\N	t	Male	\N	\N
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.votes (id, "pollId", "userId", option, "createdAt") FROM stdin;
cmiomoc56000dwk4y6vx3wyfr	cmioj9eba0001wk4yg3p4renj	cminooiw20000gqulqcc1lcpn	igiti kigororerwa kikiri gito	2025-12-02 13:42:47.417
cmm7ehjmw000lwknacqc55k3d	cmm0l288g0001uscw5vr5y8ll	cmm0quiqv0003usa1lbcrnjx1	Parents	2026-03-01 07:00:17.96
cmm7qtnph0013gue9g2uqqn8o	cmm0l288g0001uscw5vr5y8ll	cmm0o4gj10003usaq27ar3m08	Children	2026-03-01 12:45:38.5
cmm7rqn64001kgue9uxwg7197	cmm7rfcan001igue9bz3qe558	cmm0o4gj10003usaq27ar3m08	Maguru	2026-03-01 13:11:17.438
cmm7rrbog001mgue98d1jox57	cmm7rdu76001ggue9q2gsfh5i	cmm0o4gj10003usaq27ar3m08	yes	2026-03-01 13:11:49.215
cmm7rrr6o001ogue9drhskebi	cmm7rcy42001egue9c55c5cu5	cmm0o4gj10003usaq27ar3m08	A girl who wanted to change the mind set that a girl can't perform all activities like boys do	2026-03-01 13:12:09.312
cmm7tno3j002ngue9kfl3lpsn	cmm7rfcan001igue9bz3qe558	cmm7s7x8v0027gue9522g1c1m	Nabaga	2026-03-01 14:04:57.918
cmm7tnyg0002pgue9yyy5tagf	cmm7rdu76001ggue9q2gsfh5i	cmm7s7x8v0027gue9522g1c1m	yes	2026-03-01 14:05:11.328
\.


--
-- Data for Name: wisdoms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wisdoms (id, title, content, category, language, "audioUrl", tags, views, "isPublished", "isFeatured", "createdAt", "updatedAt", "authorId", "documentUrl", images) FROM stdin;
cmm7eg6js000jwknacz7dq8dp	The Power of Umuganda (Mutual Assistance)	Long before it became a formalized monthly national program, Umuganda was a traditional community practice. If a neighbor needed to build a house, clear a vast piece of land, or harvest crops before a storm, the entire community would gather to help them, expecting nothing but a shared calabash of sorghum beer afterward. This highlights the Rwandan belief that collective effort is the only way a community can thrive.	COMMUNITY_VALUES	ENGLISH	\N	{umuganda}	2	t	f	2026-03-01 06:59:14.246	2026-03-01 12:40:40.736	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772348352093-umuganda.jpeg}
cmm7ee0jv000hwknau2llmb12	Protecting Your Agaciro (Dignity)	A fundamental life lesson passed down from Rwandan elders is the preservation of Agaciro (dignity or self-worth). Regardless of how difficult circumstances become, a person must never beg, steal, or compromise their values. True wealth is not measured by the cattle in your kraal, but by the strength of your character and your ability to remain self-reliant and respectable in the eyes of the community.	LIFE_LESSONS	ENGLISH	\N	{dignity}	2	t	f	2026-03-01 06:57:33.228	2026-03-01 12:42:08.65	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772348250343-agaciro.jpeg}
cmm7dvc260005wknau6s745vy	The Spirit of Traditional Gacaca	Before modern courts, disputes in Rwanda were often resolved through Gacaca a gathering of community elders sitting on the soft grass (akacaca). The primary goal of this justice system was not merely to punish the wrongdoer, but to discover the truth, restore harmony, and reintegrate the offender back into the community fabric. It emphasized truth-telling, genuine apologies, and restitution over permanent exile or division.	CONFLICT_RESOLUTION	ENGLISH	\N	{}	0	t	f	2026-03-01 06:43:01.684	2026-03-01 06:43:01.684	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772347375400-gacaca.jpeg}
cmm7dxjiz0007wknaa9sv3j4x	The Significance of Umuganura	Umuganura (the National Harvest Festival) was one of the most significant ceremonies in the ancient Rwandan Kingdom. Celebrated at the beginning of the harvest, it was a time to offer the first fruits to the King (Umwami) and to give thanks to Imana (God) and the ancestors for a bountiful yield. It served as a powerful symbol of national unity, collective sharing, and the unbreakable bond between the leadership and the citizens.	RWANDAN_HISTORY	ENGLISH	\N	{umuganura}	0	t	f	2026-03-01 06:44:44.697	2026-03-01 06:44:44.697	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772347482002-umuganura.jpeg}
cmm3f63qb0003usze018zqctl	Rwanda Nziza	1.\r\nRwanda nziza Gihugu cyacu,\r\nWuje imisozi, ibiyaga n'ibirunga,\r\nTekana ushashagirane,\r\nKandi wibere icyo uri cyo.\r\nDerabera urukundo rw'abana bawe,\r\nAbakuvuka twese,\r\nAbakuru n'ababuto,\r\nTuragukunda wa mugisha wacu.\r\n\r\n2.\r\nReka amateka akubumbire,\r\nIgihango cy'uko uri ishema ryacu,\r\nUmuco mwiza uguhoze ku isonga,\r\nUbumbatiye amahoro.\r\nAbakurambere b'intwari,\r\nBitanze bakakubungabunga,\r\nNatwe turiho kugira ngo,\r\nTurage abazadukomokaho.\r\n\r\n3.\r\nBanyarwanda twese hamwe,\r\nTumbire aheza hazaza,\r\nUbumwe bwacu ni bwo mbaraga,\r\nZizadutsindira ibigeragezo.\r\nDuharanire imibereho myiza,\r\nY'abanyagihugu bose,\r\nKuko ari byo shingiro,\r\nRy'amajyambere arambye.\r\n\r\n4.\r\nNgaho rero bana b'u Rwanda,\r\nDuhaguruke twese hamwe,\r\nDukore tutiganda,\r\nKugira ngo twubake igihugu.\r\nUbutabera n'uburinganire,\r\nBibe umurongo ngenderwaho,\r\nRwanda rwacu urakabaho iteka,\r\nMu ishema n'icyubahiro.	RWANDAN_HISTORY	KINYARWANDA	\N	{"Rwanda Nziza"}	4	t	f	2026-02-26 12:08:19.013	2026-02-26 12:15:42.868	cmm0quiqv0003usa1lbcrnjx1	uploads/1772107698974-JD_CyberSecurity_ID13_14_GRC Consultant.pdf	{"/uploads/1772107637022-Rwanda Nziza1.jpeg","/uploads/1772107649199-Rwanda nziza2.jpeg"}
cmm7dphxe0001wknamnhyn4os	The Principle of "Kwihangana" (Patience) in Marriage	In traditional Rwandan society, marriage is not just a union between two individuals, but an alliance between two families. Elders deeply advise that kwihangana (patience and endurance) is the central pillar of a home. When conflicts arise, couples are encouraged to seek counsel from trusted elders rather than making impulsive decisions. As the saying goes, "Nta zibana zidakomanya amahembe" (Even cows that live together in the same kraal will occasionally clash horns). This reminds couples that friction is normal, but it should not destroy the home.	MARRIAGE_GUIDANCE	ENGLISH	\N	{}	0	t	f	2026-03-01 06:38:29.35	2026-03-01 06:38:29.35	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772347103186-Marriage.jpeg}
cmm7e4z4q000bwknap8mg65y5	Gusaba no Gukwa (Introduction and Dowry)	Gusaba is the deeply poetic traditional ceremony where a groom's family officially requests a bride's hand in marriage. It is characterized by a battle of wits and eloquence between the abavugizi (spokespersons) of both families. Following a successful Gusaba is the Gukwa, the giving of cows. The cow is the ultimate symbol of wealth and respect in Rwanda; giving it signifies profound gratitude to the bride's family for raising her and cements a lifelong alliance.	TRADITIONAL_CEREMONIES	ENGLISH	\N	{wedding}	0	t	f	2026-03-01 06:50:31.375	2026-03-01 06:50:31.375	cmm0quiqv0003usa1lbcrnjx1	\N	{"/uploads/1772347828881-gusaba no gukwa.jpeg"}
cmm7ebi4r000fwknajz3vx2ab	The Bravery of Ndabaga	The legendary tale of Ndabaga tells of a courageous young girl whose aging father was stuck serving at the King's court (Itorero) because he had no son to replace him. Refusing to let her father die in service, Ndabaga secretly trained in martial arts, bound her chest, and disguised herself as a boy. She took her father's place, excelling in all warrior duties. Her story teaches that courage, skill, and deep love for one's parents are not limited by gender.	STORIES	ENGLISH	\N	{"bravery women"}	0	t	f	2026-03-01 06:55:36.073	2026-03-01 06:55:36.073	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772348132438-ndabaga.jpeg}
cmm7e0gog0009wkna6gugpk1r	Embodying "Ubupfura" (Integrity)	Ubupfura is arguably the highest moral virtue in Rwandan culture. It encompasses nobility of character, integrity, respect, and profound kindness. A person possessing ubupfura is one who keeps their promises, controls their anger, respects their elders, and assists those in need without expecting a reward. It is a trait that was traditionally taught from a very young age around the evening fire.	MORAL_CONDUCT	ENGLISH	\N	{integrity}	2	t	f	2026-03-01 06:47:00.686	2026-03-01 12:42:46.619	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772347616375-ubupfura.jpeg}
cmm7dss080003wkna0z9wkzzs	Reading the Signs for "Umuhindo" (Short Rains)	Historically, Rwandan farmers relied heavily on reading environmental signs rather than calendars. Elders knew that when specific trees, like the Umuvumu, began to sprout new leaves in a certain way, or when specific migratory birds appeared, the Umuhindo (short rainy season, typically starting in September) was approaching. This signaled the community to begin preparing the soil. Planting in harmony with these natural indicators ensured food security for the village.	AGRICULTURE	ENGLISH	\N	{seasons}	4	t	f	2026-03-01 06:41:02.002	2026-03-01 13:16:37.221	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772347257214-Agriculture.jpeg}
cmm7e8gwt000dwkna0pqjfegg	A shot arrow does not return	"Umwambi urashe ntugaruka." (A shot arrow does not return).\r\nThis proverb teaches the critical importance of thinking carefully before speaking or acting. Just as an archer cannot call back an arrow once it leaves the bow, a person cannot easily undo the damage caused by harsh words or reckless actions. It is a reminder to exercise self-control and foresight.	PROVERBS	ENGLISH	\N	{self-control}	4	t	f	2026-03-01 06:53:14.425	2026-03-01 13:15:48.317	cmm0quiqv0003usa1lbcrnjx1	\N	{/uploads/1772347990544-umwambi.jpeg}
cmm7sw2ii002bgue9cnl7cs5t	Umugani wa Maguru n'Isoko y'Ubugingo	Kera habayeho umusore witwaga Maguru, iri zina akaba yararihawe kubera umuvuduko udasanzwe yari afite mu kwiruka. Kuva mu bwana bwe, nta muntu, nta n'inyamaswa yashoboraga kumusiga. Yirukaga asiga umuyaga, agasimbuka imisozi n'ibibaya nk'ako guhumbya.\r\n\r\nUmunsi umwe, mu gihugu cyabo hateye amapfa akomeye n'icyorezo kidasanzwe. Abantu n'amatungo batangira kurwara no kwicwa n'inzara n'inyota. Umupfumu w'ibwami ahanura ko umuti w'icyo cyorezo ari amazi yo kuri ya "Isoko y'Ubugingo" yari iherereye mu gihugu cya kure cyane, inyuma y'imisozi irindwi n'amashyamba yuzuyemo inyamaswa z'inkazi. Umwami yatabaje intwari zose, ariko abagerageje kugendayo ntibagarutse kubera intera ndende n'ibizazane byo mu nzira.\r\n\r\nMaguru amaze kubona ko igihugu kigiye kurimbuka, yiyemeje kwitanga. Yafashe agacuma ke, asabira umugisha ku babyeyi be, maze yikubita mu nzira. Yirutse ubutareba inyuma. Inyamaswa z'inkazi zashatse kumufata zamubonaga nk'igicucu gihise. Ntiyaruhutse, ntiyicaye. Mu gihe abandi byabatwaraga amezi kugera kuri iyo soko, Maguru yahageze izuba rikirashe, avoma ya mazi y'ubugingo, arongera ariruka agaruka i bwami izuba ritararenga.\r\n\r\nAyo mazi yavangijwe n'imiti yahawe abarwayi bose, igihugu cyongera kuba kizima, abantu barabyina baranezerwa. Umwami yashimiye Maguru byimazeyo, amugabira inka nyinshi ndetse amugira umutware w'ingabo.\r\n\r\nIcyo uyu mugani utwigisha: Uyu mugani utwigisha ko buri wese Imana yamuhaye impano yihariye (nk'uko Maguru yari afite amaguru yihuta). Iyo ufashe impano yawe ukayikoresha neza mu gukiza no kugirira akamaro umuryango mugari, ntabwo bihesha agaciro abandi gusa, ahubwo nawe bikuzamura mu ntera kandi bikaguhesha icyubahiro iteka.	STORIES	KINYARWANDA	\N	{maguru}	0	t	f	2026-03-01 13:43:29.836	2026-03-01 13:43:29.836	cmm7s7x8v0027gue9522g1c1m	\N	{/uploads/1772372604688-maguru.jpeg}
cmm7t070p002dgue90tqxlqfd	Umugani wa Bakame n'Impyisi	Kera habayeho inshuti magara ebyiri: Impyisi n'Urukwavu rwitwaga Bakame. Izi nshuti zabanaga neza, ariko buri imwe yari ifite imiterere itandukanye. Impyisi yari ifite imbaraga nyinshi, ishonje igihe cyose, kandi itagira ubwenge bwinshi. Naho Bakame yo yari ntoya, igira amaboko make, ariko ikagira ubwenge (cyangwa uburiganya) buhambaye.\r\n\r\nIgihe kimwe, inzara yateye mu ishyamba, inyamaswa zose zibura icyo kurya. Impyisi ibwira Bakame iti: "Inshuti yanjye, dushake uko twabaho kuko inzara igiye kutwica." Bakame, kubera ubwenge bwayo, ibwira Impyisi iti: "Ndabizi ko uri umunyambaraga. Ndakwereka aho inka z'umukire ziherereye, uzijyeho uzifate, maze tuzigabane." Impyisi iremera.\r\n\r\nBakame ijyana Impyisi nijoro ku kiraro cy'uwo mukire. Yereka Impyisi umwobo inyuramo ngo yinjire mu kiraro, ariko uwo mwobo wari muto. Impyisi irahatiriza yinjiramo, ifata inka ihageza ubwo inda ibyimba cyane. Bakame yo yari yigumiye hanze irinda umutekano (ngo iteze induru mu gihe nyirin'inka aje).\r\n\r\nBukeye, nyirin'inka aje kumva urusaku mu kiraro, atabaza abaturanyi bafata inkoni n'amacumu. Bakame ibonye ko habaye ibibazo, irahunga. Impyisi ishaka gusohoka muri wa mwobo yinjiriyemo, ariko kubera ko yari yahaze cyane, inda yayo yari nini, inyura mu mwobo irakwama. Abantu barayifata barayikubita bikabije. Impyisi isigara ivuma Bakame yayishutse, yiyemeza kutazongera kuyizera. Kuva ubwo, Impyisi na Bakame byabaye abanzi b'ibihe byose.\r\n\r\nIcyo uyu mugani utwigisha:\r\nUyu mugani ni ishingiro ry'ubwenge mu muco nyarwanda. Utwigisha ko imbaraga z'umubiri zidahagije iyo zidaherekejwe n'ubwenge (ubushishozi). Kwiringira amagambo yaryoherejwe y'abantu b'indryarya gusa no kugira umururumba (nk'Impyisi) bishobora kugushyira mu kaga. Kandi utwibutsa ko kwiba atari byiza, kandi ko ingaruka zabyo zihenze.	STORIES	KINYARWANDA	\N	{bakame}	0	t	f	2026-03-01 13:46:42.575	2026-03-01 13:46:42.575	cmm7s7x8v0027gue9522g1c1m	\N	{/uploads/1772372799664-bakame.jpeg}
cmm7t73v7002fgue9shd6hm3t	Umugani w’Inkuba n’Ihene	Kera cyane, inyamaswa zose zabanaga ku isi mu mahoro, ndetse n’Inkuba yari ituye ku isi nk’abandi bose. Icyo gihe, Inkuba ntiyabaga mu gicu; yari umuturanyi wubashywe cyane kuko yari ifite imbaraga zidasanzwe n’ijwi rirangira, ariko yari n’umuntu uhaha akagaburira umuryango we.\r\n\r\nUmunsi umwe, amapfa akomeye yateye mu gihugu. Inyamaswa zose zabuze ibyo kurya, ibyatsi biruma, n’amazi arama. Inkuba, ikaba yari ifite ububiko bunini bw’ibiribwa, yatangiye kuguriza inyamaswa zindi ngo ziticwa n’inzara. Ihene, yari izwiho kugira umururumba no gukunda kurya cyane, yagiye kuguza Inkuba ibishyimbo n’amasaka menshi, isezeranya ko izabyishyura imvura nigwa imyaka ikeze.\r\n\r\nInkuba, mu buntu bwayo, iha Ihene ibiribwa byinshi. Ihene irataha, irarya irahaga, yibagirwa amakuba yari irimo. Igihe cyarageze imvura iragwa, imyaka irera, Ihene isarura byinshi. Ariko aho kwishyura Inkuba nk’uko babisezeranye, Ihene itangira kwihishahisha.\r\n\r\nInkuba yategereje ko Ihene iyizanira umwenda iraheba. Umunsi umwe, Inkuba ijya gushaka Ihene iwayo. Ihene ibonye Inkuba ije, igira ubwoba bwishi, yiruka yihisha mu rutoki, nyuma yihisha mu nzu y’abantu munsi y’igitanda.\r\n\r\nInkuba yararakaye cyane kubera ubuhemu bw’Ihene. Yarakaye cyane ku buryo yafashe umwanzuro wo kwimukira mu kirere (mu bicu) kuko yabonaga inyamaswa z’o ku isi zitarangwa n’ubupfura. Kuva icyo gihe, Inkuba yibera hejuru. Ariko ntiyigeze yibagirwa umwenda w’Ihene.\r\n\r\nNiyo mpamvu, n’uyu munsi, iyo imvura igiye kugwa ukumva Inkuba irakubise (ihinda), iba irimo ishakisha ya Hene ngo iyihe umwenda wayo. Ihene nayo, iyo yumvise Inkuba, igira ubwoba ikiruka ijya kwihisha mu nzu cyangwa munsi y’ibintu, kuko izi neza icyaha yakoze.\r\n\r\nIcyo uyu mugani utwigisha:\r\nUyu mugani wigisha agaciro k’ubupfura no kubahiriza amasezerano. Uhemu no kutishyura umwenda (kwanga kwishyura icyo wagurijwe) bitera umwiryane bikagabanya icyizere mu muryango. Byongeye kandi, utwigisha ko kwihishahisha nyuma yo gukora amakosa atari umuti, kuko ukuri kuzahora kuguhiga nk'uko Inkuba ihiga Ihene.	STORIES	KINYARWANDA	\N	{inkuba,imigani}	0	t	f	2026-03-01 13:52:04.702	2026-03-01 13:52:04.702	cmm7s7x8v0027gue9522g1c1m	\N	{/uploads/1772373121808-inkuba.jpeg}
cmm7tbp6d002hgue9qih5slh3	Umugani w’Intare, Impyisi na Bakame bagabana umuhigo	Kera habayeho inyamaswa eshatu zari zemeranyije guhigira hamwe: Intare (umwami w’ishyamba), Impyisi, ndetse na Bakame (urukwavu rw'incabwenge). Umunsi umwe, bazindukiye mu ishyamba guhiga. Umunsi wose barahize, bafata umuhigo ushimishije: bafashe inka y'ishyamba nini, bafata ihene, bafata n’urukwavu ruto rwo mu gasozi.\r\n\r\nBamaze kuruhuka, Intare ireba Impyisi iti: "Yewe Mpyisi, uri mukuru, ngaho gaba uyu muhigo twafashe buri wese abone umugabane we."\r\n\r\nImpyisi, mu bwenge bwayo buke, iravuga iti: "Ibi biroroshye cyane! Nyagasani Ntare, weho uri umwami uratwara inka kuko nini; njyewe ndatwara ihene kuko nringaniye; naho Bakame kuko ari gatoya igatwara uru rukwavu."\r\n\r\nIntare yumvise uko Impyisi igabanyije, irarakara cyane kuko yabonaga Impyisi iyigereranije nayo. Yafashe ukuboko kwayo kuremereye iyikubita urushyi rw'akataraboneka mu maso, Impyisi iriruka ivuza induru, ndetse iryo shyi riyikura ijisho rimwe.\r\n\r\nIntare yikunkumura umujinya, ihindukirira Bakame iti: "Ngaho wowe Bakame, gaba uyu muhigo niba ufite ubwenge."\r\n\r\nBakame yikubita hasi yubaha umwami w'ishyamba, yitonze iravuga iti: "Nyagasani, Nyirishyamba, ibi kugabanya biroroshye cyane! Iyi nka nini, ni iyo kugira ngo mwifungurire mu gitondo (Ifunguro rya mu gitondo). Iyi hene, ni iy'uko muza gufata amafunguro ya saa sita. Naho uru rukwavu ruto, ni urw'uko muza gufata akaraha umuhogo nimugoroba mbere yo kuryama. Naho jyewe, ndiyicira isari ndisha ibyatsi byo mu nda y'iyi nka."\r\n\r\nIntare iranezerwa cyane, iseka cyane iti: "Yewe Bakame! Ninde wakwigishije ubwenge bungana gutya bwo kugaba neza?"\r\n\r\nBakame isubiza vuba iti: "Nyagasani, ubwenge mbuhawe n'ijisho ry'Impyisi rimenetse!"\r\n\r\nIcyo uyu mugani utwigisha:\r\nUyu mugani utwigisha isomo rikomeye ryo mu buzima: "Kwiga ku makosa y'abandi." (Learning from the mistakes of others). Umuntu w'umunyabwenge si ukora amakosa ngo akuremo isomo gusa, ahubwo ni ureba amakuba cyangwa ibihano byagwiriye abandi (nk'ijisho ry'impyisi), maze we agakosora imyitwarire ye ataragerwaho n'ibibazo. Kumenya gusoma ibihe no kumenya uwo muvugana nabyo ni ubwenge buhambaye.	STORIES	KINYARWANDA	\N	{bakame}	0	t	f	2026-03-01 13:55:39.405	2026-03-01 13:55:39.405	cmm7s7x8v0027gue9522g1c1m	\N	{/uploads/1772373337190-bakame2.jpeg}
cmm7tfvun002jgue9l30cy0pt	Umugani wa Bakame, Inzovu n'Imvubu	Kera habayeho inyamaswa zose zibana mu ishyamba. Inzovu yari izwiho kuba inyamaswa nini kandi y'inyambaraga kurusha izindi ku butaka, naho Imvubu ikaba igihangange mu mazi. Bakame yo yari ntoya cyane, ariko ikagira amayeri n'ubwenge bwinshi. Umunsi umwe, Bakame yiyemeje kwereka izo nyamaswa nini ko ubwenge bwayo buruta imbaraga zazo.\r\n\r\nBakame yaboshye umugozi muremure cyane kandi ukomeye. Yabanje kujya mu ishyamba ishaka Inzovu, iyibwira yiyemera iti: "Nzovu, nubwo uri nini kandi abantu bakaba bagutinya, nanjye ndagukomeyeho! Reka dukururane kuri uyu mugozi urebe ko ntagutsinda." Inzovu iraseka cyane iti: "Wa gakwavu we, urashaka kwiyahura?" Bakame iti: "Fata uyu mugozi, ugume hano. Nnumva nkoze ku mugozi inshuro eshatu, utangire ukurure n'imbaraga zawe zose." Inzovu iremera.\r\n\r\nBakame ifata rwa ruhande rundi rw'umugozi yiruka ijya ku ruzi. Ihasanga Imvubu. Irayibwira iti: "Mvubu, wiyemera ko ukomeye ariko ndakurusha imbaraga! Fata uyu mugozi, nnumva nywukozeho, ukurure cyane urebe ko ntagukurura nkadukira kure." Imvubu nayo iraseka cyane, isuzugura Bakame, ifata umugozi yizeye kuyikubita hasi bidatinze.\r\n\r\nBakame yagiye hagati y'ishyamba n'uruzi, yihisha mu gihuru, maze ikubita rwa rugozi inshuro eshatu. Inzovu yumvise umugozi unyeganyega, itangira gukurura. Imvubu nayo ibyumvise, ishyiraho imbaraga zayo zose. Inyamaswa zombi z'ibihangange zarakururanye karahava! Inzovu yagira ngo iratsinda yigira inyuma, Imvubu ikayigarura yisuka mu mazi. Bwakereye bukira zikururana, zombi zibira ibyuya, ibyatsi n'ibiti byo hagati birasandara, ariko zinanirwa kuneshana.\r\n\r\nZimaze kuruha birenze urugero, umugozi ugiye gucika, zombi zafashe icyemezo cyo kureka gukurura ngo zirebe uwo munyambaraga ukomeje kuzinangira. Inzovu yamanutse igana ku ruzi, Imvubu izamuka igana mu ishyamba, zikurikirana wa mugozi. Zihuriye hagati, zikubita amaso ukuntu umugozi uhuza Inzovu n'Imvubu! Zisanga ni zo zari ziri gukururana umunsi wose. Bakame yo yari yibereye mu gihuru iseka yigaragura, ibona ko ubwenge bwayo butsinze imbaraga z'ibihangange.\r\n\r\nIcyo uyu mugani utwigisha:\r\nUyu mugani ni ishingiro ry'imvugo ngo "Ubwenge buruta amaboko" (Wisdom/Intelligence is greater than physical strength). Utwigisha ko n'ubwo waba uri muto cyangwa udafite amikoro n'imbaraga zigaragara nk'iz'abandi, iyo ukoresheje ubwenge, ubushishozi n'amayeri meza, ushobora gutsinda ibibazo bikomeye cyane cyangwa abantu bagaragara nk'ibihangange. Bwibutsaho kandi ko abiratana imbaraga bakunze gushukwa byoroshye.	STORIES	KINYARWANDA	\N	{bakame}	0	t	f	2026-03-01 13:58:54.437	2026-03-01 13:58:54.437	cmm7s7x8v0027gue9522g1c1m	\N	{/uploads/1772373526886-bakame3.jpeg}
cmm7tmi1d002lgue9s25a4oie	Ibisakuzo: Sakwe Sakwe! Soma!	1. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Abakobwa banjye babyina bose. (My daughters all dance together.)\r\n\r\nIgisubizo (Answer): Amababi y'umuvumu cyangwa urubingo mu muyaga. (The leaves of a ficus tree or reed grass in the wind.)\r\n\r\n2. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Inka yanjye yimira mu kinono, ikabyarira mu ihembe. (My cow conceives in its hoof and gives birth in its horn.)\r\n\r\nIgisubizo (Answer): Igitoki (The banana plant). [Explanation: The banana tree grows from the base (the corm/hoof) but produces the fruit at the very top (the horn).]\r\n\r\n3. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Rutuku rwa Ndagano yaguye ku ishyiga rirashya. (Rutuku [a red thing] of Ndagano fell on the stove and it burned.)\r\n\r\nIgisubizo (Answer): Urusenda. (A chili pepper.)\r\n\r\n4. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Kicara kitagira amabuno. (It sits down but has no buttocks.)\r\n\r\nIgisubizo (Answer): Igisabo cyangwa Umuvure. (A traditional milk gourd or a wooden brewing trough.)\r\n\r\n5. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Ndaterera, ndamanuka, singera iyo njya. (I climb up, I go down, but I never reach my destination.)\r\n\r\nIgisubizo (Answer): Umuryango / Urugi. (A door.) [Explanation: A traditional woven door swings back and forth but stays in the same place.]\r\n\r\n6. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Akabindi ka Mbindigiri ntiwamenya iyo kaviriye. (The little pot of Mbindigiri, you cannot tell where it leaks from.)\r\n\r\nIgisubizo (Answer): Igigi. (An egg.)\r\n\r\n7. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Ngeze mu ishyamba riratiha. (I reached the forest and it cleared my path / made way for me.)\r\n\r\nIgisubizo (Answer): Umusatsi n'igisokozo. (Hair and a comb.)\r\n\r\n8. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Mama ntabwo ahinga, ariko arampa nkararya. (My mother doesn't farm, but she gives me food to eat.)\r\n\r\nIgisubizo (Answer): Urusyo n'ingasire. (The traditional grinding stone.)\r\n\r\n9. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Twese turara munsi y'uruhu rumwe. (We all sleep under one skin.)\r\n\r\nIgisubizo (Answer): Ijuru n'isi. (The sky and the earth.)\r\n\r\n10. Sakwe sakwe! - Soma!\r\n\r\nIkibazo: Njugunye akabuye ngo dweee, kagaruka ngo dweee. (I threw a little stone and it went "dweee", it came back and went "dweee".)\r\n\r\nIgisubizo (Answer): Inyoni mu kirere cyangwa ijisho. (A bird in the sky, or the human eye glancing away and back.)	PROVERBS	KINYARWANDA	\N	{Ibisakuzo}	0	t	f	2026-03-01 14:04:03.332	2026-03-01 14:04:03.332	cmm7s7x8v0027gue9522g1c1m	\N	{"/uploads/1772373839499-sakwe sakwe.jpeg"}
\.


--
-- Name: _UserConversations _UserConversations_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserConversations"
    ADD CONSTRAINT "_UserConversations_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: awarded_badges awarded_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.awarded_badges
    ADD CONSTRAINT awarded_badges_pkey PRIMARY KEY (id);


--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: elder_requests elder_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.elder_requests
    ADD CONSTRAINT elder_requests_pkey PRIMARY KEY (id);


--
-- Name: forum_replies forum_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT forum_replies_pkey PRIMARY KEY (id);


--
-- Name: forum_topics forum_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_topics
    ADD CONSTRAINT forum_topics_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: polls polls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: wisdoms wisdoms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wisdoms
    ADD CONSTRAINT wisdoms_pkey PRIMARY KEY (id);


--
-- Name: _UserConversations_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_UserConversations_B_index" ON public."_UserConversations" USING btree ("B");


--
-- Name: awarded_badges_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "awarded_badges_userId_idx" ON public.awarded_badges USING btree ("userId");


--
-- Name: bookmarks_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "bookmarks_userId_idx" ON public.bookmarks USING btree ("userId");


--
-- Name: bookmarks_userId_wisdomId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "bookmarks_userId_wisdomId_key" ON public.bookmarks USING btree ("userId", "wisdomId");


--
-- Name: certificates_certificateNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "certificates_certificateNumber_key" ON public.certificates USING btree ("certificateNumber");


--
-- Name: certificates_quizAttemptId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "certificates_quizAttemptId_key" ON public.certificates USING btree ("quizAttemptId");


--
-- Name: certificates_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "certificates_userId_idx" ON public.certificates USING btree ("userId");


--
-- Name: comments_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comments_userId_idx" ON public.comments USING btree ("userId");


--
-- Name: comments_wisdomId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comments_wisdomId_idx" ON public.comments USING btree ("wisdomId");


--
-- Name: elder_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX elder_requests_status_idx ON public.elder_requests USING btree (status);


--
-- Name: elder_requests_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "elder_requests_userId_idx" ON public.elder_requests USING btree ("userId");


--
-- Name: forum_replies_authorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "forum_replies_authorId_idx" ON public.forum_replies USING btree ("authorId");


--
-- Name: forum_replies_topicId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "forum_replies_topicId_idx" ON public.forum_replies USING btree ("topicId");


--
-- Name: forum_topics_authorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "forum_topics_authorId_idx" ON public.forum_topics USING btree ("authorId");


--
-- Name: forum_topics_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX forum_topics_category_idx ON public.forum_topics USING btree (category);


--
-- Name: likes_userId_wisdomId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "likes_userId_wisdomId_key" ON public.likes USING btree ("userId", "wisdomId");


--
-- Name: likes_wisdomId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "likes_wisdomId_idx" ON public.likes USING btree ("wisdomId");


--
-- Name: meetings_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX meetings_date_idx ON public.meetings USING btree (date);


--
-- Name: meetings_hostId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "meetings_hostId_idx" ON public.meetings USING btree ("hostId");


--
-- Name: messages_conversationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "messages_conversationId_idx" ON public.messages USING btree ("conversationId");


--
-- Name: messages_senderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "messages_senderId_idx" ON public.messages USING btree ("senderId");


--
-- Name: polls_createdBy_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "polls_createdBy_idx" ON public.polls USING btree ("createdBy");


--
-- Name: polls_isActive_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "polls_isActive_endDate_idx" ON public.polls USING btree ("isActive", "endDate");


--
-- Name: quiz_attempts_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "quiz_attempts_userId_idx" ON public.quiz_attempts USING btree ("userId");


--
-- Name: suggestions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "suggestions_userId_idx" ON public.suggestions USING btree ("userId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_nationalId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_nationalId_key" ON public.users USING btree ("nationalId");


--
-- Name: users_resetToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_resetToken_key" ON public.users USING btree ("resetToken");


--
-- Name: votes_pollId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "votes_pollId_idx" ON public.votes USING btree ("pollId");


--
-- Name: votes_pollId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "votes_pollId_userId_key" ON public.votes USING btree ("pollId", "userId");


--
-- Name: votes_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "votes_userId_idx" ON public.votes USING btree ("userId");


--
-- Name: wisdoms_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wisdoms_category_idx ON public.wisdoms USING btree (category);


--
-- Name: wisdoms_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "wisdoms_createdAt_idx" ON public.wisdoms USING btree ("createdAt");


--
-- Name: wisdoms_language_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wisdoms_language_idx ON public.wisdoms USING btree (language);


--
-- Name: _UserConversations _UserConversations_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserConversations"
    ADD CONSTRAINT "_UserConversations_A_fkey" FOREIGN KEY ("A") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserConversations _UserConversations_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserConversations"
    ADD CONSTRAINT "_UserConversations_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: awarded_badges awarded_badges_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.awarded_badges
    ADD CONSTRAINT "awarded_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bookmarks bookmarks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bookmarks bookmarks_wisdomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT "bookmarks_wisdomId_fkey" FOREIGN KEY ("wisdomId") REFERENCES public.wisdoms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: certificates certificates_quizAttemptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "certificates_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES public.quiz_attempts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: certificates certificates_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_wisdomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_wisdomId_fkey" FOREIGN KEY ("wisdomId") REFERENCES public.wisdoms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: elder_requests elder_requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.elder_requests
    ADD CONSTRAINT "elder_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: forum_replies forum_replies_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT "forum_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: forum_replies forum_replies_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT "forum_replies_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public.forum_topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: forum_topics forum_topics_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_topics
    ADD CONSTRAINT "forum_topics_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: likes likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: likes likes_wisdomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_wisdomId_fkey" FOREIGN KEY ("wisdomId") REFERENCES public.wisdoms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meetings meetings_hostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT "meetings_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: polls polls_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT "polls_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: suggestions suggestions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT "suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: votes votes_pollId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT "votes_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES public.polls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: votes votes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wisdoms wisdoms_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wisdoms
    ADD CONSTRAINT "wisdoms_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hv8h8Jrd3Sp68yAm9BCU77hhAkFr7lySinsM9L2AtbIIjcO5mmcx1DEHZKLLw0q

