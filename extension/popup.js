import { parseSchedule } from "./lib/parser.js";
const button = document.getElementById('generate');
const status = document.getElementById("status");


button.addEventListener("click", async () =>{
    try{
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    const result = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: async () => {
            const response = await fetch("https://tss.ucsd.edu/sap/opu/odata/ited/EVENT_TIMETABLE_SRV/EventListSet?sap-client=500&$format=json&$inlinecount=allpages&$filter=(EventDate%20ge%20datetime%272026-09-01T00%3A00%3A00%27%20and%20EventDate%20le%20datetime%272026-12-31T00%3A00%3A00%27)");
            const raw = await response.json();
            return raw;
        }
    });    
    const raw = result[0].result;
    const parsed = parseSchedule(raw);
    const mapped = parsed.map((sections) => {
        const separate = "EventObjid eq " + "'" + String(Number(sections.id) )+ "'";
        return separate;
    });
    const filter = "AcYear eq " + "'" + "2026" + "'" + " and AcPeriod eq " + "'" + "2" + "'" + " and (" + mapped.join(' or ') + ")";
    const url = "https://tss.ucsd.edu/sap/opu/odata4/sap/yucsd_con_module_sb/srvd/sap/yucsd_con_module_servicedef/0001/YUCSD_CON_EVENTS" + "?sap-client=500&$filter=" + encodeURIComponent(filter);

    const socData = await chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        args: [url],
        func: async (url) => {
            const responseSoc = await fetch(url);
            const rawSoc = await responseSoc.json();
            return rawSoc;
        }
    });


    const rawSoc = socData[0].result;
    await chrome.storage.local.set({raw});
    await chrome.storage.local.set({rawSoc});
    await chrome.tabs.create({ url: chrome.runtime.getURL('visualizer/index.html') })
    }
    catch (error) {
        status.textContent = "Error: " + error.message;
    }
})