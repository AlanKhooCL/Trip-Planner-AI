✈️ AI Travel Planner

A beautiful, interactive, single-file web application that helps you plan, visualize, and track your travels. It features an integrated AI Trip Architect powered by Google's Gemini API, allowing you to generate complete, highly detailed itineraries from a simple text prompt.

✨ Features

🤖 AI Trip Architect: Describe your dream vacation, and the AI will generate a structured itinerary complete with daily events, locations, budget estimates, and map coordinates.

🗺️ Interactive Route Maps: Built-in Leaflet.js maps dynamically plot your daily activities, showing numbered pins and dotted routes for your day's journey.

💰 Expense Tracking: Track your actual spending against your estimated budget right on the itinerary timeline. Expenses are automatically saved to your browser's local storage.

🎨 Responsive & Beautiful UI: Styled entirely with Tailwind CSS, featuring smooth transitions, collapsible maps, and a location-based filtering system.

📦 Zero Build Step: Everything is contained within a single index.html file. No Node.js, Webpack, or complex build processes required.

🚀 Getting Started

Because this application is a single HTML file, getting started is incredibly simple.

1. Open the App

Just double-click the index.html file to open it in any modern web browser (Chrome, Firefox, Safari, Edge).

2. Set Up the AI Generator (Required for new trips)

To use the "Plan New Trip" AI feature on your local machine, you will need a free Gemini API key from Google.

Go to Google AI Studio and create a free API key.

Open index.html in any text editor.

Scroll down to the <script> section (around line 170).

Locate the apiKey variable and paste your key inside the quotes:

const apiKey = "YOUR_ACTUAL_API_KEY_HERE";


Save the file and refresh your browser. You can now click "Plan New Trip" and generate custom itineraries!

🛠️ Built With

This project relies on the following incredible tools via CDN (no installation required):

Tailwind CSS - Utility-first CSS framework for rapid UI development.

Lucide Icons - Clean, beautiful open-source icons.

Leaflet.js - The leading open-source JavaScript library for mobile-friendly interactive maps.

Gemini API - Google's multimodal AI model, utilized here to generate structured JSON itineraries.

💡 How the AI Works

The application uses a technique called Structured JSON Output. When you submit a prompt, the app sends a highly specific JSON schema to the Gemini API along with your request. Gemini is instructed to fill out this schema with realistic travel data, which is then parsed by the app and instantly injected into the UI state, regenerating the maps, budgets, and timelines without requiring a page reload.

💾 Data Storage

Your default/generated trip structure is stored in the application's JavaScript memory. If you update the "expense" fields on specific activities, those values are saved in your browser's localStorage. This means if you close the tab and return later, your actual spending data will be preserved!
