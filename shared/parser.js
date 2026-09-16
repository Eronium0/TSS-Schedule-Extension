function parseDuration(str){
    const result = str.match(/^PT(?:(?<hours>\d+)H)?(?:(?<minutes>\d+)M)?(?:(?<seconds>\d+)S)?$/);
    if(result === null){
        return null;
    }
    const hours = Number(result.groups.hours ?? 0);
    const minutes = Number(result.groups.minutes ?? 0);
    const add = hours * 60 + minutes;
    return add;
}

function parseSapDate(str){
    const date = str.match(/^\/Date\((?<ms>\d+)\)\/$/);
    if(date === null){
        return null;
    }
    const result = new Date(Number(date.groups.ms));
    return result;
}

export function parseSchedule(raw){ 
    const rows = raw.d.results.filter(row => row.EventType === "01");
    const groups = Object.groupBy(rows, row => row.EventId);
    const sections = [];
    for(const[eventID, groupRows] of Object.entries(groups)){
        const tally = Object.groupBy(groupRows, row => row.StartTime + '|' + row.EndTime);        
        let mode = 0;
        let best = [];
        for (const [time, entryRows] of Object.entries(tally)) {
            if (entryRows.length > mode) {
                mode = entryRows.length;
                best = entryRows;
            }
        }
        const exceptionRows = groupRows.filter(row => !best.includes(row));
        const mapDay = best.map((row) => {
            return parseSapDate(row.EventDate).getUTCDay();
        });
        const daySet = new Set(mapDay);
        const day = Array.from(daySet);
        const sortedDays = day.sort((a, b) => a - b);        
        sections.push({
            id:            eventID,
            courseId:      best[0].ModuleId,
            component:     best[0].TeachingMethod,
            classSection:  best[0].EventName,
            title:         best[0].CourseName,
            weekdays:      sortedDays,
            startTime:     parseDuration(best[0].StartTime),
            endTime:       parseDuration(best[0].EndTime),
            room:          best[0].Room,
            firstMeeting:  parseSapDate(best[0].EventDate),
            lastMeeting:   parseSapDate(best[best.length - 1].EventDate),
            exceptionRows
        });
    }
    return sections;
}

