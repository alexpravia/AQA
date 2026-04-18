# 🌍 Multi-Agent Travel Advisor — Agentathon Plan

## Concept
A conversational travel planner powered by multiple specialized AI agents that collaborate to build, optimize, and "book" a complete trip itinerary — all within budget.

---

## Architecture

### Agents
| Agent | Role | Tools |
|-------|------|-------|
| **Orchestrator** | Parses user request, delegates to sub-agents, enforces budget, resolves conflicts | Calls all sub-agents |
| **Flight Agent** | Searches for flights, compares options, ranks by price/duration/stops | Tavily search |
| **Hotel Agent** | Finds accommodation matching preferences (location, stars, amenities) | Tavily search |
| **Activities Agent** | Curates experiences based on interests, location, and weather | Tavily search |
| **Budget Agent** | Tracks spending across categories, suggests trade-offs when over budget | Internal logic |

### Flow
```
User: "Plan a 4-day trip to Barcelona, $2000 budget, I like hiking and seafood"
        │
        ▼
   Orchestrator (parses intent, extracts: destination, dates, budget, preferences)
        │
   ┌────┼────┐
   ▼    ▼    ▼
Flight Hotel Activities
Agent  Agent  Agent
   │    │    │
   └────┼────┘
        ▼
   Budget Agent (validates total ≤ $2000, proposes trade-offs if needed)
        │
        ▼
   Orchestrator (assembles final itinerary)
        │
        ▼
   Discord post / JSON receipt / visual itinerary
```

---

## Key Features

### MVP (must have — first 2 hours)
- [ ] User inputs: destination, dates, budget, interests
- [ ] Flight agent searches real flights via Tavily
- [ ] Hotel agent searches real hotels via Tavily
- [ ] Activities agent finds things to do
- [ ] Orchestrator combines into a day-by-day itinerary
- [ ] Budget tracking with running total
- [ ] Post final itinerary to Discord

### Stretch (next 1-2 hours)
- [ ] Preference memory ("I hate layovers", "vegetarian", "no hostels")
- [ ] Trade-off negotiation ("You're $200 over — downgrade hotel or cut an activity?")
- [ ] Weather-aware activity planning (pull forecast, adjust outdoor plans)
- [ ] "What if" mode — "What if I add a day?" / "What if I had $500 more?"
- [ ] Group trip mode — multiple preference sets, find the compromise

### Demo Polish
- [ ] Clean formatted itinerary output (markdown table with times, costs, links)
- [ ] Conversational follow-ups ("Swap the hotel" / "Find cheaper flights")
- [ ] Show agent-to-agent communication in logs for judges

---

## Tech Stack
- **Runtime:** Google Colab (single notebook)
- **LLM:** OpenAI GPT-4o
- **Search:** Tavily API (real-time web search for flights, hotels, activities)
- **Output:** Discord webhook + structured JSON
- **APIs (stretch):** Amadeus sandbox (flights), Google Places (activities), weather API

---

## Agent Implementation Pattern

Each agent = a function with its own system prompt + tools:

```python
def flight_agent(destination, dates, budget):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": """You are a flight search specialist.
            Search for the best flights matching the criteria.
            Return structured JSON with: airline, price, departure, arrival, stops, duration."""},
            {"role": "user", "content": f"Find flights to {destination} for {dates}, budget ${budget}"}
        ],
        tools=[tavily_tool]
    )
    return parse_flight_results(response)
```

The orchestrator calls each agent, collects results, and assembles the itinerary.

---

## "Booking" Strategy (No Real $$$)
1. Agent searches **real** flights/hotels/activities with real prices
2. User selects options conversationally
3. "Booking" = save a structured JSON receipt + post to Discord
4. Demo shows full flow: search → compare → negotiate → confirm
5. Optional: Stripe test mode checkout with fake card `4242 4242 4242 4242`

---

## Award Strategy
| Award | How We Win |
|-------|-----------|
| **Best Value** | Saves hours of research + optimizes budget automatically |
| **Best Idea** | Multi-agent collaboration with real-time negotiation |
| **Best Use Case** | Everyone travels — universal, practical, immediately useful |

---

## Open Questions / Brainstorm
- What other agents could we add? (Visa/passport checker? Packing list generator?)
- Should we support multi-city trips?
- How detailed should the day-by-day itinerary be?
- Do we want a name/brand for the agent?

---

## Quick Start
1. Open `agentathon_final.ipynb` in Google Colab
2. Add your API keys in Colab Secrets (OPENAI_API_KEY, TAVILY_API_KEY, DISCORD_WEBHOOK_URL)
3. Run all cells
4. Start chatting!
