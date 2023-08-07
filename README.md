Generic Database Proxy - README


Introduction: 

This is a Node.js application that serves as a generic database proxy, providing a REST API for CRUD (Create, Read, Update, Delete) operations on a SQL database. The application is written in TypeScript and SQLite3. It utilizes a local SQLite database instance for demonstration purposes.


Installation:

Clone this repository to your local machine.
Install the dependencies using npm install


Usage:

Ensure you have Node.js and npm installed on your machine.
Run the application using npm start.
The server will start, and you can now make requests to the API endpoints.


API Endpoints:


The application exposes the following API endpoints:

POST /:collection: Create a new entry in the specified collection. The request body should contain the data for the new entry. If any of the columns are not present it will add the columns in the database. It will check if the collections exists or not in the database.

GET /:collection/:id: Retrieve a specific entry from the specified collection by its ID.

PUT /:collection/:id: Update an existing entry in the specified collection by its ID. The request body should contain the updated data.

DELETE /:collection/:id: Delete an entry from the specified collection by its ID.

Integration Tests:

By running the command npm test you can run the integration test 
to check if business logic is correct


Schema Ingestion:

Upon server startup, the application will read the schema files JSON provided in the designated directory. The schema files should define the collections, their fields, data types, and other relevant information. The application will then check for the existence of the specified tables in the database. If a table is missing, it will create the table and add the necessary columns based on the schema definition.


Future Features:

One thing i would add would be a GET :/collections end point so that the user can get all the rows in the collection.

The id value is used for accessing all the rows.

A cache layer so that if the application does get deployed retrieving values from a cache layer will have less cost when compared to retrieving values from database.

The application currently uses a local SQLite instance for simplicity, but in production environments, you should configure it to use a more suitable SQL database.

The error handling in the API endpoints and the schema ingestion process can be further improved to provide more informative and user-friendly error messages.

It's recommended to implement proper authentication and authorization mechanisms to secure the API endpoints and prevent unauthorized access to the database.




