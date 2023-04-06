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

// create dummy user data
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
