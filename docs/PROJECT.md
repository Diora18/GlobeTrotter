# Project Overview

## Vision

GlobeTrotter aims to become a personalized, intelligent, and collaborative platform that transforms how people plan and experience travel. Users can explore destinations, build structured itineraries, make cost-effective decisions, and share plans within a community — making travel planning as exciting as the trip itself.

## Mission (Hackathon)

Build a user-centric, responsive application that simplifies multi-city travel planning. The platform should let travelers:

- Add and manage travel stops and durations
- Explore cities and activities of interest
- Estimate trip budgets automatically
- Visualize timelines and plans
- Share trip plans with others

The solution must be functional and insightful, powered by a well-designed **relational database** and a smooth frontend experience.

## Problem statement

Design and develop a complete travel planning application where users can:

- Create customized multi-city itineraries
- Assign travel dates, activities, and budgets
- Discover activities and destinations through search
- Receive cost breakdowns and visual calendars
- Share plans publicly or with friends

The application must demonstrate proper use of a relational database to store and retrieve complex travel data: user itineraries, stops, activities, and estimated expenses. The UI should adapt dynamically to each user's trip flow.

## Target users

| User | Description |
|------|-------------|
| **Traveler** | Primary user — creates and manages personal trips |
| **Viewer** | Anyone with a public share link — read-only access |
| **Admin** | Optional — platform analytics and user management |

## Glossary

| Term | Definition |
|------|------------|
| **Trip** | A travel plan with a name, date range, and optional description/cover photo |
| **Stop** | One city visit within a trip, with arrival/departure dates and sort order |
| **Activity** | A catalog item (sightseeing, food tour, etc.) linked to a city |
| **Stop Activity** | An activity assigned to a specific stop on a trip (may override time/cost) |
| **Itinerary** | The full ordered view of stops and their day-wise activities |
| **Share slug** | Unique URL token for public read-only trip view |
| **Cost index** | Relative expense rating for a city (seed data) |
| **Budget breakdown** | Computed totals by category (transport, stay, activities, meals) |

## MVP scope

### In scope

- Auth (register, login, logout, profile)
- Trip CRUD and trip list
- Itinerary builder (stops + activities, reorder)
- City and activity search (from seed catalog)
- Itinerary view (list + day-wise layout)
- Budget summary with category breakdown
- Calendar/timeline view
- Public share link with copy-trip
- User profile/settings

### Out of scope (for now)

- Real-time collaborative editing
- Native mobile apps
- Payment/booking integrations
- Admin analytics dashboard (stretch goal — see [FEATURES.md](./FEATURES.md) screen 13)

## Success criteria (demo)

1. User can sign up, create a multi-city trip, and add activities.
2. Budget updates automatically as activities are added.
3. Itinerary displays day-wise with cities and activities.
4. User can generate a public link; another user can view and copy the trip.
5. Data persists in PostgreSQL with clear relational structure.

## Design reference

Wireframe mockup: https://link.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1

Detailed screen requirements are in [FEATURES.md](./FEATURES.md).
