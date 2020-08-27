const FIRST_TIME_AQL = "SELECT starttime/(1000*60) as 'minute', \
(minute * (1000*60)) as 'Start time', \
eventcount as 'Count', devicetype as 'deviceType',\
LOGSOURCETYPENAME(devicetype) as 'device', \
count(*) as 'total' \
FROM events \
WHERE deviceType IN ( \
    SELECT deviceType FROM ( \
        SELECT devicetype as 'deviceType', \
        count(*) as 'total' \
        FROM events \
        where LOGSOURCETYPENAME(devicetype) ILIKE '%G-Suite%' \
        GROUP BY deviceType \
        ORDER BY total DESC \
        LIMIT 8 \
    ) \
) \
GROUP BY minute, device \
ORDER BY minute asc \
LAST ";
const SECOND_TIME_AQL = "SELECT starttime/(1000*60) as 'minute', \
(minute * (1000*60)) as 'Start time', \
eventcount as 'Count', devicetype as 'deviceType',\
LOGSOURCETYPENAME(devicetype) as 'device', \
count(*) as 'total' \
FROM events \
WHERE deviceType IN ( \
    SELECT deviceType FROM ( \
        SELECT devicetype as 'deviceType', \
        count(*) as 'total' \
        FROM events \
        where LOGSOURCETYPENAME(devicetype) ILIKE '%G-Suite%' \
        GROUP BY deviceType \
        ORDER BY total DESC \
        LIMIT 8 \
    ) \
) \
GROUP BY minute, device \
ORDER BY minute asc \
LAST ";
const FIRST_PIE_AQL = "SELECT \"App Name\" AS 'App Name', COUNT(*) AS 'Count' from events where \
Category = 3047 or Category = 3046 AND LOGSOURCETYPENAME(devicetype) LIKE '%G-Suite%' GROUP BY \"App Name\" order by \"Count\" desc last ";
const SECOND_PIE_AQL = "SELECT \"userName\" AS 'Username', COUNT(*) AS 'Count' from events where category = 3114 or category = 3046 or category = 3115 or category = 3047 \
and LOGSOURCETYPENAME(devicetype) LIKE '%G-Suite%' and userName != NULL GROUP BY \"userName\", qid order by \"Count\" desc LIMIT 1000 last ";
const THIRD_PIE_AQL = "SELECT QIDNAME(qid) AS 'Event Name', EventName as 'en',  COUNT(*) AS 'Count' from events where \
\"App Name\" iLIKE '%ADMIN%' and LOGSOURCETYPENAME(devicetype) LIKE '%G-Suite%'  GROUP BY qid order by \"Count\" desc last ";
const FOURTH_PIE_AQL = "SELECT QIDNAME(qid) AS 'Event Name', EventName as 'en',  COUNT(*) AS 'Count' from events where \
category = 19042 or category = 19018 or category = 19014 or category = 19012 or category = 19030  and LOGSOURCETYPENAME(devicetype) LIKE '%G-Suite%'  GROUP BY qid order by \"Count\" desc last ";

function pull(from) {
    document.getElementById("time-value").parentElement.disabled = true;
    document.getElementById("time-value").parentElement.style.cursor = "not-allowed";

    //showLoading(["timeCanvas", "time3Canvas", "time2Canvas", "appCanvas", "authCanvas", "adminCanvas", "auditCanvas", "offenses-table"]);
    showLoading(["timeCanvas", "time3Canvas"], ["appCanvas", "authCanvas", "adminCanvas", "auditCanvas"], ["time2Canvas", "offenses-table"]);

    executeSearch(SECOND_TIME_AQL + " " + from, createTimeApex, chartFail, "time2", "Username", "Timeline Events");
    executeSearch(FIRST_PIE_AQL + " " + from, createDonut, chartFail, "applications", "App Name", "Top 5 Application Authorize", ['#5DD9C1', '#ACFCD9', '#B084CC', '#665687', '#190933']);
    executeSearch(SECOND_PIE_AQL + " " + from, createDonut, chartFail, "authentications", "Username", "Top 5 Authentication", ['#87FF65', '#ACEB98', '#A4C2A8', '#5A5A66', '#2A2B2E']);
    executeSearch(THIRD_PIE_AQL + " " + from, createBar, chartFail, "admin", "Event Name", "Top 10 Admin Events", ['#5DD9C1', '#ACFCD9', '#B084CC', '#665687', '#B9B933', '#87FF65', '#ACEB98', '#A4C2A8', '#AAAA66', '#9ACB2E']);
    executeSearch(FOURTH_PIE_AQL + " " + from, createBar, chartFail, "audit", "Event Name", "Top 10 Audit Events", ['#87FF65', '#ACEB98', '#A4C2A8', '#AAAA66', '#9ACB2E', '#5DD9C1', '#ACFCD9', '#B084CC', '#665687', '#B9B933']);

    pullOffenses(["id", "offense_type", "offense_source", "description", "event_count", "start_time"], document.getElementById("offenses-table"), "timeCanvas", "time3Canvas", createRadial, chartFail);
}