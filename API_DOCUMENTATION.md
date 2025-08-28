# CUZBSI REST API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Socket.IO Real-time Events](#socketio-real-time-events)
- [User Management](#user-management)
- [Role Management](#role-management)
- [Account Management](#account-management)
- [Transaction Management](#transaction-management)
- [BSI Automation](#bsi-automation)
- [System Management](#system-management)
- [Error Handling](#error-handling)

---

## Authentication

### Login
**POST** `/api/auth/login`

Login with email and password to receive JWT tokens.

**Request Body:**
```json
{
  "email": "admin@multimutasi.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@multimutasi.com",
      "roles": ["admin", "user"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Authentication Info
**GET** `/api/auth/info`

Get available authentication endpoints.

**Response:**
```json
{
  "success": true,
  "message": "Authentication endpoints",
  "data": {
    "endpoints": {
      "login": "POST /api/auth/login",
      "refresh": "POST /api/auth/refresh",
      "logout": "POST /api/auth/logout"
    }
  }
}
```

### Logout
**POST** `/api/auth/logout`

Logout the current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Socket.IO Real-time Events

### Connection
Connect to Socket.IO server with JWT authentication:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5543', {
  auth: {
    token: 'your_jwt_access_token_here'
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Sync Events

#### Single Account Sync Events
```javascript
// Sync started
socket.on('sync_started', (data) => {
  console.log('Sync Started:', data);
  // data: { syncId, accountId, socketRoom, timestamp, message }
});

// Progress updates
socket.on('sync_progress', (data) => {
  console.log('Progress:', data.message);
  // data: { syncId, timestamp, message, data? }
});

// Sync completed
socket.on('sync_completed', (data) => {
  console.log('Completed:', data);
  // data: { syncId, timestamp, message, success, data }
});

// Sync error
socket.on('sync_error', (data) => {
  console.log('Error:', data);
  // data: { syncId, timestamp, message, error }
});
```

#### Batch Sync Events
```javascript
// Batch sync started
socket.on('batch_sync_started', (data) => {
  console.log('Batch Started:', data);
  // data: { syncId, socketRoom, timestamp, message, accountCount }
});

// Batch progress with percentage
socket.on('batch_sync_progress', (data) => {
  console.log('Batch Progress:', data);
  // data: { syncId, timestamp, message, progress?, accountId?, status? }
});

// Batch completed
socket.on('batch_sync_completed', (data) => {
  console.log('Batch Completed:', data);
  // data: { syncId, timestamp, message, summary }
});
```

### Event Examples

**Sync Progress Event:**
```json
{
  "syncId": "sync_4_1724752156",
  "timestamp": "2025-08-27T09:04:01.536Z",
  "message": "🚀 Initializing Chrome browser...",
  "data": null
}
```

**Batch Progress Event:**
```json
{
  "syncId": "batch_sync_1724752156",
  "timestamp": "2025-08-27T09:04:01.536Z",
  "message": "Processing account 1 (2/5)",
  "progress": {
    "current": 2,
    "total": 5,
    "percentage": 40
  }
}
```

---

## User Management

All user management endpoints require `users.manage` permission.

### Get All Users
**GET** `/api/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by email, firstName, or lastName

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@multimutasi.com",
        "firstName": "Admin",
        "lastName": "User",
        "isActive": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "Roles": [
          {
            "id": 1,
            "name": "admin",
            "description": "Administrator role"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Get Single User
**GET** `/api/users/:id`

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@multimutasi.com",
      "firstName": "Admin",
      "lastName": "User",
      "isActive": true,
      "Roles": [
        {
          "id": 1,
          "name": "admin",
          "description": "Administrator role"
        }
      ]
    }
  }
}
```

### Create User
**POST** `/api/users`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "roleIds": [1, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 5,
      "email": "newuser@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "Roles": [
        {
          "id": 1,
          "name": "admin",
          "description": "Administrator role"
        }
      ]
    }
  }
}
```

### Update User
**PUT** `/api/users/:id`

**Request Body:**
```json
{
  "email": "updatedemail@example.com",
  "firstName": "Updated John",
  "lastName": "Updated Doe",
  "isActive": true,
  "roleIds": [1, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": 5,
      "email": "updatedemail@example.com",
      "firstName": "Updated John",
      "lastName": "Updated Doe",
      "isActive": true,
      "Roles": [
        {
          "id": 1,
          "name": "admin",
          "description": "Administrator role"
        }
      ]
    }
  }
}
```

### Change User Password
**PATCH** `/api/users/:id/password`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Delete User (Deactivate)
**DELETE** `/api/users/:id`

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### Restore User
**PATCH** `/api/users/:id/restore`

**Response:**
```json
{
  "success": true,
  "message": "User restored successfully"
}
```

---

## Role Management

All role management endpoints require `users.manage` permission.

### Get All Roles
**GET** `/api/roles`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `includeUsers` (optional): Include associated users (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": {
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "description": "Administrator role with full access",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "Permissions": [
          {
            "id": 1,
            "name": "users.manage",
            "description": "Manage users and roles"
          }
        ],
        "Users": [
          {
            "id": 1,
            "email": "admin@multimutasi.com",
            "firstName": "Admin",
            "lastName": "User"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

### Get Single Role
**GET** `/api/roles/:id`

**Query Parameters:**
- `includeUsers` (optional): Include associated users (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "role": {
      "id": 1,
      "name": "admin",
      "description": "Administrator role",
      "Permissions": [
        {
          "id": 1,
          "name": "users.manage",
          "description": "Manage users and roles"
        }
      ]
    }
  }
}
```

### Create Role
**POST** `/api/roles`

**Request Body:**
```json
{
  "name": "manager",
  "description": "Manager role with limited access",
  "permissionIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "role": {
      "id": 4,
      "name": "manager",
      "description": "Manager role with limited access",
      "Permissions": [
        {
          "id": 1,
          "name": "users.manage",
          "description": "Manage users and roles"
        }
      ]
    }
  }
}
```

### Update Role
**PUT** `/api/roles/:id`

**Request Body:**
```json
{
  "name": "updated-manager",
  "description": "Updated manager role",
  "permissionIds": [1, 3, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "role": {
      "id": 4,
      "name": "updated-manager",
      "description": "Updated manager role",
      "Permissions": [
        {
          "id": 1,
          "name": "users.manage",
          "description": "Manage users and roles"
        }
      ]
    }
  }
}
```

### Delete Role
**DELETE** `/api/roles/:id`

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

**Error Response (if role is assigned to users):**
```json
{
  "success": false,
  "message": "Cannot delete role. It is assigned to 3 user(s). Remove the role from all users first."
}
```

### Get All Permissions
**GET** `/api/permissions`

**Response:**
```json
{
  "success": true,
  "message": "Permissions retrieved successfully",
  "data": {
    "permissions": [
      {
        "id": 1,
        "name": "users.manage",
        "description": "Manage users and roles"
      },
      {
        "id": 2,
        "name": "banks.manage",
        "description": "Manage bank configurations"
      },
      {
        "id": 3,
        "name": "accounts.view",
        "description": "View account information"
      }
    ]
  }
}
```

### Assign Role to Users
**POST** `/api/roles/:id/assign-users`

**Request Body:**
```json
{
  "userIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role assigned to 3 user(s) successfully",
  "data": {
    "role": {
      "id": 4,
      "name": "manager"
    },
    "assignedUsers": [
      {
        "id": 1,
        "email": "user1@example.com",
        "firstName": "User",
        "lastName": "One"
      }
    ]
  }
}
```

### Remove Role from Users
**POST** `/api/roles/:id/remove-users`

**Request Body:**
```json
{
  "userIds": [1, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role removed from 2 user(s) successfully",
  "data": {
    "role": {
      "id": 4,
      "name": "manager"
    },
    "removedFromUsers": [
      {
        "id": 1,
        "email": "user1@example.com",
        "firstName": "User",
        "lastName": "One"
      }
    ]
  }
}
```

---

## Account Management

### Get User Accounts
**GET** `/api/accounts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Accounts retrieved successfully",
  "data": {
    "accounts": [
      {
        "id": 4,
        "accountNumber": "61862171",
        "companyId": "0338",
        "username": "testuser",
        "isActive": true,
        "lastBalance": "1250000.00",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "Bank": {
          "id": 1,
          "name": "BSI",
          "code": "BSI",
          "fullName": "Bank Syariah Indonesia"
        },
        "ScrapingOption": {
          "id": 1,
          "isActive": true,
          "cronExpression": "0 */6 * * *",
          "browserType": "chrome",
          "maxRetries": 3,
          "lastStatus": "success",
          "lastRun": "2025-08-27T08:58:59.000Z",
          "errorMessage": "No transactions found"
        }
      }
    ]
  }
}
```

### Get Available Banks
**GET** `/api/banks`

**Response:**
```json
{
  "success": true,
  "message": "Banks retrieved successfully",
  "data": {
    "banks": [
      {
        "id": 1,
        "name": "BSI",
        "code": "BSI",
        "fullName": "Bank Syariah Indonesia",
        "isActive": true
      }
    ]
  }
}
```

---

## Transaction Management

### Get Transactions
**GET** `/api/transactions`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `accountId` (optional): Filter by account ID
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `type` (optional): Transaction type (Debit/Kredit)
- `flag` (optional): Transaction flag

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": 156,
        "tanggal": "2025-08-25T00:00:00.000Z",
        "description": "TRANSFER FROM ACC 1234567890",
        "Currency": "IDR",
        "Amount": "500000.00",
        "type": "Kredit",
        "Balance": "1750000.00",
        "unique": "FT25238BSI001",
        "flag": "income",
        "Account": {
          "id": 4,
          "accountNumber": "61862171",
          "Bank": {
            "name": "BSI"
          }
        }
      }
    ],
    "accounts": [],
    "flags": ["income", "expense", "transfer"],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    },
    "filters": {
      "accountId": null,
      "startDate": null,
      "endDate": null,
      "type": null,
      "flag": null
    }
  }
}
```

### Get Flagged Transactions
**GET** `/api/transactions/flagged`

Returns all transactions that have been flagged.

**Response:** Same structure as Get Transactions

### Flag Transaction
**POST** `/api/transactions/:id/flag`

**Request Body:**
```json
{
  "flag": "income"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction flagged successfully"
}
```

### Get Flag Mappings
**GET** `/api/transactions/flags`

**Response:**
```json
{
  "success": true,
  "message": "Flag mappings retrieved successfully",
  "data": {
    "flagMappings": [
      {
        "id": 1,
        "accountNumber": "61862171",
        "flag": "income",
        "keywords": "TRANSFER,SALARY,BONUS",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## BSI Automation

### Get BSI Dashboard
**GET** `/api/bsi/dashboard`

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "totalAccounts": 5,
    "activeAccounts": 4,
    "totalTransactions": 1247,
    "todayTransactions": 12,
    "recentTransactions": []
  }
}
```

### Get BSI Transactions
**GET** `/api/bsi/transactions`

**Query Parameters:**
- `limit` (optional): Number of transactions to retrieve

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 156,
      "tanggal": "2025-08-25T00:00:00.000Z",
      "description": "TRANSFER FROM ACC 1234567890",
      "Amount": "500000.00",
      "type": "Kredit",
      "Balance": "1750000.00"
    }
  ]
}
```

### Manual Sync Account
**POST** `/api/bsi/accounts/:accountId/sync`

**Query Parameters:**
- `startDate` (optional): Start date in DD/MM/YYYY format
- `endDate` (optional): End date in DD/MM/YYYY format

**Response:**
```json
{
  "success": true,
  "message": "Sync started successfully",
  "data": {
    "syncId": "sync_4_1724752156",
    "accountId": 4,
    "socketRoom": "sync_sync_4_1724752156",
    "dateRange": {
      "startDate": null,
      "endDate": null
    }
  }
}
```

### Sync All Accounts
**POST** `/api/bsi/accounts/sync-all`

**Query Parameters:**
- `startDate` (optional): Start date in DD/MM/YYYY format
- `endDate` (optional): End date in DD/MM/YYYY format

**Response:**
```json
{
  "success": true,
  "message": "Started sequential syncing of 3 accounts",
  "data": {
    "syncId": "batch_sync_1724752156",
    "socketRoom": "sync_batch_sync_1724752156",
    "accountCount": 3,
    "accountIds": [1, 2, 3],
    "dateRange": {
      "startDate": null,
      "endDate": null
    }
  }
}
```

### Get Scraping Options
**GET** `/api/bsi/accounts/:accountId/scraping`

**Response:**
```json
{
  "success": true,
  "message": "Scraping options retrieved successfully",
  "data": {
    "id": 1,
    "accountId": 4,
    "isActive": true,
    "cronExpression": "0 */6 * * *",
    "browserType": "chrome",
    "maxRetries": 3,
    "lastStatus": "success",
    "lastRun": "2025-08-27T08:58:59.000Z",
    "errorMessage": null
  }
}
```

### Update Scraping Options
**PUT** `/api/bsi/accounts/:accountId/scraping`

**Request Body:**
```json
{
  "isActive": true,
  "cronExpression": "0 */4 * * *",
  "browserType": "chrome",
  "maxRetries": 5,
  "startTime": "08:00",
  "endTime": "18:00",
  "daysOfWeek": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scraping options updated successfully",
  "data": {
    "id": 1,
    "accountId": 4,
    "isActive": true,
    "cronExpression": "0 */4 * * *",
    "browserType": "chrome",
    "maxRetries": 5
  }
}
```

---

## System Management

### Get Dashboard
**GET** `/api/dashboard`

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalAccounts": 5,
      "activeAccounts": 4,
      "totalTransactions": 1247,
      "todayTransactions": 12,
      "flaggedTransactions": 89,
      "totalBalance": 12500000.00,
      "newFlags": 0
    },
    "accounts": [],
    "recentTransactions": [],
    "chartData": {
      "transactionDates": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "transactionCounts": [12, 19, 3, 5, 2, 3, 9],
      "balanceLabels": ["61862171", "61862172"],
      "balanceData": [1250000.00, 850000.00]
    }
  }
}
```

### Get Schedules
**GET** `/api/schedules`

**Response:**
```json
{
  "success": true,
  "message": "Schedules retrieved successfully",
  "data": {
    "accounts": [
      {
        "id": 4,
        "accountNumber": "61862171",
        "isActive": true,
        "Bank": {
          "code": "BSI",
          "fullName": "Bank Syariah Indonesia"
        },
        "ScrapingOption": {
          "id": 1,
          "isActive": true,
          "cronExpression": "0 */6 * * *",
          "lastStatus": "success",
          "lastRun": "2025-08-27T08:58:59.000Z"
        }
      }
    ]
  }
}
```

### Get Settings
**GET** `/api/settings`

**Response:**
```json
{
  "success": true,
  "message": "Settings endpoint available",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@multimutasi.com",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

### Get Profile
**GET** `/api/profile`

**Response:**
```json
{
  "success": true,
  "message": "Profile data retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@multimutasi.com",
      "firstName": "Admin",
      "lastName": "User",
      "isActive": true,
      "Roles": [
        {
          "id": 1,
          "name": "admin",
          "description": "Administrator role"
        }
      ]
    }
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (duplicate)
- **500 Internal Server Error**: Server error

### Authentication Errors

**401 Unauthorized - Missing Token:**
```json
{
  "success": false,
  "message": "Authorization header missing"
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Validation Errors

**400 Bad Request - Missing Required Fields:**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**409 Conflict - Duplicate Resource:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## Complete Socket.IO Integration Example

```javascript
const axios = require('axios');
const io = require('socket.io-client');

class CUZBSIClient {
  constructor(baseUrl = 'http://localhost:5543') {
    this.baseUrl = baseUrl;
    this.token = null;
    this.socket = null;
  }

  async login(email, password) {
    const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
      email, password
    });
    
    this.token = response.data.data.accessToken;
    return response.data;
  }

  connectSocket() {
    this.socket = io(this.baseUrl, {
      auth: { token: this.token }
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO:', this.socket.id);
    });

    // Sync events
    this.socket.on('sync_started', (data) => {
      console.log(`🚀 Sync Started: ${data.message}`);
      console.log(`   Sync ID: ${data.syncId}`);
    });

    this.socket.on('sync_progress', (data) => {
      console.log(`⏳ ${data.message}`);
    });

    this.socket.on('sync_completed', (data) => {
      console.log(`✅ Completed: ${data.message}`);
    });

    this.socket.on('sync_error', (data) => {
      console.log(`❌ Error: ${data.message}`);
    });

    // Batch sync events
    this.socket.on('batch_sync_started', (data) => {
      console.log(`🎯 Batch Started: ${data.message}`);
    });

    this.socket.on('batch_sync_progress', (data) => {
      if (data.progress) {
        console.log(`📊 Progress (${data.progress.percentage}%): ${data.message}`);
      } else {
        console.log(`⏳ ${data.message}`);
      }
    });

    this.socket.on('batch_sync_completed', (data) => {
      console.log(`🎉 Batch Completed: ${data.message}`);
    });

    return this.socket;
  }

  async syncAccount(accountId, startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `${this.baseUrl}/api/bsi/accounts/${accountId}/sync${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await axios.post(url, {}, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    return response.data;
  }

  async syncAllAccounts(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `${this.baseUrl}/api/bsi/accounts/sync-all${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await axios.post(url, {}, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    return response.data;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Usage Example
async function example() {
  const client = new CUZBSIClient();
  
  // Login
  await client.login('admin@multimutasi.com', 'admin123');
  
  // Connect to Socket.IO for real-time updates
  client.connectSocket();
  
  // Start sync with real-time monitoring
  const syncResponse = await client.syncAccount(4);
  console.log('Sync started:', syncResponse.data.syncId);
  
  // The real-time events will be logged as the sync progresses
}

// Run example
example().catch(console.error);
```

---

## Rate Limiting & Best Practices

### Request Headers
Always include the JWT token in requests:
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

### Date Formats
- API dates: ISO 8601 format (`2025-08-27T09:04:01.536Z`)
- BSI sync dates: DD/MM/YYYY format (`27/08/2025`)

### Socket.IO Best Practices
1. Always handle connection/disconnection events
2. Implement reconnection logic for production
3. Store syncId from API responses to track specific operations
4. Use proper error handling for socket events

### Pagination
All list endpoints support pagination:
- `page`: Page number (starts at 1)
- `limit`: Items per page (max 100)
- Response includes `pagination` object with total count and pages

This documentation covers all available endpoints in the CUZBSI REST API with complete request/response examples and Socket.IO integration guide.