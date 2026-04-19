import { openai } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";

export const maxDuration = 60;

async function searchWeb(query: string): Promise<string> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: 5,
    }),
  });
  const data = await res.json();
  const results = data.results || [];
  if (results.length === 0) return "No results found.";
  return results
    .map(
      (r: { url: string; content: string }) =>
        `Source: ${r.url}\n${r.content.slice(0, 500)}`
    )
    .join("\n\n---\n\n");
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a travel planning assistant. You help users plan complete trips by searching for real flights, hotels, and activities.

WORKFLOW:
1. When a user asks to plan a trip, ask for: departure city, destination, dates, budget, and interests (if not provided).
2. Use search_flights, search_hotels, and search_activities to find REAL options.
3. Present a clear day-by-day itinerary with costs and booking links.
4. Keep the total within budget. If over, suggest trade-offs.

BOOKING RULES:
- When the user confirms ("book it", "yes", "let's do it"), you MUST call the book_trip tool.
- NEVER say something is booked without calling book_trip.
- When book_trip returns a result, show it to the user EXACTLY as-is. Do NOT modify or replace any URLs.

Always include real booking URLs from search results. Never make up URLs.`,
    messages,
    stopWhen: stepCountIs(10),
    tools: {
      search_flights: tool({
        description:
          "Search for real flights between two cities. Use this to find flight options with prices.",
        inputSchema: z.object({
          origin: z.string().describe("Departure city"),
          destination: z.string().describe("Arrival city"),
          dates: z.string().describe("Travel dates"),
          budget: z.number().describe("Max budget for flights in USD"),
        }),
        execute: async ({ origin, destination, dates, budget }) => {
          const query = `flights from ${origin} to ${destination} ${dates} under $${budget} prices booking`;
          return await searchWeb(query);
        },
      }),
      search_hotels: tool({
        description:
          "Search for real hotels in a destination. Use this to find accommodation with prices.",
        inputSchema: z.object({
          destination: z.string().describe("City to find hotels in"),
          dates: z.string().describe("Check-in and check-out dates"),
          budget: z.number().describe("Max budget for hotels in USD"),
        }),
        execute: async ({ destination, dates, budget }) => {
          const query = `hotels in ${destination} ${dates} under $${budget} per night booking.com expedia`;
          return await searchWeb(query);
        },
      }),
      search_activities: tool({
        description:
          "Search for activities and things to do at a destination.",
        inputSchema: z.object({
          destination: z.string().describe("City to find activities in"),
          interests: z.string().describe("User interests and preferences"),
        }),
        execute: async ({ destination, interests }) => {
          const query = `best ${interests} activities in ${destination} tripadvisor viator prices`;
          return await searchWeb(query);
        },
      }),
      book_trip: tool({
        description:
          "Book the trip by creating a Stripe payment checkout link. Call this when the user confirms they want to book.",
        inputSchema: z.object({
          destination: z.string().describe("Trip destination"),
          total_cost: z.number().describe("Total trip cost in USD"),
          itinerary_summary: z
            .string()
            .describe("Brief summary of the itinerary"),
        }),
        execute: async ({ destination, total_cost, itinerary_summary }) => {
          const bookingId = `TRV-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
          const date = new Date().toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          });
          return `🎫 BOOKING CONFIRMATION\nBooking ID: ${bookingId}\nDestination: ${destination}\nTotal: $${total_cost}\nBooked: ${date}\n\n${itinerary_summary}`;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
