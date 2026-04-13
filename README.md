# 101486489 COMP3133 Assignment 2 - Plugged Version

This package contains:

- `backend/` -> your Assignment 1 backend (without `node_modules` and without the original `.env`)
- `frontend/` -> Angular frontend already adapted to the backend schema

## Backend run
1. Open terminal in `backend`
2. Create a `.env` file using your real values
3. Run:
   - `npm install`
   - `npm start`
4. Backend should run at `http://localhost:4000/graphql`

## Frontend run
1. Open another terminal in `frontend`
2. Run:
   - `npm install`
   - `npm start`
3. Open `http://localhost:4200`

## Notes
- Login accepts **username or email**
- Search form uses **Position** in the UI but sends it to backend as `designation`
- Picture upload is stored as a Base64 string in `photoUrl`
