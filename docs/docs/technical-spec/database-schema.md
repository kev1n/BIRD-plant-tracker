# Database Schema

## Table Overview
The database for storing plant information is organized into eight different tables:
- **Observations**
- **PatchInfo**
- **PlantInfo**
- **Snapshots**
- **users**
- **ValidRoles**
- **ValidSoilTypes**
- **ValidSubcategories**

Each section covers one table's data fields, including descriptions and constraints, as well as the row-level security policies for each table.

---
**NOTE:** *DeletedOn Field*
The **deletedOn** field is present in every table. If the data in that row was deleted (and therefore not visible to the user), **deletedOn** is set to the date the row was deleted. Otherwise, **deletedOn** is NULL. This soft delete method avoids permanent data loss, but will disclude data from user queries.

---
**NOTE:** *Row-Level Security Policies*
While some tables have row-level security (RLS) policies, others do not due to technical difficulties. For tables that do not, server-side logic is implemented to the same effect to prevent malicious queries and to otherwise restrict user access to data as necessary. 

As we only perform soft deletes, we do not need to define delete policies; soft deletion is encompassed by our update policies. 

---
### Observations
Observations store information about specific plants. Every observation belongs to a snapshot; by association, the observation pertains to a particular patch on a particular date. 
#### Fields 
**observationID** - `int` | **Primary Key**
  - Unique identifier for each observation. This is generated and provided by Supabase Auth. 

**snapshotID** - `int` | *NOT NULL* | **Foreign Key**
  - References the snapshot which contains this observation. Required field.
  - **Foreign Key**: **snapshotID** in the *Snapshots* table.

**plantID** - `int` | *NOT NULL* | **Foreign Key**
  - References the species of plant which this observation is about. Required field.
  - **Foreign Key**: **PlantID** in the *plantID* table.

**plantQuantity** - `int` | *NOT NULL* | default 1
  - The number of plants being observed. If not specified, defaults to 1.

**datePlanted** - `date`
  - The date the observed plants were planted. Optional field.

**hasBloomed** - `boolean`
  - Whether the observed plants have bloomed. Optional field.

**deletedOn** - `timestamptz`

#### RLS Policies
- All_users_read_observations
  - Everyone has read access.
- All_non_users_create_observations
  - Editors, admins, and owners have insert access.
- All_non_users_update_observations
  - Editors, admins, and owners have update access.

---
### PatchInfo
Stores information about patches in the grid dividing the sanctuary, namely latitude, longitude, and soil type (defined in the ValidSoilTypes table).
#### Fields
**patchID** - `text` | **Primary Key**
  - Unique identifier for a patch in the grid, of the form [**A-T**][**1-36**]. Letters correspond to columns (West to East) in the grid. Numbers respond to rows (North to South).

**latitude**  - `double precision (float8)`
  - self explanatory.

**longitude** - `double precision (float8)`
  - self explanatory.

**soilType** - `text` | *NOT NULL* | **Foreign Key**
  - The soil type of the patch.
  - **Foreign Key**: **soilType** in the *ValidSoilTypes* table.

**deletedOn** - `timestamptz`

#### RLS Policies
- Admins_owners_create_patches
  - Admins and ownerss are allowed to add new patches to the table
    - *Unused functionality in the current app*
- Admins_owners_update_patches
  - Admins and owners are allowed to update patch information
- All_users_read_patchinfo
  - Everyone can read information from the table.

---
### PlantInfo
Stores information about plant species, namely common and scientific names, whether the plant is native to the sanctuary, and the subcategory of plant (defined in the ValidSubcategories table).
#### Fields
**plantID** - `int` | **Primary Key**

**plantCommonName** - `text` | *NOT NULL* | **UNIQUE**
  - Common name of the plant. Required field, and must be unique. 

**plantScientificName** - `text` | **UNIQUE**
  - Scientific name of the plant. Optional field, but must be unique.

**isNative** - `boolean`
  - Indicates whether this species of plant is native to the sanctuary. Optional field.

**subcategory** - `text` | **Foreign Key**
  - The subcategory of this plant species. optional field.
  - **Foreign Key**: references **subcategory** in the *ValidSubcategories* table.

**deletedOn** - `timestamptz`

#### RLS Policies
- All_users_read_plantinfo
  - Everyone can read information from the table
