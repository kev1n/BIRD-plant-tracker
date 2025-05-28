# Backend Routes

## User Routes - /users

### GET – /users/id/:userid
#### Function:
Returns the user that matches the specified `userid`.
#### Request:
##### Headers:
- Authorization: Bearer `{token}`
##### Body:
None
#### Response:
- `userid`  
- `email`  
- `username`  
- `firstname`  
- `lastname`  
- `role`  

---

### GET – /users/email/:email
#### Function:
Returns the user that matches the specified `email`.
#### Request:
##### Headers:
- Authorization: Bearer `{token}`
##### Body:
None
#### Response:
- `userid`  
- `email`  
- `username`  
- `firstname`  
- `lastname`  
- `role`  

---

### PUT – /users/info
#### Function:
Updates a user’s own profile information (all fields except `role`).
#### Request:
##### Headers:
- Authorization: Bearer `{token}`  
- Content-Type: application/json  
##### Body:
```json
{
  "username":   "string",
  "email":      "string",
  "firstname":  "string",
  "lastname":   "string",
  "roleRequested": "string",
}
```

#### Success Response: 
- Status: 200 OK
- ##### Body:
```json
{
  "message": "User updated successfully"
}
```
##### Error Cases:
- 400 Bad Request: Invalid headers
- 401 Unauthorized: Missing or invalid token
- 404 Not found: User does not exist
- 500 Internal Server Error: Unexpected server error
---
### PUT – /users/role/:email
#### Function:
Given a unique user email, allows owners to update the roles of admins, editors and users. Allows admins to update the roles of editors and users. 
#### Request:
##### Headers:
- Authorization: Bearer `{token}`
- Content-Type: application/json
##### Body:
```json
{
  "role":    "string"
}
```
#### Success Response: 
- Status: 200 OK
- ##### Body:
```json
{
  "message": "User role updated successfully"
}
```
##### Error Cases:
- 400 Bad Request: Invalid headers
- 401 Unauthorized: Missing or invalid token
- 404 Not found: User does not exist
- 500 Internal Server Error: Unexpected server error

## Observation Routes - /observation

### POST - /observation
#### Function:
Create a new observation.
#### Request:
##### Headers:
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Body:
```json
{
  "snapshotID": "integer",
  "plantQuantity" : "integer",
  "plantID" : "integer",
  "hasBloomed" : "bool",
  "datePlanted": "date",
}
```
#### Success Response:
- Status: 201 Created
##### Body
```json
{
  "message": "Observation created successfully",
  "obsID": "integer"
}
```
##### Error Cases
- 400 Bad Request: Invalid or missing fields.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 500 Internal Server Error: Unexpected server error.

### DELETE - /observation/:obsID
#### Function:
Deletes an observation by setting its "deletedOn" field to the current time.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Path Params
- obsID - ID of the observation to be deleted.
#### Success Response
200 OK
##### Body
```json
{
  "message": "Observation deleted successfully",
}
```
##### Error Cases
- 400 Bad Request: Invalid obsID.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 404 Not Found: Observation does not exist.
- 500 Internal Server Error: Unexpected server error.

### PUT- /observation/:obsID
#### Function:
Update the allowed fields within an observation.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Path Params
- obsID - ID of the observation to be updated.
##### Body
```json
{
  "snapshotID": "integer",
  "plantQuantity" : "integer",
  "plantID" : "integer",
  "hasBloomed" : "bool",
  "datePlanted": "date",
}
```
#### Response
- 200 OK
```json
{
  "message": "Observation updated successfully",
}
```
##### Error Cases
- 400 Bad Request: Invalid obsID.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 404 Not Found: Observation does not exist.
- 500 Internal Server Error: Unexpected server error.

## GET Observation Routes - /get-observation

### GET - /get-observation/:obsID
#### Function:
Get a sepcified observation.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Path Params
- obsID - ID of the observation.
#### Response
- 200 OK
##### Body
```json
{
  "snapshotID": "integer",
  "plantQuantity" : "integer",
  "plantID" : "integer",
  "hasBloomed" : "bool",
  "datePlanted": "date",
}
```
##### Error Cases
400 Bad Request: Invalid obsID.
404 Not Found: Observation does not exist.
500 Internal Server Error: Unexpected server error.

### GET - /get-observation
#### Function:
Get all observations.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
#### Response
- 200 OK
```json
{
  "observations": "observations"
}
```
##### Error Cases
500 Internal Server Error: Unexpected server error.

### GET - /get-observation/all/:snapshotID
#### Function:
Get all observations assosiated from a snapshot.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Path Params
- snapshotID - ID of the snapshot.
#### Response
- 200 OK
```json
{
  "observations": "observations"
}
```
##### Error Cases
- 400 Bad Request: Invalid snapshotID.
- 404 Not Found: Observation does not exist.
- 500 Internal Server Error: Unexpected server error.

