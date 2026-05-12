---
title: "Formatting a Apex Time into String (in apex class)"
date: 2022-06-06
category: Salesforce
excerpt: "Since as on today we don’t have any inbuilt method which can format this type of String “ 14:00:00.000Z” like “2:00 PM” So wrote a snippet for this and may be useful."
readTime: 3
image: /blog-images/f4996321c58486dc7be36f56159974a5ee7ed576-1200x600.jpg
published: true
author: "Vikash Agarwal"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/32c050b8f0ed847ec0b34f5144d2fa6b03a40888-200x200.jpg"
---

Since as on today we don’t have any inbuilt method which can format this type of String “ *14:00:00.000Z*” like “2:00 PM” So wrote a snippet for this and may be useful.

```
1/**
2   * Expecting a time string will be looks like  14:00:00.000Z and expected output
3   * will be 02:00 PM/AM
4   */
5  public static String getFormattedTime(String sTime) {
6    if (String.isNotBlank(sTime)) {
7      List<String> listOfTimeToken = sTime.split(':');
8      if (
9        listOfTimeToken.size() == 3 &&
10        String.isNotBlank(listOfTimeToken[0]) &&
11        String.isNotBlank(listOfTimeToken[1])
12      ) {
13        Integer hr = Integer.valueOf(listOfTimeToken[0]);
14        String min = listOfTimeToken[1];
15String aMPM = hr > 12 ? ' PM' : ' AM';
16        hr = Math.mod(hr, 12);
17        hr = hr == 0 ? 12 : hr;
18        String sHr = hr.format();
19        sHr = sHr.leftPad(2, '0');
20        sTime = sHr + ':' + min + aMPM;
21      }
22    }
23    return sTime;
24  }
```
<div
