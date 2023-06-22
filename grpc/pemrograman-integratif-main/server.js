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