## Snapshot Routes - /snapshot

### POST - /snapshot
#### Function:
Create a new snapshot.
#### Request:
##### Headers:
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Body:
```json
{
  "userID": "string",
  "dateCreated" : "date",
  "patchID" : "string",
  "notes" : "text",
}
```
#### Success Response:
- 201 Created
##### Body
```json
{
  "message": "Observation created successfully",
  "snapshotID": "integer"
}
```
##### Error Cases
- 400 Bad Request: Invalid or missing fields.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 500 Internal Server Error: Unexpected server error.

### DELETE - /snapshot/:snapshotID
#### Function:
Deletes a snapshot by setting its "deletedOn" field to the current time.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Path Params
- snapshotID - ID of the snapshot to be deleted.
#### Response
- 200 OK
```json
{
  "message": "Snapshot deleted successfully",
}
```
##### Error Cases
- 400 Bad Request: Invalid snapshotID.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 404 Not Found: Snapshot does not exist.
- 500 Internal Server Error: Unexpected server error.

### PUT- /snapshot/:snapshotID
#### Function:
Update the allowed fields within an snapshot.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Path Params
- snapshotID - ID of the snapshot to be updated.
##### Body
```json
{
  "userID": "string",
  "dateCreated" : "date",
  "patchID" : "string",
  "notes" : "text",
}
```
#### Response
- 200 OK
##### Body
```json
{
  "message": "Snapshot updated successfully",
}
```
##### Error Cases
- 400 Bad Request: Invalid obsID.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 404 Not Found: Observation does not exist.
- 500 Internal Server Error: Unexpected server error.

### GET - /snpashot
#### Function:
Get all snapshots.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
#### Success Response
- 200 OK
##### Body
```json
{
  "snapshots": "snapshots"
}
```
##### Error Cases
- 500 Internal Server Error: Unexpected server error.

### GET - /:snapshotID
#### Function:
Get specified snapshot.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Path Params
- snapshotID - ID of the snapshot to get.
#### Response
- 200 OK
##### Body
```json
{
  "snapshot": "snapshot"
}
```
##### Error Cases
- 400 Bad Request: Invalid snapshotID.
- 404 Not Found: Snapshot does not exist.
- 500 Internal Server Error: Unexpected server error.

### GET - /snapshot/patch/:patchID/latest
#### Function:
Get latest snapshot within a patch.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Patch Params
- patchID : Patch to find latest snapshot for
#### Response
- 200 OK
##### Body
```json
{
  "snapshot": "snapshot"
}
```
##### Error Cases
- 400 Bad Request: Invalid patchID.
- 404 Not Found: Patch does not exist.
- 500 Internal Server Error: Unexpected server error.

### GET - /snapshot/patch/:patchID/dates
#### Function:
Gets dates of all snapshots for a patch.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Patch Params
- patchID : PatchID
#### Response
- 200 OK
##### Error Cases
- 400 Bad Request: Invalid patchID.
- 404 Not Found: Patch does not exist.
- 500 Internal Server Error: Unexpected server error.

## Patch Routes - /patch

### POST - /patch
#### Function:
Create a new patch.
#### Request:
##### Headers:
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Body:
```json
{
  "patchID": "string",
  "latitude" : "number",
  "longitude" : "number",
  "soilType" : "string",
}
```
#### Response:
- 201 Created
```json
{
  "message": "Patch created successfully",
  "patchID": "string"
}
```
##### Error Cases
- 400 Bad Request: Invalid or missing fields.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 500 Internal Server Error: Unexpected server error.

### DELETE - /patch/:patchID
#### Function:
Deletes a patch by setting its "deletedOn" field to the current time.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Path Params
- patchID - ID of the patch to be deleted.
#### Response
- 200 OK
##### Body 
```json
{
  "message": "Patch deleted successfully",
}
```
##### Error Cases
- 400 Bad Request: Invalid patchID.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 404 Not Found: Patch does not exist.
- 500 Internal Server Error: Unexpected server error.

### PUT - /patch/:patchID
#### Function:
Update a specified patch.
#### Request:
##### Headers:
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Path Params
- patchID - ID of the patch to be updated.
##### Body:
```json
{
  "patchID": "string",
  "latitude" : "number",
  "longitude" : "number",
  "soilType" : "string",
}
```
#### Sucess Response:
- 201 Created
```json
{
  "message": "Patch updated successfully",
}
```
##### Error Cases
- 400 Bad Request: Invalid patchID.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 404 Not Found: Patch does not exist
- 500 Internal Server Error: Unexpected server error.

