/**
 * Shared API contract for the IToolbox Platform web client.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS HAND-MAINTAINED. THE TYPES IT ALIASES ARE NOT.
 *
 * api.gen.ts is generated from itoolbox-backend's committed OpenAPI schema and
 * must never be edited by hand:
 *
 *     npm run gen:types        # reads ../itoolbox-backend/contract/openapi.api.json
 *
 * This file puts a stable, domain-meaningful name on each generated schema. The
 * backend's own names are shaped by FastAPI response models (`SourceOut`,
 * `UserProfileOut`), an implementation detail the client should not track.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { components } from "./api.gen";

type Api = components["schemas"];

// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserProfile = Api["UserProfileOut"];
export type TokenResponse = Api["TokenResponse"];

// ── Admin ─────────────────────────────────────────────────────────────────────
export type CreateUserRequest = Api["CreateUserRequest"];
export type UpdateUserRequest = Api["UpdateUserRequest"];
/** The roles the backend accepts, highest first. */
export type GlobalRole = CreateUserRequest["global_role"];

// ── Data harness (Zetaris) ────────────────────────────────────────────────────
export type HarnessStatus = Api["HarnessStatus"];
export type DataSource = Api["SourceOut"];
export type Table = Api["TableOut"];
export type Column = Api["ColumnOut"];
export type QueryRequest = Api["QueryRequest"];
export type QueryResult = Api["QueryResult"];

// ── Agent ─────────────────────────────────────────────────────────────────────
export type ModelInfo = Api["ModelInfo"];
export type ModelCheck = Api["ModelCheck"];
export type AskRequest = Api["AskRequest"];
export type Evidence = Api["Evidence"];
export type InvestigationSummary = Api["InvestigationSummary"];
export type InvestigationDetail = Api["InvestigationDetail"];

/** One server-sent event of POST /api/v1/agent/ask; narrow it by `type`. */
export type AgentEvent = Api["AgentEvent"];
export type InvestigationStartedEvent = Api["InvestigationStartedEvent"];
export type StatusEvent = Api["StatusEvent"];
export type ToolCallEvent = Api["ToolCallEvent"];
export type ToolResultEvent = Api["ToolResultEvent"];
export type AnswerEvent = Api["AnswerEvent"];
export type ErrorEvent = Api["ErrorEvent"];
export type DoneEvent = Api["DoneEvent"];
export type InvestigationStatus = InvestigationSummary["status"];