- All_non_users_create_plantinfo
  - those with more permissions than the `user` role can create new plants. (`editor`, `admin`, `owner`)
- All_non_users_update_plantinfo
  - those with more permissions than the `user` role can update plant information.

---
### Snapshots
Snapshots are designed to be collections of observations for a particular patch, created by a particular user. Snapshots assert that any observations within this snapshot were accurate at the time the snapshot was made, up until a new snapshot was made for the same patch. 
**This means that any observations that you want to remain unchanged across snapshots must be duplicated into the new snapshot. If observations are not in a new snapshot, they no longer apply to that patch as of the date of the new snapshot.**
#### Fields
**snapshotID** - `int` | **Primary Key**
  - Unique identifier for a snapshot. Entries in the *Observations* table reference this field.

**userID** - `uuid` | *NOT NULL* | **Foreign Key**
  - The user who made this snapshot and by extension all of its related observations. Required field.
  - **Foreign Key**: references **userID** in the *users* table. 

**notes** - `text`
  - Any additional notes the user wishes to add about any observations or about the snapshot in general. Optional field.

**dateCreated** - `date` | *NOT NULL*
  - The date the snapshot was created. A snapshot verifies the validity of all observations in this snapshot between the date this snapshot was created and the date of the next most recent snapshot. This is required.

**patchID** - `text` | *NOT NULL* | **Foreign Key**
  - Identifies the patch this snapshot pertains to. Required field. 
  - **Foreign Key**: references **patchID** in the *PatchInfo* table.

**deletedOn** - `timestamptz`

#### RLS Policies
- All_users_read_snapshots
  - Everyone has read access
- All_non_users_create_snapshots
  - Editors, admins, and owners have insert access
- All_non_users_update_snapshots
  - Editors, admins, and owners have update access

---
### users
Stores information about registered users of the app, such as id, email, name, and role (defined in the ValidRoles table). Passwords are not stored here, as Supabase Authentication handles that.
#### Fields
**userID** - `uuid` | **Primary Key**
  - A unique identifier for each registered user, provided by Supabase Auth.

**email** - `text` | *NOT NULL* | **UNIQUE**
  - A unique email address for the user. Required field.

**username** - `text` | *NOT NULL* | **UNIQUE**
  - A unique username for the user. Required field.

**firstName** - `text`
  - user's first name, for ease of identification. Optional field.

**lastName** - `text`
  - user's last name, for ease of identification. Optional field.

**role** - `varchar` | *NOT NULL* | **Foreign Key**
  - Identifies the level of permissions the user has. Required field.
  - **Foreign Key**: references the **role** column in the *ValidRoles* table.

**roleRequested** - `varchar` | **Foreign Key**
  - If the user is requesting a different role (presumably of higher permissions), that request is shown here. Optional field.
  - **Foreign Key**: references the **role** column in the *ValidRoles* table.

**created_at** - `timestamptz`
**updated_at** - `timestamptz`
**deletedOn** - `timestamptz`

#### RLS Policies
*Security is handled in our endpoints instead of RLS policies.*
  - users can update any of their own personal information besides **role**
  - admins and owners can update **role** for other users, as long as that user is lower than them in the permissions heirarchy (i.e. only owners can promote/demote admins, and owners are untouchable).

---
### ValidRoles
Defines that list of acceptable roles that a user can have or request. 
#### Fields
**role** - `varchar` | *NOT NULL* | **UNIQUE**
  - as of 5/19/2025, entries are `user`, `editor`, `admin`, `owner`.

**deletedOn** - `timestamptz`

#### RLS Policies
- Read-only for everyone.

---
### ValidSoilTypes
Defines the list of acceptable soil types that a patch in the sanctuary can have.
#### Fields
**soilType** - `text` | *NOT NULL* | **UNIQUE**
  - as of 5/19/2025, entries are `pond`, `sand`, `sandy loam`.

**deletedOn** - `timestamptz`

#### RLS Policies
- Read-only for everyone.

---
### ValidSubcategories
Defines the list of acceptable plant types that a plant species can be classified as. 
#### Fields
**subcategory** - `text` | *NOT NULL* | **UNIQUE**
  - as of 5/19/2025, entries are `forb`, `grass`, `tree`, `shrub`, `other`.

**deletedOn** - `timestamptz`

#### RLS Policies
- Read-only for everyone.