### GET - /patch
#### Function:
Get all patches.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
#### Response
- 200 OK
##### Body
```json
{
  "patches": "patches",
}
```
##### Error Cases
- 500 Internal Server Error: Unexpected server error.

### GET - /patch/:patchID
#### Function:
Get specified patch.
#### Request:
##### Headers
Authorization: Bearer \{token\}
##### Path Params
- patchID - ID of the patch to get.
#### Response
- 200 OK
##### Body
```json
{
  "patch": "patch",
}
```
##### Error Cases
- 400 Bad Request: Invalid patchID.
- 404 Not Found: Patch does not exist.
- 500 Internal Server Error: Unexpected server error.

## Plant Routes - /plants

### POST - /plants
#### Function:
Create a new plant.
#### Request:
##### Headers:
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Body:
```json
{
  "plantCommonName": "string",
  "plantScientificName" : "string",
  "isNative" : "bool",
  "subcategory" : "string",
}
```
#### Success Response:
- 201 Created
```json
{
  "message": "Plant created successfully",
  "plantID": "integer"
}
```
##### Error Cases
- 400 Bad Request: Invalid or missing fields.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 500 Internal Server Error: Unexpected server error.

### DELETE - /plants/:plantID
#### Function:
Deletes a plant by setting its "deletedOn" field to the current time.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Path Params
- plantID - ID of the plant to be deleted.
#### Response
- 200 OK
##### Body
```json
{
  "message": "Plant deleted successfully",
}
```
##### Error Cases
- 400 Bad Request: Invalid plantID.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 404 Not Found: Snapshot does not exist.
- 500 Internal Server Error: Unexpected server error.

### PUT- /:plantID
#### Function:
Update the allowed fields within a plant.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Path Params
- plantID - ID of the plant to be updated.
##### Body:
```json
{
  "plantCommonName": "string",
  "plantScientificName" : "string",
  "isNative" : "bool",
  "subcategory" : "string",
}
```
#### Response
- 200 OK
##### Body
```json
{
  "message": "Plant deleted successfully",
}
```
##### Error Cases
- 400 Bad Request: Invalid plantID.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 404 Not Found: Observation does not exist.
- 500 Internal Server Error: Unexpected server error.

### GET - /plants
#### Function:
Get all plants.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
#### Success Response
- 200 OK
##### Body
```json
{
  "plants": "plants",
}
```
##### Error Cases
- 500 Internal Server Error: Unexpected server error.

### GET - /plants/:plantID OR /plants/?name=partialName
#### Function:
Get specified plant OR filter plants based on a partial name.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
##### Path Params
- plantID : plant ID to get
##### Query Param
- partialName : plants partial name to search the database for
#### Response
- 200 OK
##### Body
```json
{
  "plants": "plants",
}
```
##### Error Cases
- 400 Bad Request: Invalid plantID.
- 404 Not Found: Plant does not exist.
- 500 Internal Server Error: Unexpected server error.

## Valid Routes - /valid

### GET - /valid/soil
#### Function:
Get all valid soil types.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
#### Response
- 200 OK
##### Body
```json
{
  "soilTypes": "soilTypes",
}
```
##### Error Cases
- 500 Internal Server Error: Unexpected server error.

### GET - /valid/roles
#### Function:
Get all valid user roles.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
#### Response
- 200 OK
##### Body
```json
{
  "roles": "roles",
}
```
##### Error Cases
- 500 Internal Server Error: Unexpected server error.

### GET - /valid/subcategories
#### Function:
Get all valid plant subcategories.
#### Request:
##### Headers
- Authorization: Bearer \{token\}
#### Response
- 200 OK
##### Body
```json
{
  "subcategories": "subcategories",
}
```
##### Error Cases
- 500 Internal Server Error: Unexpected server error.

## Filter Route - /filter

### GET - /filter
#### Function:
Get patches based on several filter options
#### Request:
##### Headers
- Authorization: Bearer \{token\}
- Content-Type: application/json
##### Body
```json
{ "plantName": "string", 
  "hasBloomed": "bool", 
  "subcatagory": "string", 
  "datePlantedStart": "date", 
  "datePlantedEnd": "date", 
  "isNative": "bool", 
  "patchID": "string", 
  "soilType": "string": 
}
```
#### Response
- 200 OK
```json
{
  "patches": "patches",
}
```
- 500 Internal Server Error: Unexpected server error.

## Import Route - /import

### POST - /
#### Function:
Upload a CSV file with plant data into the database
#### Request:
##### Headers
- Authorization: Bearer \{token\}
- Content-Type: File
##### Body
- File - csv file to upload
#### Response
- 200 OK
```json
{
  "message": "File uploaded successfully"
}
```
##### Error Case
- 400 Bad Request: No file provided.
- 400 Bad Request: File not CSV format.
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions.
- 500 Internal Server Error: Unexpected server error.
