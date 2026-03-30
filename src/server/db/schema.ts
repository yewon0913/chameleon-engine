import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
  jsonb,
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
