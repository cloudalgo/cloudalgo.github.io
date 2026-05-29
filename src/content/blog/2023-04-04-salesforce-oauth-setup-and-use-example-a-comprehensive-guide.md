---
title: "Salesforce OAuth Setup and Use Example: A Comprehensive Guide"
date: 2023-04-04
category: Salesforce
excerpt: "Step-by-step guide to setting up a Salesforce Connected App for OAuth, including the OAuth 2.0 flow and a working Node.js implementation example."
readTime: 4
image: /blog-images/2cc845d7ae68538fd778e5758ed0861708e0a76c-1200x600.jpg
published: true
author: "Sandeep Kumar"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
---

Salesforce OAuth is a protocol that allows users to authenticate and authorize third-party applications to access Salesforce data on their behalf. It's a crucial part of Salesforce's security model, ensuring that users have control over who can access their data and how.

In this blog, we'll walk you through the process of setting up Salesforce OAuth and provide an example of how to use it in a real-world scenario.

Setting Up Salesforce OAuth

- Create a Connected App The first step in setting up Salesforce OAuth is to create a Connected App. This involves defining the app's properties, such as the name, logo, and OAuth settings. To create a Connected App, follow these steps:
- Go to Setup > App Manager.
- Click the New Connected App button.
- Fill in the required fields, such as the app name and API name.
- Set the OAuth settings, such as the callback URL and OAuth scopes.
- Save the Connected App.
- Obtain Client ID and Secret After creating the Connected App, you need to obtain the Client ID and Secret, which will be used to authenticate the app. To obtain the Client ID and Secret, follow these steps:
- Go to Setup > App Manager.
- Click the name of the Connected App you just created.
- Scroll down to the OAuth section.
- Copy the Client ID and Secret values.
Using Salesforce OAuth in a Real-World Scenario Now that you've set up Salesforce OAuth, let's walk through an example of how to use it in a real-world scenario. In this example, we'll use Salesforce OAuth to authenticate a third-party application and allow it to access a user's Salesforce data.

- User Authorization The first step in the process is for the user to authorize the third-party application to access their Salesforce data. To do this, the third-party application sends a request to Salesforce, including the Client ID and a callback URL. Salesforce responds with a URL that the user can use to authorize the application.
- User Authentication Once the user has authorized the application, they are redirected to the callback URL, along with an access token and a refresh token. The access token is used to authenticate the application for a specific amount of time, while the refresh token can be used to obtain a new access token once the original one expires.
- Accessing Salesforce Data With the access token, the third-party application can now access the user's Salesforce data. It can use the Salesforce APIs to read, write, and modify data, according to the OAuth scopes that were defined in the Connected App.


#### Using Salesforce OAuth with Node.js

Now that you've set up Salesforce OAuth, let's look at an example of using it with Node.js.


```javascript
const express = require('express');
const request = require('request');
const querystring = require('querystring');
const app = express();

const clientId = '<your_client_id>';
const clientSecret = '<your_client_secret>';
const redirectUri = 'http://localhost:3000/oauth/callback';
const oauthUrl = 'https://login.salesforce.com/services/oauth2/authorize';
const tokenUrl = 'https://login.salesforce.com/services/oauth2/token';

app.get('/', (req, res) => {
  const authUrl = oauthUrl + '?' + querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri
  });
  res.redirect(authUrl);
});

app.get('/oauth/callback', (req, res) => {
  const authCode = req.query.code;
  const options = {
    url: tokenUrl,
    form: {
      code: authCode,
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    }
  };
  request.post(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const accessToken = JSON.parse(body).access_token;
      res.send('Access token: ' + accessToken);
    } else {
      res.send('Error: ' + error);
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

```

This code sets up an Express.js server with two endpoints: `/` and `/oauth/callback`. The `/` endpoint redirects the user to the Salesforce OAuth authorization page, passing the required parameters. Once the user authorizes the app, they are redirected to the `/oauth/callback` endpoint with an authorization code. The code is then exchanged for an access token using the Salesforce OAuth token URL.

Note that this code is just a sample and should not be used in production environments without proper security measures and error handling. It's important to follow best practices and guidelines when implementing Salesforce OAuth in your application.

In Conclusion Salesforce OAuth is a powerful tool for authenticating and authorizing third-party applications to access Salesforce data. By following the steps outlined in this blog, you can set up Salesforce OAuth and use it in a real-world scenario. With the right configuration and use case, Salesforce OAuth can help streamline your organization’s data access and improve security.

---

If you are building a connected app and need help with OAuth configuration, integration architecture, or security review, [see how we approach Salesforce integrations](/services/salesforce-consulting).

<div
