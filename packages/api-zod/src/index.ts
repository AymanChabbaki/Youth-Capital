// Explicitly re-export core identifiers to resolve Node16/ESM deep-reexport failures
export { 
  HealthCheckResponse, 
  LoginBody, 
  LoginResponse, 
  RegisterBody, 
  GetForumPostsParams 
} from "./generated/api.js";

// Keep global exports for local convenience (IDE discovery)
export * from "./generated/api.js";
export * from "./generated/types/index.js";
