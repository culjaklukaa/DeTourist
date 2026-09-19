import createClient from "openapi-fetch";
import type { paths } from "./generated/api";

export const apiClient = createClient<paths>({
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.19:8000",
});

export type * from "./generated/api";
