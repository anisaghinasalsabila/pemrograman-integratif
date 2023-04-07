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

1. Jalankan server dengan perintah node server.js : ![Screenshot_2023-04-07_134228](/uploads/2016e04b8c2067553e73eef0148233d0/Screenshot_2023-04-07_134228.png)

2. Jalankan client dengan perintah node client.js, akan terlihat tampilan command-line interface (CLI) untuk melakukan Add, Get, Update, Delete, dan GetAll data: ![Screenshot_2023-04-07_134525](/uploads/d444151cc896721b6a4b8254fbc70f23/Screenshot_2023-04-07_134525.png)

3. AdD : ![Screenshot_2023-04-07_135039](/uploads/7ca582c3d9c2cde2ca7a508a3c8932a5/Screenshot_2023-04-07_135039.png)

Tampilan firebase : ![Screenshot_2023-04-07_135240](/uploads/7c28e7f40900a893cf11261a64dfdb6c/Screenshot_2023-04-07_135240.png)

4. Get: ![Screenshot_2023-04-07_140250](/uploads/6cfa58b7fe513fb8165e634bfd3546cc/Screenshot_2023-04-07_140250.png)

5. Update :![Screenshot_2023-04-07_140819](/uploads/7ab06eaff41aa770493a263a7cd6bc8e/Screenshot_2023-04-07_140819.png)

Tampilan firebase : ![Screenshot_2023-04-07_141100](/uploads/36ef96d2bfae339775bd725c557cfa9d/Screenshot_2023-04-07_141100.png)

6. Delete : ![Screenshot_2023-04-07_141242](/uploads/39719429f9335146a298932b5555c972/Screenshot_2023-04-07_141242.png)
Tampilan firebase: ![Screenshot_2023-04-07_141841](/uploads/4483eecefc1a3a82614b2c63bcbeaff8/Screenshot_2023-04-07_141841.png)

7. GetAll: ![Screenshot_2023-04-07_142001](/uploads/0b11a45243a660d7cd29f5c195f2560c/Screenshot_2023-04-07_142001.png)
