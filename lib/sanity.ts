// lib/sanity.ts
import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "53pclagh",
  dataset: "production",
  apiVersion: "2023-05-03",
  useCdn: false,  // Non cacheiamo da CDN, usiamo Sanity API diretta
  token: process.env.SANITY_API_READ_TOKEN,
});