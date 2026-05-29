---
title: "Navigation in Salesforce Digital Experiences (sites / communities) LWC"
date: 2022-05-05
category: Salesforce
excerpt: "I was having issue with NavigationMixin(LightningElement) while working in Salesforce Experience cloud (sites - Guest user), I was unable to navigate from one site page to another using code. Working "
readTime: 3
image: /blog-images/bdd4dba68c01c037c041e86132ee8a64215e2ba9-1200x600.jpg
published: true
author: "Vikash Agarwal"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/32c050b8f0ed847ec0b34f5144d2fa6b03a40888-200x200.jpg"
---

I was having issue with NavigationMixin(LightningElement) while working in Salesforce Experience cloud (sites), I was unable to navigate from one site page to another using code. Working snippet of navigating from one site page to other (community and site page example)

Initial Code looks like this :

```javascript
let authenticatedUser = await this.callAuthenticationOrAnyother();if (!authenticatedUser) {
this[NavigationMixin.Navigate]({
type: "comm__namedPage",
attributes: {
name: "Sample1__c"
}
});
}
```

What are the things I was missing and how I fixed -

- Make sure the api name of the site page is exactly same (it’s a case sensitive and make sure you are appending __c in the end of the name just like mentioned above)
![image](/blog-images/dadc068a1104041e3373cf7aafc3e28e980f7cc7-395x551.webp)
image_site_navigation

<div
