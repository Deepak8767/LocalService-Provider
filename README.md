# 🛠️ LocalService Provider Booking System

A full-stack Local Service Provider Booking Platform that connects users with verified local service professionals such as plumbers, electricians, and technicians.
The system includes admin verification of service providers, secure Razorpay payments, booking management, reviews, and chatbot support, built using Spring Boot and modern web technologies.

## 🚀 Features
# 👤 User Features
* User registration and login
* Browse available services
* Book verified service providers
* Secure online payment using Razorpay
* View booking and payment history
* Add and view service reviews
* ChatBot support for user queries

# 🧑‍🔧 Service Provider Features
* Provider registration
* Login only after admin approval
* View assigned booking requests
* Accept or reject bookings
* Update booking and service status

# ⚠️ A service provider cannot access the system until approved by Admin

# 🛡️ Admin Features
* Admin login with role-based access
* Approve / Activate service providers after registration
* Deactivate or block service providers
* Manage users and providers
* View all bookings across the platform
* Monitor services and booking statuses

# 🔐 Admin Verification Flow
* Service Provider registers
* Provider status is set to INACTIVE
* Admin reviews provider details
* Admin activates or deactivates the provider
* Only ACTIVE providers can receive and accept bookings

# 💳 Payment Integration (Razorpay)
* The application integrates Razorpay Payment Gateway to enable secure and seamless online payments.

# 🔹 Payment Features
* Supports UPI, Debit Card, Credit Card, Net Bankin
* Backend order creation using Razorpay APIs
* Secure payment signature verification
* Booking confirmation after successful payment

# 🔐 Payment Flow
* User selects service
* Backend creates Razorpay order
* Razorpay checkout opens on frontend
* User completes payment
* Backend verifies payment
* Booking is confirmed and assigned

# 🤖 ChatBot Integration
* ChatBot assists users with common service-related queries
* Integrated as a backend REST API
* Enhances user experience and support

## 📸 Screenshots
# Login Page
<img width="1888" height="907" alt="Screenshot 2026-01-11 085208" src="https://github.com/user-attachments/assets/46106f08-b7c0-44c9-997f-04004833087b" />


# 👤 User Module
* Home Page
<img width="1893" height="908" alt="Screenshot 2026-01-11 085239" src="https://github.com/user-attachments/assets/0aaadb64-f13c-4adb-9404-7a1ee30cce1a" />
<img width="1892" height="830" alt="Screenshot 2026-01-11 085303" src="https://github.com/user-attachments/assets/542fb8fd-3d8c-4dae-bf9f-ff42e8f73cee" />
<img width="1892" height="830" alt="Screenshot 2026-01-11 085303" src="https://github.com/user-attachments/assets/be6f7ad8-de1b-4dda-865d-59e79c1a4e48" />
<img width="1891" height="827" alt="Screenshot 2026-01-11 085323" src="https://github.com/user-attachments/assets/68f72a48-3d9e-41dc-a32d-8bba21986575" />
<img width="1886" height="689" alt="Screenshot 2026-01-11 085338" src="https://github.com/user-attachments/assets/8f3fac80-c31c-4329-bbca-d97f02c707ac" />

* Service Listing
<img width="1901" height="770" alt="Screenshot 2026-01-11 085358" src="https://github.com/user-attachments/assets/5cdfc510-2d65-4166-96d3-e7682be748f9" />

* Booking Page
<img width="1890" height="907" alt="Screenshot 2026-01-11 085425" src="https://github.com/user-attachments/assets/7fbde144-7ec7-4a4b-b71a-a8e822c34900" />
<img width="1888" height="827" alt="Screenshot 2026-01-11 085449" src="https://github.com/user-attachments/assets/cf810260-dcbc-44e2-84a1-22abea50a6f0" />

* Payment Confirmation

# 🧑‍🔧 Service Provider Module
* Booking Management
<img width="1889" height="915" alt="Screenshot 2026-01-11 085613" src="https://github.com/user-attachments/assets/7620ecde-f3aa-4051-8da6-15f0ed0415e7" />
* Reviews& Rating
<img width="1116" height="753" alt="Screenshot 2025-12-11 190849" src="https://github.com/user-attachments/assets/9bc11165-b80f-4637-b972-e23dfd7f74e8" />



# 🛡️ Admin Module
* Provider Verification (Activate / Deactivate)
<img width="1892" height="908" alt="Screenshot 2026-01-11 100350" src="https://github.com/user-attachments/assets/1c188037-97c0-413a-8927-7fe7f2d125d9" />

* View All Bookings
<img width="1892" height="757" alt="Screenshot 2026-01-11 100334" src="https://github.com/user-attachments/assets/797f745b-52c7-43d3-9545-244c3957aea0" />

* User & Provider Management
<img width="1115" height="813" alt="Screenshot 2025-12-11 191458" src="https://github.com/user-attachments/assets/c459ad1e-994d-45db-9a56-37d1c120f91e" />


# 💳 Razorpay Payment

* Razorpay Checkout Page
<img width="1445" height="859" alt="Screenshot 2025-12-11 191930" src="https://github.com/user-attachments/assets/df0193af-d7d0-4550-b7c1-5fef913dcd65" />
<img width="1395" height="865" alt="Screenshot 2025-12-11 192020" src="https://github.com/user-attachments/assets/7343c268-014f-448f-a285-920475c8efd5" />


* Payment Success Screen
<img width="1157" height="614" alt="Screenshot 2025-12-11 192414" src="https://github.com/user-attachments/assets/257bd839-c3c5-4a4b-9f60-c7de49b4db81" />


# 🤖 ChatBot
* ChatBot Interface
<img width="1897" height="921" alt="Screenshot 2026-01-11 085759" src="https://github.com/user-attachments/assets/1d6acec2-0ef3-4d93-87fb-a71f02755fe4" />


# 🧩 Project Structure
# Frontend
<img width="616" height="669" alt="Screenshot 2026-01-11 090017" src="https://github.com/user-attachments/assets/74029afa-9f8b-4425-aebb-d0df7a2fd957" />

# Backend
<img width="587" height="499" alt="Screenshot 2026-01-11 090002" src="https://github.com/user-attachments/assets/cf6ce0ba-c0a2-4304-a1dd-372dc9c9fee9" />

# 🧪 Tech Stack
# Backend
* Java
* Spring Boot
* Spring MVC
* Spring Security
* Spring Data JPA (Hibernate)
* MySQL
* Maven
* Razorpay Payment Gateway

# Frontend
* HTML, CSS, JavaScript
* React
* Bootstrap

# 🔐 Security
* Role-based authentication (USER / PROVIDER / ADMIN)
* BCrypt password encryption
* Admin-controlled provider activation
* Secured REST APIs with Spring Security

# ⚙️ How to Run Backend Locally
* git clone https://github.com/Deepak8767/LocalService-Provider.git
* cd backend
* mvn spring-boot:run

# 💳 Razorpay Configuration
* razorpay.key.id=your_key_id
* razorpay.key.secret=your_key_secret

# 📌 Future Enhancements
* Location-based provider matching
* Razorpay refunds
* Invoice generation
* Email/SMS notifications
* Mobile application support

# 👨‍💻 Author
* Deepak Deore
* Software Developer | Java | Spring Boot | Full-Stack Development

* GitHub: https://github.com/Deepak8767

⭐ Support

If you like this project, please give it a ⭐ on GitHub.
