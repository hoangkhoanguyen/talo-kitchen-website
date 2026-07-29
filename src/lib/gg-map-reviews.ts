"use server";
import axios from "axios";
import { getEnv } from "./env";
import { createCachedFunction } from "./cache";

const axiosInstance = axios.create({
  baseURL: "https://serpapi.com",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

interface GoogleMapReview {
  user: {
    name: string;
    thumbnail: string;
  };
  rating: number;
  date: string;
  snippet: string;
  link: string;
}

async function fetchGoogleMapReviews() {
  try {
    const env = getEnv();
    const response = await axiosInstance.get("/search", {
      params: {
        engine: "google_maps_reviews",
        data_id: "0x36cc790027c0bf85:0x90bf6fceff974488", // Example Place ID
        api_key: env.SERPAPI_API_KEY,
      },
    });
    return response.data.reviews as GoogleMapReview[];
  } catch (error) {
    console.log("error on get gg map reviews", error);
    throw error;
  }
}

/**
 * Cached version of Google Maps Reviews
 * Cache duration: 8 hours (28800 seconds)
 */
export const getGoogleMapReviews = createCachedFunction(
  fetchGoogleMapReviews,
  ["google-maps-reviews"],
  ["google-maps-reviews"],
  28800, // 8 hours in seconds
);
