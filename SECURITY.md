# Vyora Enterprise Security Specifications

---

## 🔒 Security Architecture Highlights

### 1. Password Hashing (Argon2id)
Passwords are never stored in plaintext. Vyora uses **Argon2id** (the OWASP recommended password hashing algorithm) with memory cost 65,536 KB and 3 iterations to defeat GPU brute force attacks.

### 2. Token Management & Auth Architecture
- **JWT Access Tokens**: Short-lived (1 hour expiry) signed with HMAC SHA-256.
- **Refresh Token Rotation**: Stored securely in database with revocation capabilities and 7-day expiration.
- **Role-Based Access Control (RBAC)**: Middleware enforcing permissions for `ADMIN`, `MANAGER`, `USER`, and `GUEST`.

### 3. HTTP & Network Defense
- **Helmet HTTP Headers**: Protects against Clickjacking, MIME-sniffing, X-XSS-Protection.
- **Rate Limiting**: Global limit of 300 req/15min per IP; strict auth limit of 20 attempts/15min to prevent brute-force login attempts.
- **CORS Configuration**: Restricts API calls to authorized frontend origins.

### 4. Audit & Compliance
- Every administrative change, login event, and transaction modification creates an immutable entry in `AuditLog` containing IP address and User-Agent headers.
