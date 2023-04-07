# Implementasi gRPC API dan Protobuf di Node JS

## Prasyarat
Membutuhkan pengetahuan dasar tentang:
<ul>
  <li>Node JS</li>
  <li>Firebase</li>
</ul>

## Persiapan
Pastikan sudah terinstalasi: 
<ul>
  <li>Node JS</li>
  <li>NPM/Yarn (package manager)</li>
</ul>

## Susunan dasar pemrograman gRPC 
<ol>
  <li> Proto file </li>
  Proto file adalah file yang berisi definisi service dan message pada gRPC. File ini menggunakan bahasa protobuf (Protocol Buffers) yang digunakan untuk mendefinisikan data
  <li> Server-side code </li>
  Server-side code adalah kode program yang digunakan untuk membuat dan menjalankan gRPC server, serta menangani permintaan yang dikirimkan dari klien.
  <li> Client-side code </li>
  Client-side code adalah kode program yang digunakan untuk membuat dan menjalankan gRPC klien, serta mengirimkan permintaan ke gRPC server.
</ol>

## 1. Proto file

``` 
syntax = "proto3";

package login;

service LoginService {
  rpc AddUser (AddUserRequest) returns (User) {}
  rpc GetAllUsers (Empty) returns (UserList) {}
  rpc GetUser (GetUserRequest) returns (User) {}
  rpc UpdateUser (UpdateUserRequest) returns (User) {}
  rpc DeleteUser (DeleteUserRequest) returns (User) {}
}

message User {
  string id = 1;
  string name = 2;
  string password = 3;
}

message AddUserRequest {
  User user = 1;
}
  
message Empty {}

message GetUserRequest {
  string id = 1;
}

message UpdateUserRequest {
  User user = 1;
}

message DeleteUserRequest {
  string id = 1;
}

message UserList {
repeated User users = 1;
}

 ```
 ## 2. Server-side code
 ```
 import {
  Server,
  loadPackageDefinition,
  ServerCredentials,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

// Import Firebase Admin libraries
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// Initialize Firebase app with service account config
const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
};
admin.initializeApp(firebaseConfig);

// Initialize Firestore
const db = admin.firestore();

const server = new Server();

const packageDefinition = loadSync("./formlogin.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const login = loadPackageDefinition(packageDefinition).login;

const addUser = async (call, callback) => {
  const user = call.request.user;
  const userRef = db.collection("users").doc(user.id);
  try {
    await userRef.set(user);
    const docSnapshot = await userRef.get();
    const data = docSnapshot.data();
    const response = {
      id: data.id,
      name: data.name,
      password: data.password,
    };
    callback(null, response);
  } catch (error) {
    console.log("Error adding user: ", error);
    callback(error);
  }
};

const getUser = async (call, callback) => {
  const id = call.request.id;
  const userRef = db.collection("users").doc(id);
  try {
    const docSnapshot = await userRef.get();
    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const response = {
        id: data.id,
        name: data.name,
        password: data.password,
      };
      callback(null, response);
    } else {
      const error = new Error(`User with id ${id} not found`);
      callback(error);
    }
  } catch (error) {
    console.log("Error getting user: ", error);
    callback(error);
  }
};

const getAllUsers = async (call, callback) => {
  const usersRef = db.collection("users");
  try {
    const querySnapshot = await usersRef.get();
    const users = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const user = {
        id: doc.id, 
        name: data.name,
        password: data.password,
      };
      users.push(user);
    });
    callback(null, { users: users });
  } catch (error) {
    console.log("Error getting all users: ", error);
    callback(error);
  }
};

const updateUser = async (call, callback) => {
  const user = call.request.user;
  const userRef = db.collection("users").doc(user.id);
  try {
    await userRef.update(user);
    const response = {
      id: user.id,
      name: user.name,
      password: user.password,
    };
    callback(null, response);
  } catch (error) {
    console.log("Error updating user: ", error);
    callback(error);
  }
};

const deleteUser = async (call, callback) => {
  const id = call.request.id;
  const userRef = db.collection("users").doc(id);
  try {
    const docSnapshot = await userRef.get();
    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      await userRef.delete();
      const response = {
        id: data.id,
        name: data.name,
        password: data.password,
      };
      callback(null, response);
    }
  } catch (error) {
    console.log("Error deleting user: ", error);
    callback(error);
  }
};

server.addService(login.LoginService.service, {
  addUser: addUser,
  getUser: getUser,
  updateUser: updateUser,
  deleteUser: deleteUser,
  GetAllUsers: getAllUsers,
});

server.bindAsync("localhost:50051", ServerCredentials.createInsecure(), () => {
  console.log("Server running at http://localhost:50051");
  server.start();
});

 ```
