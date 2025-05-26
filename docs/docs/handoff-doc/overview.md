# System at a glance

Below are the frontend and backend tech stacks of the **Clark Street Bird Sanctuary Plant Tracker Website**, as well as the key directories for each of the repositories.

### Frontend

| Framework       | Purpose                |
| --------------- | -----------------------|
| React           | UI components          |
| React Router v7 | Navigation Across Pages|
| Tailwind        | Styling components     |
| Supabase        | Authentication         |

### Backend
| Framework       | Purpose                       |
| --------------- | ------------------------------|
| Node.js, Express| Server-side logic             |
| PostgreSQL      | Used via Supabase for database|
| ESLint, Prettier| Consistent code formatting    |

## Key directories

### Frontend
```
src/    → Contains the source code for the React application, including components, pages, and other related files.

public/ → Holds static assets such as the index.html file, images, and other resources that are publicly accessible.

.github/ → Contains GitHub-specific configurations, such as workflows for GitHub Actions.

.vscode/ → Includes settings specific to Visual Studio Code, which can help maintain consistent development environments.
```

### Backend
```
src/     → Houses the source code for the backend application, including route handlers, middleware, and other server-side logic.

uploads/ → Used for storing uploaded files, such as images or documents, that are handled by the backend.

.github/ → Contains GitHub-specific configurations, such as workflows for GitHub Actions.

.vscode/ → Includes settings specific to Visual Studio Code, which can help maintain consistent development environments.
```


## Decision Log
| Choice                         | Rationale                                                             |
| ------------------------------ | ----------------------------------------------------------------------|
| Chose **React** for frontend       | Standard modern framework with component reusability                  |
| Used **Tailwind** CSS              | Utility-first styling for fast prototyping and consistency            |
| Backend built with **Express.js**  | Lightweight, flexible Node.js framework                               |
|Chose **Supabase** for backend      | Open-source Firebase alternative; built-in auth and Postgres database |
| Adopted **Docusaurus** for docs	   | Built-in docs support, versioning, and quick setup                    |