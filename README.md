# OG_inventory

## Available endpoints

 - /users/register
 
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
 - /users/login
 
  ```
    body {
      "email": "users email adress",
      "password": "users password"
    }
  ```
