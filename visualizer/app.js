import { parseSchedule } from "./lib/parser.js";
import { renderGrid } from "./grid.js";
import { renderWarnings } from "./grid.js";
import { findConflicts } from "./conflicts.js";
import { enrichSections } from "./lib/parser.js";
let raw;
let rawSoc;
if(typeof chrome !== 'undefined' && chrome.storage){
    raw = (await chrome.storage.local.get('raw')).raw;
}else{
    raw = await (await fetch('../fixtures/quarter-capture.json')).json();
}

if(typeof chrome !== 'undefined' && chrome.storage){
    rawSoc = (await chrome.storage.local.get('rawSoc')).rawSoc;
}else{
    rawSoc = await (await fetch('../fixtures/sections-capture.json')).json();
}


const sections = parseSchedule(raw);
const conflicts = findConflicts(sections);
const {sections: enriched, warnings} = enrichSections(sections, rawSoc);
renderGrid(enriched, conflicts);
renderWarnings(enriched, conflicts, warnings);