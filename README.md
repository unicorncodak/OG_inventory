# OG_inventory

## Available endpoints

 - /users/ (GET)
 
  ```
    [
        {
            "_id": "5e8b30419a5bcf01a0622c64",
            "fullName": "Abdulqudus",
            "ogId": "191852",
            "campaign": "Software",
            "role": "admin",
            "phone": 9031669392,
            "email": "abdulqudus@gmail.com",
            "password": "$2a$10$AVPHTW2XVIImczRtQqomQeLuceWsZ5YRXu.jzOhXEv7GQxnRiIbLm",
            "__v": 0
        }
    ]
  ```
  
 - /users/register (POST)
 
    ```
      body {
        "fullName": "Users full name",
        "ogId": "191852",
        "campaign": "Software",
        "role": "admin/user/employee",
        "phone": 9031669392,
        "email": "users email adress",
        "password": "users password"
      }
    ```
 - /users/login (POST)
 
  ```
    body {
      "email": "users email adress",
      "password": "users password"
    }
  ```
 
 - /users/:userId (POST)
 
  ```
    body {
      "email": "new email adress",
      "username": "new username"
    }
  ```
  
  - /users/:userId (DELETE)
 
  ```
    
  ```
