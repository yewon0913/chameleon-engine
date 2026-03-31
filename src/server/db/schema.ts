import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export const chameleonClients = pgTable("chameleon_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone"),
  businessType: text("business_type"),
  businessName: text("business_name"),
  snsInstagram: text("sns_instagram"),
  snsTiktok: text("sns_tiktok"),
  snsYoutube: text("sns_youtube"),
  snsBlog: text("sns_blog"),
  marketingGoal: text("marketing_goal"),
  monthlyBudget: text("monthly_budget"),
  status: text("status").notNull().default("문의"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonProjects = pgTable("chameleon_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => chameleonClients.id, { onDelete: "cascade" }),
  projectType: text("project_type").notNull(),
  title: text("title"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull().default(0),
  deadline: date("deadline"),
  progress: integer("progress").notNull().default(0),
  status: text("status").notNull().default("대기"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonNotes = pgTable("chameleon_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => chameleonClients.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  nextAction: text("next_action"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonRevenue = pgTable("chameleon_revenue", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => chameleonClients.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => chameleonProjects.id, { onDelete: "set null" }),
  amount: integer("amount").notNull().default(0),
  serviceType: text("service_type").notNull(),
  channel: text("channel").notNull().default("직접"),
  status: text("status").notNull().default("미정산"),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonGoals = pgTable("chameleon_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  month: text("month").notNull().unique(),
  targetAmount: integer("target_amount").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonIntake = pgTable("chameleon_intake", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientName: text("client_name").notNull(),
  phone: text("phone"),
  businessType: text("business_type"),
  snsChannels: jsonb("sns_channels").default({}),
  currentMarketing: text("current_marketing"),
  desiredServices: text("desired_services").array(),
  goals: text("goals").array(),
  budget: text("budget"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonCalendar = pgTable("chameleon_calendar", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull().default("릴스"),
  status: text("status").notNull().default("기획"),
  channels: text("channels").array().default([]),
  deployTime: text("deploy_time"),
  memo: text("memo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonDeploys = pgTable("chameleon_deploys", {
  id: uuid("id").primaryKey().defaultRandom(),
  calendarId: uuid("calendar_id").references(() => chameleonCalendar.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("대기"),
  metricsViews: integer("metrics_views").default(0),
  metricsLikes: integer("metrics_likes").default(0),
  metricsComments: integer("metrics_comments").default(0),
  metricsShares: integer("metrics_shares").default(0),
  deployedAt: timestamp("deployed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonProspects = pgTable("chameleon_prospects", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type"),
  region: text("region"),
  instagramHandle: text("instagram_handle"),
  followers: integer("followers").default(0),
  lastPostDate: date("last_post_date"),
  contactStatus: text("contact_status").notNull().default("미발송"),
  messageSentAt: timestamp("message_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonPortfolio = pgTable("chameleon_portfolio", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => chameleonClients.id, { onDelete: "set null" }),
  projectSummary: text("project_summary"),
  results: jsonb("results").default({}),
  isPublic: boolean("is_public").default(false),
  slug: text("slug").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonTemplates = pgTable("chameleon_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  answerOptions: text("answer_options").array().default([]),
  businessType: text("business_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonAutopilot = pgTable("chameleon_autopilot", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  briefingItems: jsonb("briefing_items").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonFunnel = pgTable("chameleon_funnel", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id").references(() => chameleonProspects.id, { onDelete: "cascade" }),
  step: integer("step").notNull().default(1),
  messageContent: text("message_content"),
  status: text("status").notNull().default("대기"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonAbTests = pgTable("chameleon_ab_tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentId: uuid("content_id").references(() => chameleonCalendar.id, { onDelete: "set null" }),
  versionA: text("version_a").notNull(),
  versionB: text("version_b").notNull(),
  versionC: text("version_c"),
  metricsA: jsonb("metrics_a").default({}),
  metricsB: jsonb("metrics_b").default({}),
  metricsC: jsonb("metrics_c").default({}),
  winner: text("winner"),
  analysis: text("analysis"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chameleonSeasons = pgTable("chameleon_seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventName: text("event_name").notNull(),
  eventDate: date("event_date").notNull(),
  reminderDate: date("reminder_date"),
  templateSuggestions: jsonb("template_suggestions").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
