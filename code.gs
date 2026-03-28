// ==========================================
// ADD YOUR NEW GEMINI API KEY HERE
// ==========================================
const GEMINI_API_KEY = "PASTE_YOUR_NEW_KEY_HERE";

// Use Google's built-in key-value store to save trips
const db = PropertiesService.getUserProperties();

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    let result = {};

    if (action === 'getTrips') {
      const keys = db.getKeys();
      result = { success: true, trips: keys };
      
    } else if (action === 'loadTrip') {
      const data = db.getProperty(payload.title);
      if (data) {
        result = { success: true, data: JSON.parse(data) };
      } else {
        result = { success: false, error: "Trip not found." };
      }
      
    } else if (action === 'update') {
      db.setProperty(payload.title, JSON.stringify(payload.tripData));
      result = { success: true };
      
    } else if (action === 'delete') {
      db.deleteProperty(payload.title);
      result = { success: true };
      
    } else if (action === 'generate') {
      const systemInstruction = `You are an expert travel planner. Create a highly detailed travel itinerary. 
      The trip dates are: ${payload.dates}. Number of pax: ${payload.pax}.
      Output MUST be perfectly formatted JSON matching this exact template structure. Do NOT wrap output in markdown tags like \`\`\`json.
      
      {
        "overview": { "title": "Trip Title", "dates": "${payload.dates}", "totalBudget": "$XXXX", "pax": "${payload.pax}" },
        "budget": [ { "item": "Flights", "cost": "$500", "amount": 500, "icon": "plane-takeoff" } ],
        "locations": [ { "id": "loc1", "name": "City Name", "color": "blue", "image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf" } ],
        "itinerary": [
          {
            "day": 1, "date": "Mon, Oct 1", "location": "loc1", "title": "Arrival",
            "events": [
              { "time": "10:00 AM", "desc": "Event description <span class='block text-sm font-normal text-slate-500 mt-1'>Sub-details</span>", "icon": "bed-double", "link": "", "latlng": [35.6895, 139.6917], "expense": 50 }
            ]
          }
        ]
      }

      Rules:
      - "color" must be one of: amber, teal, rose, violet, sky, emerald, pink, orange, purple.
      - "id" inside locations must be lowercase letters with no spaces.
      - "location" in itinerary MUST precisely match an "id" from locations.
      - "icon" must be a valid Lucide icon name.
      - "latlng" must be a 2-element array [latitude, longitude]. Use null if unknown.`;

      result = callGeminiAPI(systemInstruction, payload.prompt, payload.model);
      
      if (result.success) {
        db.setProperty(result.data.overview.title, JSON.stringify(result.data));
      }
      
    } else if (action === 'edit') {
      const systemInstruction = `You are an expert travel planner. The user wants to modify their existing itinerary.
      Here is their current JSON itinerary: ${JSON.stringify(payload.currentData)}
      
      Apply their requested changes to this data. 
      Output MUST be perfectly formatted JSON matching the exact same structure. Do NOT wrap output in markdown tags.`;

      result = callGeminiAPI(systemInstruction, payload.prompt, payload.model);
      
      if (result.success) {
        db.setProperty(result.data.overview.title, JSON.stringify(result.data));
      }
      
    } else {
      result = { success: false, error: "Unknown action requested." };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
                       .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  return ContentService.createTextOutput("AI Trip Planner backend is active and running!");
}

// ==========================================
// GEMINI API HANDLER
// ==========================================
function callGeminiAPI(systemInstruction, userPrompt, modelName) {
  const model = modelName || "gemini-3-flash-preview"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  const jsonSchema = {
    type: "OBJECT",
    properties: {
      overview: { type: "OBJECT", properties: { title: { type: "STRING" }, dates: { type: "STRING" }, totalBudget: { type: "STRING" }, pax: { type: "STRING" } } },
      budget: { type: "ARRAY", items: { type: "OBJECT", properties: { item: { type: "STRING" }, cost: { type: "STRING" }, amount: { type: "NUMBER" }, icon: { type: "STRING" } } } },
      locations: { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, name: { type: "STRING" }, color: { type: "STRING" }, image: { type: "STRING" } } } },
      itinerary: {
        type: "ARRAY", items: {
          type: "OBJECT", properties: {
            day: { type: "NUMBER" }, date: { type: "STRING" }, location: { type: "STRING" }, title: { type: "STRING" },
            events: {
              type: "ARRAY", items: {
                type: "OBJECT", properties: {
                  time: { type: "STRING" }, desc: { type: "STRING" }, icon: { type: "STRING" }, link: { type: "STRING" },
                  latlng: { type: "ARRAY", items: { type: "NUMBER" } }, expense: { type: "NUMBER" }
                }
              }
            }
          }
        }
      }
    }
  };

  const payload = {
    contents: [{ parts: [{ text: systemInstruction + "\n\nUser Request: " + userPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: jsonSchema
    }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    return { success: false, error: `API Error ${responseCode}: ${responseText}` };
  }

  const json = JSON.parse(responseText);
  if (!json.candidates || json.candidates.length === 0) {
    return { success: false, error: "No output generated from AI." };
  }

  let aiText = json.candidates[0].content.parts[0].text;
  aiText = aiText.replace(/^\s*```json/i, '').replace(/```\s*$/i, '').trim();

  try {
    const parsedData = JSON.parse(aiText);
    return { success: true, data: parsedData };
  } catch (err) {
    return { success: false, error: "Failed to parse AI JSON response." };
  }
}
