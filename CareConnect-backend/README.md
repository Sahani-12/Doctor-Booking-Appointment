# CareConnect backend

Node.js + Express API for the CareConnect doctor booking system.

## Setup

1. Copy `.env.example` to `.env` and set your values.
2. `npm install`
3. `npm run dev`

## API

### Auth

- `POST /api/auth/register/doctor`
  - body: `fullname`, `email`, `password`, etc.

### Doctors

- `GET /api/doctors/doctors` (supports `page`, `limit`, `search`, `city`, `specialization`, `language`)
- `GET /api/doctors/doctors/:id`

## Example doctor query

`GET /api/doctors/doctors?page=1&limit=15&search=ashok&city=Delhi`
