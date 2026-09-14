import { parseSchedule } from "./lib/parser.js";
const response = await fetch("../fixtures/quarter-capture.json");
const raw = await response.json();
const sections = parseSchedule(raw);
document.body.textContent = JSON.stringify(sections);