---
title: "A Comprehensive Guide to Using REST and SOAP APIs in Salesforce with Node.js"
date: 2023-04-04
category: Heroku
excerpt: "Salesforce is a powerful CRM platform that offers a variety of APIs to integrate with external systems. The REST API and SOAP API are two of the most commonly used APIs in Salesforce for integrating w"
readTime: 11
image: /blog-images/870f59fff70dbc1fc789c519719f547d9151d3e6-1200x600.jpg
published: true
author: "Sandeep Kumar"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
---

Salesforce provides a variety of APIs to interact with its platform and data, including REST and SOAP APIs. These APIs allow developers to access, manipulate, and integrate data from Salesforce with external systems. In this blog post, we'll provide a comprehensive guide to using REST and SOAP APIs in Salesforce with Node.js and their key differences.

## Understanding REST and SOAP APIs

REST API:

- REST stands for Representational State Transfer, which is a software architecture style that uses HTTP methods and URLs to manipulate resources.
- REST API is a web service that uses HTTP methods such as GET, POST, PUT, PATCH, and DELETE to perform CRUD (Create, Read, Update, Delete) operations on Salesforce objects.
- REST API returns data in JSON format by default, but it can also return data in XML format if requested.
SOAP API:

- SOAP stands for Simple Object Access Protocol, which is a messaging protocol that uses XML format to send and receive messages.
- SOAP API is a web service that uses the SOAP protocol to perform CRUD operations on Salesforce objects.
- SOAP API requires a WSDL (Web Services Description Language) file to describe the operations and data types available in the API.
- SOAP API returns data in XML format.
Key differences between REST and SOAP APIs:

- REST API is lightweight and flexible, while SOAP API is more structured and standardized.
- REST API uses HTTP methods and URLs, while SOAP API uses XML messages and WSDL files.
- REST API is faster and more efficient for simple CRUD operations, while SOAP API is better for complex operations and enterprise-level integrations.
When to use REST and SOAP APIs in Salesforce:

- Use REST API for simple CRUD operations and lightweight integrations.
- Use SOAP API for complex operations, enterprise-level integrations, and when the integration requires a formal contract with a WSDL file.
## REST API in Salesforce with Node.js

REST API basics: To use the REST API in Salesforce, you need to:

- Authenticate and authorize REST API access using OAuth 2.0.
- Use HTTP methods such as GET, POST, PUT, PATCH, and DELETE to perform CRUD operations on Salesforce objects.
- Use SOQL (Salesforce Object Query Language) to query data from Salesforce objects.
- Use SOSL (Salesforce Object Search Language) to search data across multiple objects.
Authenticating and authorizing REST API access: To authenticate and authorize REST API access, you can follow these steps:

- Create a connected app in Salesforce and obtain the client ID and client secret.
- Use the client ID and client secret to obtain an access token using OAuth 2.0.
- Use the access token in the HTTP headers of REST API requests.
Here's an example code snippet to obtain an access token using the Node.js axios library:


```javascript
const axios = require('axios');

const clientId = '<your_client_id>';
const clientSecret = '<your_client_secret>';
const username = '<your_salesforce_username>';
const password = '<your_salesforce_password>';

const loginUrl = 'https://login.salesforce.com/services/oauth2/token';
const data = `grant_type=password&client_id=${clientId}&client_secret=${clientSecret}&username=${username}&password=${password}`;

axios.post(loginUrl, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  .then((response) => {
    const accessToken = response.data.access_token;
    console.log(`Access token: ${accessToken}`);
  })
  .catch((error) => {
    console.error(error);
  });
```

In this code, we use the `axios.post` method to send a POST request to the Salesforce OAuth token endpoint with the required parameters in the request body. We also set the `Content-Type` header to `application/x-www-form-urlencoded`, which is required by Salesforce.

The response from Salesforce includes the access token, which we can extract from the `response.data` object and store in a variable for later use. Finally, we log the access token to the console.

Note that this code is only an example and should not be used in production without proper security measures and error handling.

