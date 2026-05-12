---
title: "Converting Date and time and timezone to Datetime in GMT - Salesforce"
date: 2022-06-06
category: Salesforce
excerpt: "Some time we have to give ability to user to choose date and time and timezone separately and basis on that we have to calculate gmt value of them..."
readTime: 3
image: /blog-images/d1803b192e6851dc7fb5fc43ddb8f61a3934fb15-1400x563.jpg
published: true
featured: bottom-pick
author: "Vikash Agarwal"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/32c050b8f0ed847ec0b34f5144d2fa6b03a40888-200x200.jpg"
---

Some time we have to give ability to user to choose date and time and timezone separately and basis on that we have to calculate gmt value of them. Just one use case that a person define an event on Oct 8, 2020 at sharp 9:00 AM in PST. And basis on this we have to show event information on public site where any user can come and see ongoing or upcoming events in their timezone or other timezone as well. So in this case we required GMT conversion. One small function will do all the things.

*Tip: For daylight saving please use Country/City zone ids instead of Abbreviation(EST, EDT, PST etc.) This way we can calculate the offset properly.*

*America/New_York - EST
America/Los_Angeles - PST
America/Chicago -CST
America/Denver - MST
Pacific/Honolulu - HST*


```
1  /**
2  * Make sure that Timezone value should be java date time zone ids
3  * https://docs.oracle.com/javase/8/docs/api/java/time/ZoneId.html
4  * Also for daylight saving please use Country/City zone ids instead of Abberivation for example :
5  America/New_York  - EST
6  America/Los_Angeles - PST
7  America/Chicago -CST
8  America/Denver - MST
9  Pacific/Honolulu - HST
10  */
11
12  public static DateTime getDateTimeValueInGMTAsPerTimezone(
13    String timezoneValue,
14    Date dateValue,
15    Time timevalue
16  ) {
17    Timezone tz = Timezone.getTimeZone(timezoneValue);
18    Long dateTimeInMiliseconds = Datetime.newInstanceGmt(dateValue, timevalue)
19      .getTime();
20    Long timezoneOffset = tz.getOffset(
21      Datetime.newInstanceGmt(dateValue, timevalue)
22    );
23    return Datetime.newInstance(dateTimeInMiliseconds - timeZoneOffset);
24  }
25/*
26Use case 1 :  Daylight saving testing
27  Date myDate = Date.newInstance(2022, 12, 22);
28  Time myTime =Time.newInstance(18, 30, 2, 20);
29  String timeZone = 'America/Los_Angeles';
30  DateTime GMT = getDateTimeValueInGMTAsPerTimezone(timeZone,myDate,myTime);
31  System.debug('GMT -->'+GMT); //output 2022-12-23 02:30:02 (this is the GMT)
32
33Use case 2 :  Non Daylight saving testing
34  Date myDate = Date.newInstance(2022, 05, 22);
35  Time myTime =Time.newInstance(18, 30, 2, 20);
36  String timeZone = 'America/Los_Angeles';
37  DateTime GMT = getDateTimeValueInGMTAsPerTimezone(timeZone,myDate,myTime);
38  System.debug('GMT -->'+GMT); //output 2022-05-23 01:30:02 (this is the GMT)
39
40
41*/
42
```
<div
