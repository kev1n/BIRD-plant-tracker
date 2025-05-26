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

### PUT- /:obsID
#### Function:
Update the allowed fields within an observation.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
obsID - ID of the observation to be updated.
##### Body
?plantQuantity : integer
?plantID : integer
?hasBloomed : bool
?datePlanted : date
#### Response
200 OK
400 Bad Request: Invalid obsID.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
404 Not Found: Observation does not exist.
500 Internal Server Error: Unexpected server error.

## GET Observation Routes - /get-observation

### GET - /:obsID
#### Function:
Get a sepcified observation.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
obsID - ID of the observation.
#### Response
200 OK
400 Bad Request: Invalid obsID.
404 Not Found: Observation does not exist.
500 Internal Server Error: Unexpected server error.

### GET - /
#### Function:
Get all observations.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
500 Internal Server Error: Unexpected server error.

### GET - /all/:snapshotID
#### Function:
Get all observations assosiated from a snapshot.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
snapshotID - ID of the snapshot.
#### Response
200 OK
400 Bad Request: Invalid snapshotID.
404 Not Found: Observation does not exist.
500 Internal Server Error: Unexpected server error.

## Snapshot Routes - /snapshot

### POST - /
#### Function:
Create a new snapshot.
#### Request:
##### Headers:
Authorization: Bearer \{token\}
##### Body:
userID : integer
dateCreated : date
patchID : PatchID
?notes : text
#### Response:
201 Created
400 Bad Request: Invalid or missing fields.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
500 Internal Server Error: Unexpected server error.

### DELETE - /:snapshotID
#### Function:
Deletes a snapshot by setting its "deletedOn" field to the current time.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
snapshotID - ID of the snapshot to be deleted.
#### Response
200 OK
400 Bad Request: Invalid snapshotID.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
404 Not Found: Snapshot does not exist.
500 Internal Server Error: Unexpected server error.

### PUT- /:snapshotID
#### Function:
Update the allowed fields within an snapshot.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
snapshotID - ID of the snapshot to be updated.
##### Body
?userID : integer
?dateCreated : date
?patchID : PatchID
?notes : text
#### Response
200 OK
400 Bad Request: Invalid obsID.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
404 Not Found: Observation does not exist.
500 Internal Server Error: Unexpected server error.

### GET - /
#### Function:
Get all snapshots.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
500 Internal Server Error: Unexpected server error.

### GET - /:snapshotID
#### Function:
Get specified snapshot.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
400 Bad Request: Invalid snapshotID.
404 Not Found: Snapshot does not exist.
500 Internal Server Error: Unexpected server error.

### GET - /patch/:patchID/latest
#### Function:
Get latest snapshot within a patch.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Patch Params
patchID : PatchID
#### Response
200 OK
400 Bad Request: Invalid patchID.
404 Not Found: Patch does not exist.
500 Internal Server Error: Unexpected server error.

### GET - /patch/:patchID/dates
#### Function:
Gets dates of all snapshots for a patch.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Patch Params
patchID : PatchID
#### Response
200 OK
400 Bad Request: Invalid patchID.
404 Not Found: Patch does not exist.
500 Internal Server Error: Unexpected server error.

## Patch Routes - /patch

### POST - /
#### Function:
Create a new patch.
#### Request:
##### Headers:
Authorization: Bearer \{token\}
##### Body:
patchID : PatchID
latitude : number
longitude : number
soilType : string
#### Response:
201 Created
400 Bad Request: Invalid or missing fields.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
500 Internal Server Error: Unexpected server error.

### DELETE - /:patchID
#### Function:
Deletes a patch by setting its "deletedOn" field to the current time.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
patchID - ID of the patch to be deleted.
#### Response
200 OK
400 Bad Request: Invalid patchID.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
404 Not Found: Patch does not exist.
500 Internal Server Error: Unexpected server error.

### PUT - /:patchID
#### Function:
Update a specified patch.
#### Request:
##### Headers:
Authorization: Bearer \{token\}
##### Body:
?patchID : PatchID
?latitude : number
?longitude : number
?soilType : string
#### Response:
201 Created
400 Bad Request: Invalid patchID.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
404 Not Found: Patch does not exist
500 Internal Server Error: Unexpected server error.

### GET - /
#### Function:
Get all patches.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
500 Internal Server Error: Unexpected server error.

### GET - /:patchID
#### Function:
Get specified patch.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
400 Bad Request: Invalid patchID.
404 Not Found: Patch does not exist.
500 Internal Server Error: Unexpected server error.

## Plant Routes - /plants

### POST - /
#### Function:
Create a new plant.
#### Request:
##### Headers:
Authorization: Bearer \{token\}
##### Body:
plantCommonName : string
?plantScientificName : string
?isNative : bool
?subcategory : string
#### Response:
201 Created
400 Bad Request: Invalid or missing fields.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
500 Internal Server Error: Unexpected server error.

### DELETE - /:plantID
#### Function:
Deletes a plant by setting its "deletedOn" field to the current time.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
plantID - ID of the plant to be deleted.
#### Response
200 OK
400 Bad Request: Invalid plantID.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
404 Not Found: Snapshot does not exist.
500 Internal Server Error: Unexpected server error.

### PUT- /:plantID
#### Function:
Update the allowed fields within a plant.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
plantID - ID of the plant to be updated.
##### Body
?plantCommonName : string
?plantScientificName : string
?isNative : bool
?subcategory : string
#### Response
200 OK
400 Bad Request: Invalid plantID.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
404 Not Found: Observation does not exist.
500 Internal Server Error: Unexpected server error.

### GET - /
#### Function:
Get all plants.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
500 Internal Server Error: Unexpected server error.

### GET - /:plantID
###       /?name=partialName
#### Function:
Get specified snapshot.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
plantID : plant ID to get
##### Query Param
partialName : plants partial name to search the database for
#### Response
200 OK
400 Bad Request: Invalid plantID.
404 Not Found: Plant does not exist.
500 Internal Server Error: Unexpected server error.

## Valid Routes - /valid

### GET - /soil
#### Function:
Get all valid soil types.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
500 Internal Server Error: Unexpected server error.

### GET - /roles
#### Function:
Get all valid user roles.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
500 Internal Server Error: Unexpected server error.

### GET - /subcategories
#### Function:
Get all valid plant subcategories.
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
500 Internal Server Error: Unexpected server error.

## Filter Route - /filter

### GET - /
#### Function:
Get patches based on plant filter
#### Request:
##### Headers
Authorization: Bearer \{token\}
#### Response
200 OK
500 Internal Server Error: Unexpected server error.

## Import Route - /filter

### POST - /
#### Function:
Upload a CSV file with plant data into the database
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Body
File - csv file to upload
#### Response
200 OK
400 Bad Request: No file provided.
400 Bad Request: File not CSV format.
401 Unauthorized: Missing or invalid token.
403 Forbidden: Insufficient permissions.
500 Internal Server Error: Unexpected server error.
