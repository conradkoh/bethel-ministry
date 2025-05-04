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
import type * as appinfo from "../appinfo.js";
import type * as auth from "../auth.js";
import type * as cleanupTasks from "../cleanupTasks.js";
import type * as crypto from "../crypto.js";
import type * as migration from "../migration.js";
import type * as participants_mutations from "../participants/mutations.js";
import type * as participants_queries from "../participants/queries.js";
import type * as presentations from "../presentations.js";
import type * as serviceDesk from "../serviceDesk.js";
import type * as teams from "../teams.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appinfo: typeof appinfo;
  auth: typeof auth;
  cleanupTasks: typeof cleanupTasks;
  crypto: typeof crypto;
  migration: typeof migration;
  "participants/mutations": typeof participants_mutations;
  "participants/queries": typeof participants_queries;
  presentations: typeof presentations;
  serviceDesk: typeof serviceDesk;
  teams: typeof teams;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
