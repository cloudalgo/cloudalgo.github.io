---
title: "Fixing Navigation in Salesforce Experience Cloud Sites with LWC"
date: 2022-05-05
category: Salesforce
excerpt: "NavigationMixin.Navigate fails silently in Experience Cloud when the page API name is wrong. Here is the working comm__namedPage snippet and the exact detail to check."
readTime: 1
image: /blog-images/bdd4dba68c01c037c041e86132ee8a64215e2ba9-1200x600.jpg
published: true
author: "Vikash Agarwal"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/32c050b8f0ed847ec0b34f5144d2fa6b03a40888-200x200.jpg"
---

`NavigationMixin.Navigate` fails silently in Experience Cloud when the page's API name doesn't match exactly. The name is case-sensitive, and custom site pages carry a `__c` suffix that is easy to leave off.

Here is the call that works, using the `comm__namedPage` page type:

```javascript
let authenticatedUser = await this.callAuthenticationOrAnyother();

if (!authenticatedUser) {
  this[NavigationMixin.Navigate]({
    type: "comm__namedPage",
    attributes: {
      name: "Sample1__c"
    }
  });
}
```

The one thing I had wrong was the `name` attribute. Copy the API name straight out of Experience Builder rather than retyping it — match the casing character for character, and keep the `__c` suffix:

![Site page API name in Experience Builder, showing the exact case-sensitive name including the __c suffix](/blog-images/dadc068a1104041e3373cf7aafc3e28e980f7cc7-395x551.webp)


---

If you are working on Salesforce Experience Cloud customisation and need to bring in external libraries, you might find [Loading Stripe.js in an LWC: Why You Need Light DOM](/blog/loading-stripe-js-in-lwc-light-dom/) useful as well.
