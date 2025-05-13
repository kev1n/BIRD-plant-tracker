# API Endpoints 

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
  "lastname":   "string"
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