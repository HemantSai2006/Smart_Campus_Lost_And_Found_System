# Smart Campus Lost & Found Management System

[![Java](https://img.shields.io/badge/Java-17%20%2F%2021%20%2F%2025-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.0.3-blue.svg)](https://spring.io/projects/spring-cloud)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1.svg)](https://www.mysql.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Microservices-purple.svg)]()

A modern, full-stack microservices-based web application designed for universities and college campuses to manage, report, search, match, and claim lost and found belongings.

Built with **Java Spring Boot**, **Spring Cloud (Eureka, API Gateway, OpenFeign)**, **Spring Security with JWT**, **MySQL**, **Cloudinary / Local File Storage**, and **React + Tailwind CSS**.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Microservices Ecosystem](#microservices-ecosystem)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [Database Configuration & Schema](#database-configuration--schema)
- [Environment Configuration](#environment-configuration)
- [Quick Start Guide](#quick-start-guide)
- [API Endpoints Reference](#api-endpoints-reference)
- [Demonstration Accounts](#demonstration-accounts)
- [Testing & Verification](#testing--verification)
- [License](#license)

---

## Project Overview

On modern university campuses, personal belongings (ID cards, laptops, books, keys, electronics, water bottles) are frequently misplaced. Traditional lost-and-found processes rely on informal social media chats, physical noticeboards, or security guard desks, leading to:
- **Scattered Information**: No central searchable database of lost or found goods.
- **Unverified Ownership**: High risk of false claims without verification protocols.
- **Manual Overhead**: Campus security maintains non-indexed paper logbooks.

The **Smart Campus Lost & Found Management System** solves this by providing:
1. A single centralized portal for students, faculty, and administrative staff.
2. A deterministic, rule-based matching engine that cross-references lost and found reports in real-time.
3. An administrative verification workflow requiring proof of ownership before item handover.
4. An integrated image upload pipeline with local filesystem persistence and cloud hosting capabilities.

---

## Key Features

- **Role-Based Access Control**: Strict segregation of roles for **Students** and **Campus Administrators**.
- **Secure Authentication**: Passwords hashed with **BCrypt**; stateless authentication via **JWT (JSON Web Tokens)**.
- **Lost & Found Reporting**: Full reporting form with categories, campus locations, timestamps, brand, color, descriptions, and item image uploads.
- **Image Upload System**:
  - Supports **JPG, PNG, and WEBP** images up to **5 MB**.
  - Dual-mode storage: Automatic local disk fallback with UUID-based persistent storage in `uploads/`, plus Cloudinary integration support.
  - Standardized **"No Image Available"** fallback when no photo is attached.
- **Rule-Based Matching Engine**:
  - Non-ML, explainable scoring algorithm (Category: 25 pts, Location: 20 pts, Brand: 15 pts, Color: 10 pts, Name: up to 30 pts).
  - Triggers candidate alerts when the composite match score reaches $\ge 50\%$.
- **Ownership Verification & Claims Queue**:
  - Students submit detailed ownership proof (e.g., serial numbers, stickers, invoice details).
  - Administrators review claims, with one-click **Approve** (transitions item to `RETURNED`) or **Reject** with feedback reason.
- **Live In-App Notifications**: Alerts generated for match detections, claim submissions, approvals, and returns.
- **Dynamic Student Dashboard**: Real-time summary cards for Total Reports, Lost Items, Found Items, Matches, and Claims that update automatically without page reloads.

---

## System Architecture

```
                    ┌─────────────────────────────────┐
                    │   React.js + Tailwind CSS UI    │
                    │        (Port: 5173)             │
                    └────────────────┬────────────────┘
                                     │ HTTP (Bearer JWT)
                                     ▼
                    ┌─────────────────────────────────┐
                    │      Spring Cloud Gateway       │
                    │          (Port: 8080)           │
                    └───────┬─────────────────┬───────┘
                            │                 │
    ┌───────────────────────┘                 └───────────────────────┐
    ▼                                                                 ▼
┌──────────────────┐                                          ┌──────────────┐
│  Eureka Server   │ <─── Service Registry & Discovery        │ MySQL Server │
│   (Port: 8761)   │                                          │ (Port: 3306) │
└──────────────────┘                                          └──────┬───────┘
    │                                                                │
    ├─────────────────────┬─────────────────────┬────────────────────┤
    ▼                     ▼                     ▼                    ▼
┌──────────────┐   ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ auth-service │   │ item-service │◄────┐│matching-serv.│     │claim-service │
│ (Port: 8081) │   │ (Port: 8082) │     ││ (Port: 8083) │     │ (Port: 8084) │
└──────────────┘   └──────┬───────┘     │└──────┬───────┘     └──────┬───────┘
                          │             │       │                    │
                          │   OpenFeign └───────┤                    │ OpenFeign
                          └─────────────────────┼────────────────────┤
                                                ▼                    ▼
                                        ┌──────────────────────────────┐
                                        │     notification-service     │
                                        │         (Port: 8085)         │
                                        └──────────────────────────────┘
```

---

## Microservices Ecosystem

| Microservice | Port | Description |
|---|:---:|---|
| **`eureka-server`** | `8761` | Netflix Eureka Service Discovery & Registry server. |
| **`api-gateway`** | `8080` | Spring Cloud Gateway providing unified routing, CORS configuration, and JWT header enrichment. |
| **`auth-service`** | `8081` | User registration, authentication, BCrypt password hashing, JWT generation, and profile management. |
| **`item-service`** | `8082` | CRUD operations for Lost and Found items, multipart image upload, and persistent image serving. |
| **`matching-service`** | `8083` | Deterministic rule-based scoring engine evaluating lost vs. found candidate pairs. |
| **`claim-service`** | `8084` | Ownership claim submission, verification workflows, and admin claim approvals. |
| **`notification-service`**| `8085` | In-app alerts, badge counters, and real-time user notification history. |
| **`frontend`** | `5173` | React 19 single-page application styled with modern Tailwind CSS v4 and Lucide icons. |

---

## Technology Stack

### Backend
- **Java 17 / 21 / 25** (Compatible across modern LTS versions)
- **Spring Boot 3.3.5**
- **Spring Cloud 2023.0.3** (Eureka Server & Client, Gateway, OpenFeign)
- **Spring Security 6** with stateless JWT authentication (`jjwt-api 0.12.6`)
- **Spring Data JPA** with Hibernate ORM
- **MySQL 8.0** Connector / J
- **SpringDoc OpenAPI 3 / Swagger UI**
- **Apache Maven** (Multi-module build configuration)

### Frontend
- **React 19**
- **Vite** build tooling
- **Tailwind CSS v4**
- **Lucide React** icons

---

## Project Directory Structure

```
API_MS_project/
├── pom.xml                     # Root multi-module Maven POM
├── run-all.ps1                 # 1-Click launcher script for Windows PowerShell
├── run-all.bat                 # 1-Click launcher script for Windows CMD
├── docker-compose.yml          # Docker Compose multi-container deployment
├── .env.example                # Environment variable configuration template
├── .gitignore                  # Git ignore rules for Java, Node, and runtime data
├── uploads/                    # Local persistent storage for item image uploads
├── eureka-server/              # Service Discovery Server (Port 8761)
├── api-gateway/                # API Gateway Router (Port 8080)
├── auth-service/               # Authentication & User Management (Port 8081)
├── item-service/               # Items & Image Storage Service (Port 8082)
├── matching-service/           # Matching Engine (Port 8083)
├── claim-service/              # Claims Verification Service (Port 8084)
├── notification-service/       # Notification & Alerts Service (Port 8085)
└── frontend/                   # React Single-Page Application (Port 5173)
    ├── src/
    │   ├── components/         # Reusable UI components & modals
    │   ├── context/            # Authentication & State Management
    │   ├── pages/              # Browse, Dashboard, Matches, Claims
    │   └── services/           # Axios / Fetch API client
    ├── package.json
    └── vite.config.js
```

---

## Database Configuration & Schema

The application connects to MySQL on port `3306` with the database name `smart_campus` (created automatically if absent).

### Primary Tables
1. **`users`**: User records with BCrypt passwords, contact details, and role (`STUDENT`, `ADMIN`).
2. **`items`**: Item reports with type (`LOST`, `FOUND`), metadata, location, timestamps, image URLs, and lifecycle status (`REPORTED`, `MATCHED`, `CLAIMED`, `RETURNED`).
3. **`claims`**: Ownership claims submitted by students with proof descriptions, item associations, and status (`PENDING`, `APPROVED`, `REJECTED`).
4. **`notifications`**: User notifications with types (`MATCH_FOUND`, `CLAIM_SUBMITTED`, `CLAIM_APPROVED`, `CLAIM_REJECTED`, `GENERAL`).

---

## Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Edit `.env` to configure your local credentials:

```ini
# MySQL Database Credentials
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/smart_campus?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_mysql_password_here

# Service Discovery & Gateway
EUREKA_URI=http://localhost:8761/eureka/
API_GATEWAY_URL=http://localhost:8080

# JWT Secret
JWT_SECRET=CampusLostAndFoundSecretKeyForJwtAuthenticationWhichIsVeryLongAndSecure2026!

# Cloudinary (Optional: leaves system using persistent local storage if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> **Note**: `.env` is listed in `.gitignore` to prevent committing sensitive passwords to GitHub.

---

## Quick Start Guide

### Prerequisites
1. **JDK 17, 21, or 25** installed and available on PATH.
2. **Node.js 18+** & **npm** installed.
3. **MySQL 8.0** running locally on port `3306`.
4. Create database `smart_campus` (or allow Spring Boot auto-creation):
   ```sql
   CREATE DATABASE IF NOT EXISTS smart_campus;
   ```

### Option A: One-Click Runner (Windows)

**In PowerShell:**
```powershell
.\run-all.ps1
```

**In Command Prompt:**
```bat
run-all.bat
```

The script will:
1. Boot Eureka Server on `:8761`
2. Start all 5 backend microservices (`:8081` - `:8085`)
3. Start the API Gateway on `:8080`
4. Launch the React frontend on `:5173`
5. Open your default browser to `http://localhost:5173`

---

### Option B: Manual Multi-Terminal Startup

```bash
# 1. Start Eureka Server (Port 8761)
mvn spring-boot:run -pl eureka-server

# 2. Start Auth Service (Port 8081)
mvn spring-boot:run -pl auth-service

# 3. Start Item Service (Port 8082)
mvn spring-boot:run -pl item-service

# 4. Start Notification Service (Port 8085)
mvn spring-boot:run -pl notification-service

# 5. Start Matching Service (Port 8083)
mvn spring-boot:run -pl matching-service

# 6. Start Claim Service (Port 8084)
mvn spring-boot:run -pl claim-service

# 7. Start API Gateway (Port 8080)
mvn spring-boot:run -pl api-gateway

# 8. Start Frontend Client (Port 5173)
cd frontend
npm install
npm run dev
```

---

## API Endpoints Reference

All requests route through the API Gateway at `http://localhost:8080`:

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `POST` | `/api/auth/register` | Register new student account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |

### Items (`/api/items`)
| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `GET` | `/api/items` | Search & filter lost and found items | Public |
| `GET` | `/api/items/{id}` | Get item details by ID | Public |
| `GET` | `/api/items/my` | Get items reported by current user | Authenticated |
| `POST` | `/api/items/lost` | Report a lost item | Authenticated |
| `POST` | `/api/items/found` | Report a found item | Authenticated |
| `POST` | `/api/items/upload-image` | Upload item photo (JPG/PNG/WEBP $\le 5$MB) | Authenticated |
| `GET` | `/api/items/images/{filename}` | Retrieve uploaded image binary | Public |
| `PUT` | `/api/items/{id}` | Update own item report | Authenticated |
| `DELETE`| `/api/items/{id}` | Delete item report | Owner / Admin |

### Matching (`/api/matching`)
| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `GET` | `/api/matching/{itemId}` | Get potential matches for specific item | Authenticated |
| `GET` | `/api/matching/all` | Get all system-wide match pairs ($\ge 50\%$) | Authenticated |

### Claims (`/api/claims`)
| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `POST` | `/api/claims` | Submit an ownership claim with proof | Authenticated |
| `GET` | `/api/claims/my` | Get current user's submitted claims | Authenticated |
| `GET` | `/api/claims` | Get all submitted claims queue | Admin |
| `PUT` | `/api/claims/{id}/approve`| Approve claim and mark item as RETURNED | Admin |
| `PUT` | `/api/claims/{id}/reject` | Reject claim with comment | Admin |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Access |
|:---:|---|---|:---:|
| `GET` | `/api/notifications` | Get user notifications | Authenticated |
| `PUT` | `/api/notifications/{id}/read` | Mark alert as read | Authenticated |

---

## Demonstration Accounts

| Role | Name | Email | Password |
|---|---|---|---|
| **Campus Administrator** | SmartCampus Admin | `admin@smartcampus.com` | `Admin@123` |
| **Student** | Rahul Sharma | `rahul@campus.edu` | `Student@123` |
| **Student** | Priya Patel | `priya@campus.edu` | `Student@123` |

> *Tip: The web UI includes 1-click test credential fill buttons on the Sign In modal.*

---

## Testing & Verification

- **Backend Unit & Integration Tests**: Run `mvn test` in any service module.
- **Frontend Production Build**: Run `npm run build` inside `frontend/` to test Vite production bundling.
- **Microservices Health Check**: Inspect `http://localhost:8761` to verify all 6 services are registered with status `UP`.

---

## License

This project is developed for college academic submission, research, and educational demonstration.