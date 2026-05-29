---
title: "Heroku Connect Best Practices: Lessons from Real-World Deployments"
date: 2022-04-04
category: Heroku
excerpt: "Common mistakes teams make with Heroku Connect — External IDs, formula fields, and governor limits — from real project experience."
readTime: 7
image: /blog-images/2f23904ac526708a919bb2c5e4b3574dbb601fee-800x239.webp
published: true
featured: editors-pick
author: "Vikash Agarwal"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/32c050b8f0ed847ec0b34f5144d2fa6b03a40888-200x200.jpg"
---

From standard definition - Heroku Connect makes it easy for you to build Heroku apps that share data with your Salesforce deployment. Using bi-directional synchronization between Salesforce and Heroku Postgres, Heroku Connect unifies the data in your Postgres database with the contacts, accounts and other custom objects in the Salesforce database. Easily configured with a point and click UI, it’s simple to get the service up and running in minutes – no coding or complex configuration is required.

### Experience and thoughts after using heroku connect

- While developing apps on heroku sometime we did mistake while configuring and using heroku connect. These are some basic thing which everyone should keep in mind while developing the app using heroku connect   External Id
- Cross-object formula and roll-up summary fields
- Other supporting table or function in postgres
- Custom implementation for large bi-directional data sync
- Reloading of heroku - postgres table using heroku connect api
- Sync / Integration user and salesforce profile
- Encrypted field and heroku connect
- Heroku connect and salesforce governing limit
#### 1. External Id

Using heroku connect we can sync data bi directional and we can configure it using heroku mapping page. When we are trying to do mapping for postgres to salesforce then heroku connect demands external id and the reason is heroku connect uses separate threads and utilized for reading and writing, there is a possibility that a reader may process a write operation from Salesforce to Postgres before a write process from Postgres to Salesforce has finished writing the Salesforce ID for those same records. When this setting is configured, Heroku Connect matches records coming from Salesforce first by Salesforce ID (if available), and then by the specified Unique External ID. This ensures that no matter which process attempts to write the record first, there are no Integrity Errors and the record is always matched. Additionally, you can also reference the newly inserted row from a foreign table by this external ID.

You should populate this field with a unique value, such as a GUID when you first INSERT the record. This can be used to establish relationships between objects(like inserting master and detail relationship from postgres to salesforce. We know that detail or child object needed the parentId/master object id and for that we can use parent’s /master’s external id) and also helps ensure against creating duplicate records. It’s important not to change the value of that ID after writing it to a record.

The unique identifier should be treated as an alias for a Salesforce ID. Therefore, they should not change over time, never be reused, and you should choose a similarly unique mechanism for generating them.

Heroku Connect recommends that the unique identifier should be treated as an alias for a Salesforce ID. Therefore, they should not change over time, never be reused, and you should choose a similarly unique mechanism for generating them.

Caution : Postgres integer sequences are not recommended as they are not guaranteed to be unique. Further, the ID field in the Heroku Connect database should not be used since these numbers can reset when importing your configuration into a new database or on reloading a table.

### 2. Cross-object formula and roll-up summary fields

Formula and roll-up summary fields are calculated by Salesforce at query-time and can make use of other fields, functions and literal values. They can also refer to fields in parent objects via master-detail or lookup relationships: however this can cause problems when Heroku Connect is synchronizing data

Caution : Changes to formula and roll-up summary fields that are driven by a change in a parent object do not update the SystemModStamp of the child object - this means that the object will not be synchronized by Heroku Connect.

#### Workaround :

Formula and rollup summary should be calculated on postgres side using function / trigger function.

### 3. Other supporting table or function in postgres

Some time we need to create a local table or non-sync table for supporting apps on heroku. We suggest that a user should not create any function or database table in same schema in which heroku connect config reside. For example if we mapped heroku connect in salesforce schema of postgres database then we should not create non-sync tables/ functions in salesforce schema. Reason is that if we reload the complete connection from salesforce then non-sync table or function will be removed from salesforce schema.

Workaround: It’s good to create a helper schema in same database and create supporting tables and function into that so complete reload of heroku connect doesn’t cleanup the table and functions.

### 4. Custom implementation for large bi-directional data sync :

Some time we have large data set which we need to sync back to salesforce from postgres in that case heroku connect legs. Heroku connect uses SOAP / Bulk api to sync the from postgres to salesforce so this implies that it will make chunks of 200 / 5000 records for syncing and 200 records are not enough if you are generating millions of record and processing on salesforce side if the case is to avoid bulk api limit.

Workaround : We know that heroku connect have limitation to sync 200  record at a time but they never mention the size of a single record. So in this situation

- we can create TextArea field with large size on salesforce and mapped through heroku connect
- Serialize the data on heroku side and put a bunch of record in that textArea field.
- Now heroku connect sync a large amount of data.
- Create a trigger on salesforce side which deserialize the data in which we place in large text area and insert in desired object.
- Other than this we can use bulk api.
### 5. Reloading of heroku - postgres table using heroku connect api :

We can reload a table in heroku which configured using heroku connect. Reloading means all the table is truncated and and all the new data inserted from salesforce to postgres

#### Issues with this:

When a record is created in table on postgres side then a sequence / autonumber generated and stored in table. If you reload the table then this sequence / auto number get changed for record. So be cautious about this. Never reference this auto number in app. It’s better to use sfid / unique external id as reference in app or in other table.

### 6. Sync / Integration user and salesforce profile :

When we setup heroku connect in heroku then heroku connect uses a salesforce user to sync. It’s good if we have a separate user with name Integration user so everybody can understand that this is created / updated / deleted by heroku user

### 7. Encrypted field and heroku connect :

Any field which mark encrypted on salesforce side and we synced to heroku remain encrypted and shows as *****in postgres. So we must have a plan for encrypted fields if we are syncing to postgres

### 8. Heroku connect and salesforce governing limit

According to docs : When bi-directional sync is configured, Connect will write changes back to Salesforce using either the SOAP or Bulk API. The Bulk API is optimized for operations that apply to larger datasets, and is therefore significantly faster than using the SOAP API in these scenarios. Connect will automatically attempt to use the Bulk API when all the following conditions are met:

- The Salesforce API version for the connection is set to v39 or higher
- The connection is configured to use the Ordered Writes algorithm
- A unique identifier is specified for the mapping
- Two thousand or more contiguous changes of the same type are made to a single object (e.g., 5K INSERTS into ‘Lead’ object)
So here clearly mentioned that Heroku connect uses SOAP / Bulk API s

### Engage with Our Heroku Connect Service Specialists for Expert Advice

Unlock the full potential of Heroku Connect with our team of dedicated experts. Whether you're new to Heroku Connect or looking to optimize your existing setup, our specialists are here to assist you every step of the way.

[Get in touch](/contact)