### REST API query examples with Node.js


```javascript
const axios = require('axios');

const accessToken = '<your_access_token>';
const instanceUrl = '<your_salesforce_instance_url>';
const objectName = '<your_salesforce_object_name>';
const query = '<your_salesforce_query>';

const url = `${instanceUrl}/services/data/v52.0/sobjects/${objectName}/?q=${query}`;
const headers = { Authorization: `Bearer ${accessToken}` };

axios.get(url, { headers })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });
```

In this example, we first define the `accessToken`, `instanceUrl`, `objectName`, and `query` variables to specify the Salesforce object and query to retrieve. We then construct the REST API query URL using these variables and the Salesforce API endpoint. We also include the access token in the `Authorization` header.

We use the `axios.get` method to send a GET request to the URL and log the response data to the console.

### REST API update and create examples with Node.js


```javascript
const axios = require('axios');

const accessToken = '<your_access_token>';
const instanceUrl = '<your_salesforce_instance_url>';
const objectName = '<your_salesforce_object_name>';
const data = {
  field1: 'value1',
  field2: 'value2',
  // Add more fields as needed
};

const url = `${instanceUrl}/services/data/v52.0/sobjects/${objectName}/`;
const headers = {
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
};

axios.post(url, data, { headers })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });
```

In this example, we first define the `accessToken`, `instanceUrl`, `objectName`, and `data` variables to specify the Salesforce object and record data to create. We then construct the REST API URL for creating a record using these variables and the Salesforce API endpoint. We also include the access token in the `Authorization` header and set the `Content-Type` header to `application/json`.


### REST API bulk examples with Node.js


```javascript
const axios = require('axios');

const accessToken = '<your_access_token>';
const instanceUrl = '<your_salesforce_instance_url>';
const objectName = '<your_salesforce_object_name>';
const records = [
  {
    field1: 'value1',
    field2: 'value2',
    // Add more fields as needed
  },
  {
    field1: 'value3',
    field2: 'value4',
    // Add more fields as needed
  },
  // Add more records as needed
];

const url = `${instanceUrl}/services/data/v52.0/composite/sobjects`;
const headers = {
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
};

const payload = {
  allOrNone: true,
  records: records.map((record) => {
    return {
      attributes: {
        type: objectName,
      },
      ...record,
    };
  }),
};

axios.post(url, payload, { headers })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });

```

We then construct the REST API URL for creating multiple records using the `composite/sobjects` endpoint.

We set the `allOrNone` attribute of the payload to `true` to indicate that all records should be created or none of them should be created. We also format each record with the appropriate `type` attribute for the Salesforce object using the spread operator.


## SOAP API in Salesforce:

The Salesforce SOAP API is a web services-based API that allows external applications to query, create, update, and delete records in Salesforce. The API uses the SOAP protocol, which is a message-based protocol for exchanging structured data over the web. The Salesforce SOAP API supports both XML and JSON formats.

The SOAP API provides access to most standard and custom objects in Salesforce, and allows for complex queries and data manipulation. It is useful for integrating Salesforce with other enterprise systems that use SOAP protocols.

### SOAP API Example:

Here is an example of using the Salesforce SOAP API with Node.js to create a new Contact record:


```javascript
const soap = require('soap');

const username = '<your_salesforce_username>';
const password = '<your_salesforce_password>';
const securityToken = '<your_salesforce_security_token>';
const wsdlUrl = '<your_salesforce_wsdl_url>';

const contact = {
  FirstName: 'John',
  LastName: 'Doe',
  Email: 'johndoe@example.com',
};

soap.createClient(wsdlUrl, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }

  client.login({ username, password + securityToken }, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const sessionId = result.sessionId;
    const serverUrl = result.serverUrl;

    client.create(
      {
        sObjects: [
          {
            type: 'Contact',
            fieldsToNull: [],
            Id: null,
            ...contact,
          },
        ],
      },
      { sessionHeader: { sessionId } },
      (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log(result);
      },
      serverUrl
    );
  });
});
```

