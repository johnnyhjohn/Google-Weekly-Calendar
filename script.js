$(document).ready(function(){
    var calendar = new CalendarFiner('https://www.googleapis.com/calendar/v3/calendars/[CALENDAR_ID]/events?orderBy=startTime&singleEvents=true&key=[API_KEY]', '[CALENDAR_ID]', '[API_KEY]');
    calendar.getCalendar();
})