/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accessLogs from "../accessLogs.js";
import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as bookings from "../bookings.js";
import type * as classes from "../classes.js";
import type * as clients from "../clients.js";
import type * as debug from "../debug.js";
import type * as drafts from "../drafts.js";
import type * as events from "../events.js";
import type * as logs from "../logs.js";
import type * as members from "../members.js";
import type * as messageGroups from "../messageGroups.js";
import type * as messages from "../messages.js";
import type * as notificationTemplates from "../notificationTemplates.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as programbookings from "../programbookings.js";
import type * as purchases from "../purchases.js";
import type * as schedule from "../schedule.js";
import type * as trainers from "../trainers.js";
import type * as userManagment from "../userManagment.js";
import type * as users from "../users.js";
import type * as visits from "../visits.js";
import type * as workouts from "../workouts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accessLogs: typeof accessLogs;
  admin: typeof admin;
  analytics: typeof analytics;
  bookings: typeof bookings;
  classes: typeof classes;
  clients: typeof clients;
  debug: typeof debug;
  drafts: typeof drafts;
  events: typeof events;
  logs: typeof logs;
  members: typeof members;
  messageGroups: typeof messageGroups;
  messages: typeof messages;
  notificationTemplates: typeof notificationTemplates;
  notifications: typeof notifications;
  orders: typeof orders;
  products: typeof products;
  programbookings: typeof programbookings;
  purchases: typeof purchases;
  schedule: typeof schedule;
  trainers: typeof trainers;
  userManagment: typeof userManagment;
  users: typeof users;
  visits: typeof visits;
  workouts: typeof workouts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