## 3. Client-side code
```
import { loadPackageDefinition, credentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

const packageDefinition = loadSync("./formlogin.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const login = loadPackageDefinition(packageDefinition).login;

import { createInterface } from "readline";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});


const dummyUser = {
  id: "123",
  name: "Dummy User",
  password: "Dummy password",
};



const addUser = () => {
  readline.question("Enter user ID: ", (id) => {
    readline.question("Enter user name: ", (name) => {
      readline.question("Enter user password: ", (password) => {
        const user = {
          id: id,
          name: name,
          password: password,
        };
        client.AddUser({ user: user }, (err, response) => {
          console.log("User added successfully: ", response);
          readline.close();
        });
      });
    });
  });
};

const getUser = () => {
  readline.question("Enter User ID: ", (id) => {
    client.GetUser({ id: id }, (err, response) => {
      console.log("User retrieved successfully: ", response);
      readline.close();
    });
  });
};

const updateUser = () => {
  readline.question("Enter user ID: ", (id) => {
    readline.question("Enter updated user name: ", (name) => {
      readline.question("Enter updated user password: ", (password) => {
        const user = {
          id: id,
          name: name,
          password: password,
        };
        client.UpdateUser({ user: user }, (err, response) => {
          console.log("User updated successfully: ", response);
          readline.close();
        });
      });
    });
  });
};

const deleteUser = () => {
  readline.question("Enter user ID: ", (id) => {
    client.DeleteUser({ id: id }, (err, response) => {
      console.log("User deleted successfully: ", response);
      readline.close();
    });
  });
};
const getAllUsers = () => {
  client.getAllUsers({}, (err, response) => {
    if (err) {
      console.error("Error getting all users: ", err);
      return;
    }
    console.log("All users retrieved successfully: ", response.users);
    readline.close();
  });
};

const main = () => {
  readline.question(
    "welcome to the login form, please choose: add, get, update, delete, getAll: ",
    (operation) => {
      switch (operation) {
        case "add":
          addUser();
          break;
        case "get":
          getUser();
          break;
        case "update":
          updateUser();
          break;
        case "delete":
          deleteUser();
          break;
        case "getAll":
          getAllUsers();
          break;
        default:
          console.log("Invalid operation");
          readline.close();
          break;
      }
    }
  );
};

const client = new login.LoginService(
  "localhost:50051",
  credentials.createInsecure()
);

main();

```
## Tes Fungsi CRUD

1. Jalankan server dengan perintah node server.js  ![Screenshot 2023-04-07 134228](https://user-images.githubusercontent.com/71119774/230563830-0f0e0fac-5bb9-40f2-aee0-84b0a655e546.png)

2. Jalankan client dengan perintah node client.js, akan terlihat tampilan command-line interface (CLI) untuk melakukan Add, Get, Update, Delete, dan GetAll data 
![Screenshot 2023-04-07 134525](https://user-images.githubusercontent.com/71119774/230564021-5f6df049-8cb3-4c61-a332-36daaca317f5.png)

3. Add  ![Screenshot 2023-04-07 135039](https://user-images.githubusercontent.com/71119774/230564073-9d64e0e9-1480-4bca-8d98-7d8ccdee16d6.png)

Tampilan firebase : ![Screenshot 2023-04-07 135240](https://user-images.githubusercontent.com/71119774/230564144-002097a4-82c9-4a37-9dea-5bfc49d76a7d.png)

4. Get ![Screenshot 2023-04-07 140250](https://user-images.githubusercontent.com/71119774/230564242-93f53cc5-6ddf-469d-9e8a-17e69ee0b002.png)

5. Update  ![Screenshot 2023-04-07 140819](https://user-images.githubusercontent.com/71119774/230564303-f8e337ab-446e-40a6-b67f-8646b2963334.png)

Tampilan firebase : ![Screenshot 2023-04-07 141100](https://user-images.githubusercontent.com/71119774/230564844-384eeded-4b54-4f6d-b702-7439663f5a1d.png)

6. Delete  ![Screenshot 2023-04-07 141242](https://user-images.githubusercontent.com/71119774/230564490-7be90e73-6c31-4f15-b049-70613d36c9fa.png)
Tampilan firebase: ![Screenshot 2023-04-07 141841](https://user-images.githubusercontent.com/71119774/230564523-15553372-c7e3-422e-8a67-20d358756716.png)

7. GetAll ![Screenshot 2023-04-07 142001](https://user-images.githubusercontent.com/71119774/230564573-675b2c2e-4e7d-45e6-b58b-d51868502115.png)
