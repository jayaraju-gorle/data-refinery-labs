export const SITE = "https://www.datatoolkitforsheets.com";

export interface Post { title: string; summary: string; url: string; date: string; tag: "API Tool" | "Cricket" }

export const posts: Post[] = [
  { title: "How to Automate Recurring API Calls with Google Sheets: A Complete Guide", summary: "Set up automated API calls that sync data directly to Google Sheets — Apps Script, API integration, scheduling and real-world examples.", url: "/blog/automate-recurring-api-calls-google-sheets", date: "2025-08-11", tag: "API Tool" },
  { title: "Power User Guide: Automate API Workflows in Google Sheets with Data Toolkit", summary: "Schedule API calls, map JSON to sheets, batch testing, visualizations and more with the Data Toolkit API Tool.", url: "/blog/power-user-guide-api-tool", date: "2025-08-10", tag: "API Tool" },
  { title: "India vs England Test Series 2025: Schedule, Results, Key Players & Storylines", summary: "Full overview of the India vs England Test series 2025: schedule, results, key players and what to watch next.", url: "/blog/indeng2025/ind-tour-of-england-2025-series-overview", date: "2025-07-15", tag: "Cricket" },
  { title: "India vs England 3rd Test 2025: England Win a Lord's Classic, Series 2-1", summary: "England edge India by 22 runs in a Lord's thriller to take a 2-1 lead in the Anderson-Tendulkar Trophy.", url: "/blog/indeng2025", date: "2025-07-15", tag: "Cricket" },
  { title: "India Women vs England Women T20I Series 2025: Momentum, Milestones & More", summary: "Recap of the India Women tour of England T20I series — results, standout performers and milestones.", url: "/blog/indeng2025", date: "2025-07-10", tag: "Cricket" },
  { title: "IND vs ENG 2nd Test 2025: India Crush England by 336 Runs at Edgbaston", summary: "India level the series with a dominant win at Edgbaston. Match summary, scorecard and highlights.", url: "/blog/indeng2025", date: "2025-07-07", tag: "Cricket" },
  { title: "India vs England 1st Test 2025: Match Summary, Result & Key Highlights", summary: "How the opening Test at Headingley unfolded, with key moments and stats.", url: "/blog/indeng2025", date: "2025-06-25", tag: "Cricket" },
  { title: "ICC World Test Championship 2025 Final: Australia vs South Africa", summary: "Complete coverage of the WTC 2025 Final at Lord's.", url: "/blog/wtc-2025", date: "2025-06-06", tag: "Cricket" },
];
