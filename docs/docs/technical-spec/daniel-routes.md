# API Endpoints 

## Observation Routes - /observation

### POST - /
#### Function:
Create a new observation.
#### Request:
##### Headers:
Authorization: Bearer \{token\}
##### Body:
snapshotID : integer
plantQuantity : integer
plantID : integer
?hasBloomed : bool
?datePlanted : date
#### Response:
201 Created
400 Bad Request: Invalid or missing fields.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
500 Internal Server Error: Unexpected server error.

### DELETE - /:obsID
#### Function:
Deletes an observation by setting its "deletedOn" field to the current time.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
obsID - ID of the observation to be deleted.
#### Response
200 OK
400 Bad Request: Invalid obsID.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
404 Not Found: Observation does not exist.
500 Internal Server Error: Unexpected server error.

