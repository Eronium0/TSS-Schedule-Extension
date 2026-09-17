export function findConflicts(sections){
    const overlap = [];
    for(let i = 0 ; i <= sections.length - 1; i++){
        for(let j = i + 1; j <= sections.length - 1; j++){
            if(sections[i].startTime === null || sections[j].startTime === null){
                continue;
            }
            if(sections[i].weekdays.some(day => sections[j].weekdays.includes(day))){
                const sharedDays = sections[i].weekdays.filter(day =>
                    sections[j].weekdays.includes(day)
                ); 
                if(sections[i].startTime < sections[j].endTime && sections[j].startTime < sections[i].endTime){
                    overlap.push({
                        a: sections[i].id,
                        b: sections[j].id,
                        days: sharedDays
                    });
                }
            }
        }
    }
    return overlap;
}