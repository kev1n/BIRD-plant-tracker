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

#### Observations
Observations store information about specific plants. Every observation belongs to a snapshot. 

#### PatchInfo
Stores information about patches in the grid dividing the sanctuary, namely latitude, longitude, and soil type (defined in the ValidSoilTypes table).

#### PlantInfo
Stores information about plant species, namely common and scientific names, whether the plant is native to the sanctuary, and the subcategory of plant (defined in the ValidSubcategories table).

#### Snapshots
Snapshots are designed to be collections of observations for a particular patch, created by a particular user. Snapshots assert that any observations within this snapshot were accurate at the time the snapshot was made. 

#### Users
Stores information about registered users of the app, such as id, email, name, and role (defined in the ValidRoles table). Passwords are not stored here, as Supabase Authentication handles that.

#### ValidRoles
Defines that list of acceptable roles that a user can have or request. 

#### ValidSoilTypes
Defines the list of acceptable soil types that a patch in the sanctuary can have.

#### ValidSubcategories
Defines the list of acceptable plant types that a plant species can be classified as. 
