const { DBInterface } = require("../interface");
const { IPGuard } = require("../utils");

class DBAdapter {
  /**
   * @type {DataInterfaceType}
   */
  DataInterface = {};

  /**
   * @param {DBInterface} database
   */
  constructor(database) {
    this.database = database;
    this.DataInterface = database.DataInterface;
  }

  /**
   * @description Read the user from the database
   * @param {string} email User email
   * @returns {DataInterfaceType | Promise<DataInterfaceType>}
   */
  read(email) {
    return this.database.read(email);
  }

  /**
   * @description Read all database data.
   * @returns {DataInterfaceType[]}
   */
  readAll() {
    return this.database.readAll();
  }

  /**
   * @description Delete a user from the database
   * @param {string} email User email
   * @returns {void}
   */
  deleteUser(email) {
    return this.database.deleteUser(email);
  }

  /**
   * @description Delete a ip from the user field
   * @param {string} email User email
   * @param {string} cid websocket connection id
   * @returns {void}
   */
  deleteIp(email, cid) {
    return this.database.deleteIp(email, cid);
  }

  /**
   * @description Add a user to database
   * @param {DataInterfaceType} data
   * @returns {void}
   */
  addUser(data) {
    return this.database.addUser(data);
  }

  /**
   * @description Add a ip from the user field
   * @param {string} email User email
   * @param {IPSDataType} ip ip data
   * @returns {void}
   */
  addIp(email, ip) {
    return this.database.addIp(email, ip);
  }
}

module.exports = { DBAdapter };
