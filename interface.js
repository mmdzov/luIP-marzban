class DBInterface {
  read(email) {
    throw new Error("This method must be implemented in the class");
  }

  readAll() {
    throw new Error("This method must be implemented in the class");
  }

  deleteUser(email) {
    throw new Error("This method must be implemented in the class");
  }

  deleteIp(email, ip) {
    throw new Error("This method must be implemented in the class");
  }

  addUser(data) {
    throw new Error("This method must be implemented in the class");
  }

  addIp(email, ip) {
    throw new Error("This method must be implemented in the class");
  }
}

module.exports = { DBInterface };
