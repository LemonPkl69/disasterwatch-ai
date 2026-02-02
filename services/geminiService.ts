import { GoogleGenAI, Type } from "@google/genai";
import { DisasterEvent, DisasterType, DisasterResponse } from "../types";

const generateId = () => Math.random().toString(36).substr(2, 9);

export const fetchDisasterData = async (
  region: string
): Promise<DisasterResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are a strict, real-time disaster monitoring AI. 
    
    YOUR TASKS:
    1.  **Analyze the User's Search Region**: determine the central latitude and longitude of the region they searched for (e.g., if "Texas", find center of Texas).
    2.  **Find Disasters**: Search for CONFIRMED natural disasters occurring NOW or in the last 24 hours in that region.
    
    STRICT RULES FOR EVENTS:
    -   **ONLY** report: Wildfires, Floods, Earthquakes (>M4.0), Tornadoes, Tsunamis, Hurricanes/Typhoons, and Volcanic Eruptions.
    -   **IGNORE** standard weather (light rain, snow, normal heat, cloudy days). ONLY report if it is an official "WARNING" or "EMERGENCY" (e.g., "Flash Flood Warning").
    -   **VERIFICATION**: Use the Google Search tool to find recent news or official social media accounts (NWS, USGS, etc.). 
    -   **NO HALLUCINATIONS**: If no major disasters are found in the region, return an empty events list. Do not invent events to fill space.
    -   **SOURCE URL**: You MUST provide a specific valid URL (news article or official status page) verifying the event.
    
    OUTPUT FORMAT:
    Return a JSON object containing:
    -   "searchCenter": { lat, lng } (Center of the user's searched region)
    -   "zoomLevel": (Suggested zoom level: 5 for country, 8 for state, 11 for city)
    -   "events": [Array of disaster events]
  `;

  const prompt = `Search for real-time natural disaster alerts in: "${region}". 
  If the input is coordinates (e.g., lat:x, lng:y), search near there.
  Be extremely precise with location coordinates for events.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            searchCenter: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
              },
              required: ["lat", "lng"],
            },
            zoomLevel: { type: Type.NUMBER },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: Object.values(DisasterType) },
                  description: { type: Type.STRING },
                  locationName: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                    },
                    required: ["lat", "lng"],
                  },
                  severity: {
                    type: Type.STRING,
                    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                  },
                  source: { type: Type.STRING },
                  sourceUrl: { type: Type.STRING, description: "A valid URL source for this report" },
                  timestamp: { type: Type.STRING },
                },
                required: [
                  "title",
                  "type",
                  "description",
                  "locationName",
                  "coordinates",
                  "severity",
                  "source",
                ],
              },
            },
          },
          required: ["searchCenter", "events", "zoomLevel"],
        },
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from AI");
    }

    const data = JSON.parse(text);

    const events: DisasterEvent[] = (data.events || []).map((item: any) => ({
      id: generateId(),
      title: item.title,
      type: item.type as DisasterType,
      description: item.description,
      locationName: item.locationName,
      coordinates: item.coordinates,
      severity: item.severity,
      source: item.source,
      sourceUrl: item.sourceUrl,
      timestamp: item.timestamp || new Date().toISOString(),
      verified: true,
    }));

    return {
        events,
        searchCenter: data.searchCenter,
        zoomLevel: data.zoomLevel || 6
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const fetchEventDetails = async (event: DisasterEvent): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is missing from environment variables.");
    }
  
    const ai = new GoogleGenAI({ apiKey });
  
    const systemInstruction = `
      You are a specialized crisis reporter. Your goal is to provide a detailed, "up-to-the-minute" situation report for a specific ongoing disaster.
      
      Tasks:
      1. Search specifically for the LATEST updates (last 1-2 hours) regarding the event provided.
      2. Focus on: Containment %, Casualty counts, Structure damage, Evacuation orders, and Road closures.
      3. If the event is over or old, state that clearly.
      4. Provide the output as a clean Markdown formatted paragraph.
    `;
  
    const prompt = `
      Provide a detailed situation report for:
      Event: ${event.title} (${event.type})
      Location: ${event.locationName}
      Original Report: ${event.description}
      
      Search for the very latest news and official tweets.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
  
      return response.text || "No additional details found.";
    } catch (error) {
      console.error("Gemini Detail Error:", error);
      throw new Error("Failed to fetch detailed report.");
    }
};