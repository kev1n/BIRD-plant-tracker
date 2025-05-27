---
sidebar_position: 2
---


# Important Preface

## What is a Patch?

A **patch** is an individual 15 ft × 15 ft plot of land. Approximately 400 patches make up the area of the sanctuary.

Patches are arranged side by side and denoted by **\[COLUMN]\[ROW]** (e.g., `D4` means column D and row 4).

---

## What is an Observation?

An **observation** represents that at a given patch and time, a person has observed one type of plant (including metadata such as quantity).

> **Example:**
>
> On January 12th, monitoring patch `D4`:
>
> 1. See 10 units of Black‑eyed Susans → create an observation
> 2. See 5 units of Butterfly Weed → create an observation

If a month later you check again:

* Black‑eyed Susans remain the same
* No more Butterfly Weed

With observations only, recording absence can be awkward:

1. Deleting the original observation loses historical data
2. Creating a new observation with quantity 0 requires re-entering all metadata

---

## What is a Snapshot?

A **snapshot** is a group of one or more observations, representing the **complete** state of a patch at a specific time.

> **Example:**
>
> **Snapshot A** at `D4` on January 12th contains:
>
> * 10 Black‑eyed Susans
> * 5 Butterfly Weed

A month later, **Snapshot B** could be recorded by either:

1. Duplicating Snapshot A and removing the Butterfly Weed observation
2. Creating a new snapshot and adding only the Black‑eyed Susans observation

In both cases, historical data about Butterfly Weed remains in Snapshot A, and its absence in Snapshot B indicates disappearance.

**Duplication technique:**

* Good when many observations are unchanged
* Efficient for copying previous observations

**New snapshot technique:**

* Good when many observations have changed
* Ideal after long intervals when many changes are expected

---

## Pros of Snapshots + Observations vs. Observations Only

* **Organized grouping:** Snapshots naturally group observations, making bulk copy and manipulation easier.
* **Greater confidence:** A snapshot guarantees all included observations are accurate at that time.
* **Simplicity:** Each snapshot gives a concrete record of patch state, avoiding piecing together scattered observations.

> **Note:** Observations **must** belong to a snapshot; there are no standalone observations.

---

## Roles

There are four user roles, listed from most to least permissions. Bullet points indicate features granted to that role (roles below inherit permissions from those above).

### 1. Owner

* Complete control over the site
* Can promote or downgrade any role

### 2. Admin

* All Editor permissions
* Can promote or revoke Editors
* Can delete **all** snapshots and observations

### 3. Editor

* Can create new snapshots and observations
* Can edit **all** snapshots and observations

### 4. User

* Can view **all** snapshots and observations
* Can filter and sort observations
* Can download observations (Spreadsheet view)
