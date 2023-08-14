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

  deleteInactiveUsers() {
    throw new Error("This method must be implemented in the class");
  }

  deleteLastIp(email) {
    throw new Error("This method must be implemented in the class");
  }
}

class LuIPInterface {
  ban() {
    throw new Error("This method must be implemented in the class");
  }

  unban() {
    throw new Error("This method must be implemented in the class");
  }

  setUser() {
    throw new Error("This method must be implemented in the class");
  }

  unsetUser() {
    throw new Error("This method must be implemented in the class");
  }

  clear() {
    throw new Error("This method must be implemented in the class");
  }
}

module.exports = { DBInterface, LuIPInterface };
