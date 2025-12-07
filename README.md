# Job Portal Management System

## 1. Project Title
**Job Portal Management System**

## 2. Problem Statement
In the current job market, candidates often struggle to find relevant opportunities due to scattered listings and creating unmanageable application processes. Conversely, employers face challenges in efficiently tracking and managing incoming applications. The Job Portal Management System bridges this gap by providing a centralized, role-based platform where Job Seekers can easily search, filter, and apply for jobs, while Employers can post listings and manage applications in real-time. This ensures a streamlined recruitment process for both parties.

## 3. System Architecture
**Frontend** → **Backend (API)** → **Database**

### Tech Stack
*   **Frontend**: React.js + Context API + Vanilla CSS
*   **Backend**: Node.js + Express.js
*   **Database**: MongoDB Atlas
*   **Authentication**: JWT-based (JSON Web Tokens) + Cookies
*   **File Storage**: MongoDB (GridFS/Binary Buffers) for Resume uploads

### Deployment (Recommended)
*   **Frontend**: Vercel
*   **Backend**: Render
*   **Database**: MongoDB Atlas

## 4. Key Features

| Category | Features |
| :--- | :--- |
| **Authentication** | Secure Registration, Login, and Logout with JWT. |
| **Role Management** | Distinct workspaces for **Employers** (Post Jobs, Manage Applications) and **Job Seekers** (Apply, Track Status). |
| **Job Management** | Full CRUD capabilities for Employers to Post, Update, and Delete jobs. |
| **Advanced Search** | Keyword-based searching for Job Titles and Descriptions. |
| **Granular Filtering** | Filter jobs by Category, Country, City, and Location. |
| **Sorting & Pagination** | Sort listings by Date or Salary; Navigate easily via Pagination. |
| **Application System** | Streamlined application process with Resume uploads (Stored in MongoDB). |

## 5. CRUD Implementation & API Overview
This project implements full CRUD operations. All protected routes require a valid JWT Token stored in HttpOnly cookies.

### Authentication
*   **POST** `/api/v1/user/register`: Register a new user (Employer/Job Seeker).
*   **POST** `/api/v1/user/login`: Login and receive JWT in cookie.
*   **GET** `/api/v1/user/logout`: Clear session cookie.
*   **GET** `/api/v1/user/getuser`: Retrieve current user details.

### Jobs CRUD
**Create (Post Job)**
*   **Endpoint**: `POST /api/v1/job/post`
*   **Logic**: Validates role as 'Employer', checks required fields (Title, Salary, Location), and saves to DB.

**Read (Get Jobs)**
*   **Endpoint**: `GET /api/v1/job/getall`
*   **Logic**: Fetches jobs with support for **Search**, **Filter**, and **Pagination**.
*   **Endpoint**: `GET /api/v1/job/getmyjobs`
*   **Logic**: Fetches only the jobs posted by the logged-in Employer.
*   **Endpoint**: `GET /api/v1/job/:id`
*   **Logic**: Fetches details of a single job.

**Update (Edit Job)**
*   **Endpoint**: `PUT /api/v1/job/update/:id`
*   **Logic**: Allows Employers to modify job details (e.g., salary, description).

**Delete (Remove Job)**
*   **Endpoint**: `DELETE /api/v1/job/delete/:id`
*   **Logic**: Removes the job listing permanently.

### Application CRUD
**Create (Apply)**
*   **Endpoint**: `POST /api/v1/application/post`
*   **Logic**: Uploads resume to MongoDB as binary data, links Applicant to Job, and stores Application.

**Read (View Applications)**
*   **Endpoint**: `GET /api/v1/application/employer/getall`
*   **Logic**: Employers view all applications for their posted jobs.
*   **Endpoint**: `GET /api/v1/application/jobseeker/getall`
*   **Logic**: Job Seekers view their own application history.

**Update (Update Status)**
*   **Endpoint**: `PUT /api/v1/application/status/update/:id`
*   **Logic**: Employers can update the status of an application to **Accepted** or **Rejected**.

**Delete (Withdraw)**
*   **Endpoint**: `DELETE /api/v1/application/delete/:id`
*   **Logic**: Removes the application.

## 6. Advanced Data Handling
The application employs sophisticated techniques to manage data efficiently and improve user experience.

### Pagination
Instead of loading all available jobs at once, the system uses server-side pagination.
*   **Mechanism**: The backend accepts `page` and `limit` query parameters. It uses MongoDB's `skip()` and `limit()` to return only the requested subset of data, ensuring performance scaling.

### Searching
*   **Keyword Search**: Users can search for jobs by typing keywords. The backend performs a regex-based search (`$regex`) on both the **Job Title** and **Job Description** fields to find relevant matches (case-insensitive).

### Sorting
*   **Dynamic Sorting**: The backend supports flexible sorting via the `sort` parameter.
    *   `newest`: `createdAt: -1`
    *   `oldest`: `createdAt: 1`
    *   `salaryHigh`: Sorts by Fixed Salary and Upper Salary Range descending.
    *   `salaryLow`: Sorts by Fixed Salary and Lower Salary Range ascending.

### Filtering
*   **Multi-Criteria Filtering**: Users can drill down results using multiple simultaneous filters:
    *   `category`: Matches job category.
    *   `location/city/country`: Geography-based filtering.
*   **Logic**: The backend constructs a dynamic Mongoose query object based on whichever parameters are present in the request.

## 7. How It Works (Flow)
1.  **Employer** logs in and posts a new Job (e.g., "Software Engineer").
2.  **Job Seeker** logs in and uses the Search bar to find "Software".
3.  **Backend** filters the database and returns the matching job.
4.  **Job Seeker** clicks "Apply", uploads valid Resume (PNG/JPG/WEBP), and submits.
6.  **Backend** uploads Resume to MongoDB (Binary) and creates an Application record.
6.  **Employer** visits "My Applications" and sees the new applicant's details and resume.
