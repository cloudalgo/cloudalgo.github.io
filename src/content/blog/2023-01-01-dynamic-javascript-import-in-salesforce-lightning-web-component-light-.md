---
title: "Dynamic Javascript import in Salesforce Lightning Web Component (Light Dom with LWC With Stripe live js)"
date: 2023-01-01
category: Salesforce
excerpt: "Recently with the release salesforce launched support of Light DOM (Beta) using that we can inject the live js library inside our component without turning off LWS / Lightning locker.

Here I am givin"
readTime: 3
image: /blog-images/5e16611d37dc352a2525cbd77af54dc81b9b95e7-850x382.png
published: true
author: "Vikash Agarwal"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/32c050b8f0ed847ec0b34f5144d2fa6b03a40888-200x200.jpg"
---

**The Importance of Secure Integration in LWC**

In the world of Salesforce development, security is paramount. Salesforce's Locker Service is a crucial component that enhances the security of Lightning Web Components (LWC). It restricts direct access to global variables and functions, ensuring that components cannot interfere with each other. However, this level of security sometimes posed a challenge when developers needed to integrate external JavaScript libraries into their LWC components. The good news is that Salesforce has introduced a solution - Light DOM (Beta).

**Introducing Light DOM (Beta)**

Light DOM is Salesforce's answer to the challenge of integrating external JavaScript libraries while maintaining the high level of security provided by Locker Service. It enables developers to include live JavaScript libraries within LWC components without compromising security. In essence, Light DOM acts as a bridge between the protected LWC environment and external libraries, allowing controlled interaction.

**Example: Integrating Stripe into an LWC Component**

Let's walk through a practical example of integrating the Stripe payment gateway into an LWC component using Light DOM. Please note that the Stripe publishable key used here is for demonstration purposes only.

**Component Structure**

In our example, we have two components:

- **stripeParent**: This component creates an environment for the child component and facilitates the use of Light DOM.
- **stripeComponent**: This is the core component where we load the live Stripe library and mount the card element.
**Code Implementation**

Now, let's delve into the code:

**stripeComponent.lwc**
stripeComponent.html
```
1<template>
2    <div>
3        <!-- Your Stripe integration code here -->
4        <div id="stripe-card-element"></div>
5    </div>
6</template>
```

Inside the `stripeComponent`, we create a placeholder `<div>` with the id `stripe-card-element`. This is where we'll mount the Stripe card element.


stripeComponent.js
```
1import { LightningElement, track } from 'lwc';
2
3export default class StripeComponent extends LightningElement {
4    @track stripeLoaded = false;
5
6    renderedCallback() {
7        if (this.stripeLoaded) {
8            return;
9        }
10
11        // Load the Stripe library dynamically
12        const script = document.createElement('script');
13        script.src = 'https://js.stripe.com/v3/';
14        script.onload = () => {
15            this.stripeLoaded = true;
16            // Initialize Stripe and use it as needed
17            const stripe = Stripe('your_publishable_key');
18            const elements = stripe.elements();
19
20            // Mount the card element
21            const card = elements.create('card');
22            card.mount('#stripe-card-element');
23        };
24
25        // Add the script to the DOM
26        document.body.appendChild(script);
27    }
28}
```



**stripeParent.lwc**
stripeParent.html
```
1<template lwc:render-mode="light">
2  <c-stripe-component></c-stripe-component>
3</template>
4
```

In the template, `stripeParent` includes the `c-stripe-component`, which is the component where we'll work with Stripe.
stripeParent.js
```
1import { LightningElement } from "lwc";
2
3export default class StripeParent extends LightningElement {
4  static renderMode = "light";
5}
6
```

In the JavaScript file for `stripeComponent`, we use the `renderedCallback` lifecycle hook to load the Stripe library dynamically. We ensure that the Stripe library is loaded only once by tracking the `stripeLoaded` property.


**Conclusion**

With the introduction of Light DOM (Beta) in Lightning Web Components, Salesforce has addressed the challenge of securely integrating external JavaScript libraries. This capability allows developers to continue benefiting from the robust security provided by Locker Service while seamlessly incorporating live JavaScript libraries like Stripe into their LWC components. By following the example outlined in this blog post, you can leverage Light DOM to enhance your Salesforce development projects with external integrations, all within a secure environment.


<div
