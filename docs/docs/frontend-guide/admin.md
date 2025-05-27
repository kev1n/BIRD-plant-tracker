# Admin Page Guide

### Navigating to the Admin Page
The Admin Page is a private webpage only accessible to those who have **admin** or **owner** permissions. If you have one of those roles, you can navigate to the Admin Page via the navigation bar at the top of the screen. If you are a **user** or an **editor**, the admin page is **not visible**.

--- 
**Note: Role Heirarchy**
There are four roles built into the website with varying levels of authority. From greatest authority to least:
- **Owner**
  - Owners are the highest authority, and cannot be demoted by other users, including other owners. Owners have full **create, edit, and delete permissions** for snapshots, plants, and observations. Owners can **promote and demote admins, editors, and owners.** 
  - Owners must be determined manually by changing the user's entry in the database, as there was no clear way to reasonably "elect" owners within the website functionality, and the users with owner roles are supposed to almost never change.
- **Admin**
  - Admins can **create, edit, and delete** snapshots, plants, and observations. Admins can **promote and demote editors and users**, but not other admins or owners. 
- **Editor**
  - The most common level of permissions for volunteers. Editors can **view, create, and edit** information pertaining to snapshots, plants, and observations, through both the map interface and the spreadsheet. Note that editors **cannot delete** data. 
- **User**
  - The default for users once they have registered. Users can **view** information from the map and the spreadsheet, but they **cannot make any changes**. 

---

### Navigating Through the Admin Page
Once on the Admin Page, there are three distinct sections to the page.

#### All Users List
##### Search Bar

##### Owner View

##### Admin View

#### Role Requests
##### Owner View

##### Admin View

#### Additional User Info

### Plant CSV Importing
To help with populating the database with the various species of plant in the sanctuary, the Admin page contains functionality to take a CSV file of plant information and import each row into the database as a plant species. A file can be selected from an explorer, or dropped into the window as shown below:

**IMAGE HERE**

The following columns **must exist** in the CSV file to properly import plants:
- plantCommonName
- plantScientificName
- isNative
- subcategory

Although the meaning of each column is reasonably self-explanatory, more details on the accepted data types and constraints on the values in each field can be found under **technical spec > database schema > PlantInfo table**.  

