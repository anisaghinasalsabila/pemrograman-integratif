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

##<ol>
  <li>Proto file</li>
</ol>

``syntax = "proto3";

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


``
