import { parseSchedule } from "./lib/parser.js";
import { renderGrid } from "./grid.js";
import { renderWarnings } from "./grid.js";
import { findConflicts } from "./conflicts.js";
let raw;
if(typeof chrome !== 'undefined' && chrome.storage){
    raw = (await chrome.storage.local.get('raw')).raw;
}else{
    raw = await (await fetch('../fixtures/quarter-capture.json')).json();
}


const sections = parseSchedule(raw);
const conflicts = findConflicts(sections);
renderGrid(sections, conflicts);
renderWarnings(sections, conflicts);