In this example, we first define the `username`, `password`, `securityToken`, and `wsdlUrl` variables to specify the Salesforce login credentials and the SOAP WSDL URL.

We then define the `contact` variable to specify the field values for the new Contact record.

We use the `soap.createClient` method to create a SOAP client and pass in the WSDL URL. We use the `client.login` method to log in to Salesforce and obtain a session ID and server URL.

We format the `contact` object with the appropriate `type` attribute and field values using the spread operator. We use the `client.create` method to create the new Contact record and log the response to the console.


## Best Practices for Using REST and SOAP APIs:

- Use Bulk APIs for Large Data Loads: When working with large data sets, use the Bulk API to load or delete data. This API is optimized for large data loads and is faster than the standard REST API or SOAP API.
- Use API Versioning: Salesforce introduces new features and changes to APIs in each release, so it's important to use API versioning to ensure compatibility and consistency. Use the latest stable API version that supports your integration needs and make sure to update your code to use a new API version before the old version is retired.
- Implement Proper Error Handling: Make sure to handle API errors properly in your code. Check for error responses and handle them accordingly to prevent unexpected behavior and improve the user experience. You can use try-catch blocks or error callbacks to handle API errors.
- Use Query and Search Limits: REST API and SOAP API have limits on the number of queries and search requests that can be made per day. Monitor your API usage and make sure you are staying within the limits to avoid unexpected service interruptions.
- Use Appropriate Authentication Methods: Use the appropriate authentication method for your integration needs. OAuth 2.0 is recommended for web and mobile applications, while SOAP headers are recommended for enterprise applications.
- Implement Caching: Use caching mechanisms to improve performance and reduce API calls. Cache frequently accessed data to reduce network latency and API call overhead. Use caching libraries like Redis or Memcached to implement caching in your code.
- Use Secure Connections: Use HTTPS for all API requests and responses to ensure data security and privacy. Do not use HTTP, as it does not provide encryption and is vulnerable to data interception and manipulation.
- Use Named Credentials: Use Named Credentials to securely store and manage authentication information and avoid hard-coding credentials in your code. Named Credentials are easy to configure and provide a secure way to access external APIs.
## Integrating REST and SOAP APIs with External Systems:

- Choose the Right Integration Pattern: When integrating REST and SOAP APIs with external systems, it's important to choose the right integration pattern based on your specific use case. Some common patterns include request/response, publish/subscribe, and batch processing.
- Use Integration Tools: Salesforce provides several integration tools that can simplify the process of integrating with external systems. These tools include the Salesforce Connect, Salesforce Platform Events, and MuleSoft Anypoint Platform.
- Map Data Fields: When integrating with external systems, make sure to map data fields between systems to ensure proper data synchronization and accuracy. Use tools like Salesforce's Data Integration to map data fields and automate data synchronization.
- Monitor Integration Performance: Monitor integration performance to ensure that data is being transferred between systems efficiently and effectively. Use tools like Salesforce's Integration Monitoring to monitor integration performance and identify issues or bottlenecks.
- Implement Error Handling: Implement proper error handling mechanisms to ensure that errors are captured and resolved quickly. Use Salesforce's Error Handling Framework to handle errors in real-time and trigger alerts or notifications when errors occur.
- Test and Validate Integrations: Test and validate integrations thoroughly before deploying them in production environments. Use Salesforce's Integration Testing Framework to test integrations and validate data transfers between systems.
- Ensure Security and Compliance: Ensure that integrations comply with security and compliance requirements. Use Salesforce's Shield Platform Encryption to encrypt sensitive data and comply with data protection regulations like GDPR and CCPA.
## Conclusion

Integrating REST and SOAP APIs with external systems can help organizations streamline business processes and improve data accuracy and synchronization. Choosing the right integration pattern, using integration tools, mapping data fields, monitoring integration performance, implementing error handling mechanisms, testing and validating integrations, and ensuring security and compliance are all critical to the success of the integration. By following these best practices, organizations can build robust and efficient integrations with external systems in Salesforce.
<div
