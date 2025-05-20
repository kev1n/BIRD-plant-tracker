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
---
**NOTE**
The **deletedOn** field is present in every table. If the data in that row was deleted (and therefore not visible to the user), deletedOn is set to the date the row was deleted. Otherwise, **deletedOn** is NULL. This soft delete method avoids permanent data loss.

---
### Observations
Observations store information about specific plants. Every observation belongs to a snapshot; by association, the observation pertains to a particular patch on a particular date. 
##### Fields 
**observationID** - int ==primary key==
  - Unique identifier for each observation. This is generated and provided by Supabase Auth. 
**snapshotID** - int NOT NULL ==foreign key==
  - References the snapshot which contains this observation. Required field.
  - foreign key: **snapshotID** in the *Snapshots* table.
**plantID** - int NOT NULL ==foreign key==
  - References the species of plant which this observation is about. Required field.
  - foreign key: **PlantID** in the *plantID* table.
**plantQuantity** - int NOT NULL default 1
  - The number of plants being observed. If not specified, defaults to 1.
**datePlanted** - date
  - The date the observed plants were planted. Optional field.
**hasBloomed** - boolean
  - Whether the observed plants have bloomed. Optional field.
**deletedOn** - timestamptz

---
### PatchInfo
Stores information about patches in the grid dividing the sanctuary, namely latitude, longitude, and soil type (defined in the ValidSoilTypes table).
##### Fields
**patchID** - text ==primary key==
  - Unique identifier for a patch in the grid, of the form \[letters\]\[numbers\]. Letters correspond to columns (West to East) in the grid. Numbers respond to rows (North to South). **The grid supports letters A-T and numbers 1-36**.
**latitude**  - double precision (float8)
  - self explanatory.
**longitude** - double precision (float8)
  - self explanatory.
**soilType** - text NOT NULL ==foreign key==
  - The soil type of the patch.
  - foreign key: **soilType** in the *ValidSoilTypes* table.
**deletedOn** - timestamptz

---
### PlantInfo
Stores information about plant species, namely common and scientific names, whether the plant is native to the sanctuary, and the subcategory of plant (defined in the ValidSubcategories table).
##### Fields
**plantID** - int ==primary key==
**plantCommonName** - text NOT NULL UNIQUE
  - Common name of the plant. Required field, and must be unique. 
**plantScientificName** - text UNIQUE
  - Scientific name of the plant. Optional field, but must be unique.
**isNative** - boolean
  - Indicates whether this species of plant is native to the sanctuary. Optional field. 
**subcategory** - text ==foreign key==
  - The subcategory of this plant species. optional field.
  - foreign key: references **subcategory** in the *ValidSubcategories* table.
**deletedOn** - timestamptz

---
### Snapshots
Snapshots are designed to be collections of observations for a particular patch, created by a particular user. Snapshots assert that any observations within this snapshot were accurate at the time the snapshot was made, up until a new snapshot was made for the same patch. 
**This means that any observations that you want to remain unchanged across snapshots must be duplicated into the new snapshot. If observations are not in a snapshot, they do not apply to that patch as of the date of the snapshot.**
##### Fields
**snapshotID** - int ==primary key==
  - Unique identifier for a snapshot. Entries in the *Observations* table reference this field.
**userID** - uuid NOT NULL ==foreign key==
  - The user who made this snapshot and by extension all of its related observations. Required field.
  - foreign key: references **userID** in the *users* table. 
**notes** - text
  - Any additional notes the user wishes to add about any observations or about the snapshot in general. Optional field.
**dateCreated** - date NOT NULL
  - The date the snapshot was created. A snapshot verifies the validity of all observations in this snapshot between the date this snapshot was created and the date of the next most recent snapshot. This is required.
**patchID** - text NOT NULL ==foreign key==
**deletedOn** - timestamptz

---
### users
Stores information about registered users of the app, such as id, email, name, and role (defined in the ValidRoles table). Passwords are not stored here, as Supabase Authentication handles that.
##### Fields
**userID** - uuid ==primary key==
**email** - text NOT NULL UNIQUE
**username** - text NOT NULL UNIQUE
**firstName** - text
**lastName** - text
**role** - varchar NOT NULL ==foreign key==
**roleRequested** - varchar ==foreign key==
**created_at** - timestamptz
**updated_at** - timestamptz
**deletedOn** - timestamptz

---
### ValidRoles
Defines that list of acceptable roles that a user can have or request. 
##### Fields
**role** - varchar ==primary key==
**deletedOn** - timestamptz

---
### ValidSoilTypes
Defines the list of acceptable soil types that a patch in the sanctuary can have.
##### Fields
**soilType** - text ==primary key==
**deletedOn** - timestamptz

---
### ValidSubcategories
Defines the list of acceptable plant types that a plant species can be classified as. 
##### Fields
**subcategory** - text ==primary key==
**deletedOn** - timestamptz
