const palette = ['#2a78d6','#eb6834','#1baf7a','#eda100','#e87ba4','#008300','#4a3aa7','#e34948'];

function formatDays(weekdays){
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = weekdays.map((dayNum) => {
        const curDay = dayNames[dayNum];
        return curDay;
    });
    return days;
}

function formatDay(day){
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames[day];
}

function formatTime(minutes){
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const suffix = hours < 12 ? "AM" : "PM";
    const hour12 = hours % 12 || 12;

    const formattedMins = String(mins).padStart(2, "0");

    const time = hour12 + ":" + formattedMins + " " + suffix;
    return time;
}

export function renderWarnings(sections, conflicts){
    const warning = document.getElementById('warnings');
    warning.replaceChildren();
    for(const conflict of conflicts){
        const a = sections.find(s => s.id === conflict.a);
        const b = sections.find(s => s.id === conflict.b);
        const day = formatDays(conflict.days).join(', ');    
        warning.append(a.classSection + " and " + b.classSection + " overlap on " + day + ".");
    }
}

export function renderGrid(sections, conflicts){
    const conflictKeys = new Set();
    for (let i = 0; i < conflicts.length; i++) {
    const conflict = conflicts[i];

        for (let j = 0; j < conflict.days.length; j++) {
            const day = conflict.days[j];
            conflictKeys.add(conflict.a + '|' + day);
            conflictKeys.add(conflict.b + '|' + day);
        }
    }
    const scheduleContainer = document.getElementById('container');
    scheduleContainer.replaceChildren();
    const gather = sections.flatMap(s => s.weekdays);
    const unsortDaysToRender = new Set(gather);
    const alwaysDays = new Set([1, 2, 3, 4, 5]);
    const unionDays = unsortDaysToRender.union(alwaysDays);
    const arrayDaysToRender = Array.from(unionDays);
    const daysToRender = arrayDaysToRender.sort((a, b) => a - b);
    for (const [index, day] of daysToRender.entries()) {
        const div = document.createElement('div');
        div.className = "day-header";
        div.textContent = formatDay(day);
        div.style.gridRow = 1;
        div.style.gridColumn = index + 2
        scheduleContainer.append(div);
    }
    scheduleContainer.style.setProperty('--columns', daysToRender.length);

    for (const index of daysToRender.keys()) {
        const columnBg = document.createElement('div');
        columnBg.className = 'column-bg';
        columnBg.style.gridColumn = index + 2;
        columnBg.style.gridRow = '2 / -1';
        scheduleContainer.append(columnBg);
    }

    const ids = sections.map((id) => {
        return id.courseId;
    })
    const idSet = new Set(ids);
    const idArray = Array.from(idSet);
    const sortedIDS = idArray.sort((a, b) => a - b);

    let earliest;
    let latest;            
    const unscheduled = [];

    for(const classTime of sections){
        if(classTime.startTime === null || classTime.endTime === null ){
            continue; 
        } 
        if(typeof earliest === "undefined"){
            earliest = classTime.startTime;
            latest = classTime.endTime;
        }
        else{
            if(classTime.startTime < earliest){
                earliest = classTime.startTime;
            }
            if(classTime.endTime > latest){
                latest = classTime.endTime;
            }
        }
    }
    earliest = Math.floor(earliest / 60) * 60;
    latest = Math.ceil(latest / 60) * 60;
    const rows = (latest - earliest) / 5;
    scheduleContainer.style.setProperty('--rows', rows);

    for (let hour = earliest; hour <= latest; hour += 60) {
        const hourDiv = document.createElement('div');
        hourDiv.className = "hour-label";
        hourDiv.textContent = formatTime(hour);
        hourDiv.style.gridRow = (hour - earliest) / 5 + 2;
        hourDiv.style.gridColumn = 1;
        scheduleContainer.append(hourDiv);
    }

    for(const section of sections){
        if(section.startTime === null || section.endTime === null){
            unscheduled.push(section);
            continue;
        }
        const timeText = formatTime(section.startTime) + "-" + formatTime(section.endTime);    
        const hue = palette[sortedIDS.indexOf(section.courseId )]?? '#999';
        for(const day of section.weekdays){
            const dayName = formatDay(day);
            const startRow = (section.startTime - earliest)/ 5 + 2;
            const endRow = (section.endTime - earliest)/ 5 + 2;



            const block = document.createElement('div');
            block.className = 'block';

            if(conflictKeys.has(section.id + '|' + day)){
                block.classList.add('conflict')
            }

            const classDiv = document.createElement('div');
            classDiv.className = 'class';
            classDiv.textContent = section.classSection;

            const dayDiv = document.createElement('div');
            dayDiv.className = 'days';
            dayDiv.textContent = dayName;

            const timeDiv = document.createElement('div');
            timeDiv.className = 'time';
            timeDiv.textContent = timeText;

            const roomDiv = document.createElement('div');
            roomDiv.className = 'room';
            roomDiv.textContent = section.room;
            block.style.gridRow = startRow + ' / ' + endRow ;
            block.style.gridColumn = daysToRender.indexOf(day) + 2;
            block.style.setProperty('--course-color', hue);
            block.append(classDiv, dayDiv, timeDiv, roomDiv);
            scheduleContainer.append(block);
        }
    }
    const unscheduledContainer = document.getElementById('unscheduled');
    unscheduledContainer.replaceChildren();
    for(const sect of unscheduled){
        const unscheduledDiv = document.createElement('div');
        unscheduledDiv.textContent = sect.classSection + " - No meeting time listed."; 
        unscheduledContainer.append(unscheduledDiv);
    }

}