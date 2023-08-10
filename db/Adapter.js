/**
 * @typedef {Object} IPSDataType
 * @property {string} ip
 * @property {number} port
 * @property {string} date
 * @property {boolean} first
 */

const { DBInterface } = require("../interface");

/**
 * @typedef {IPSDataType[]} IPSType
 */

/**
 * @typedef {Object} DataInterfaceType
 * @property {string} email
 * @property {number} allowedUsers
 * @property {IPSType} ips
 */

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
   * @returns {DataInterfaceType}
   */
  read(email) {
    this.database.read(email);
  }

  /**
   * @description Read all database data.
   * @returns {DataInterfaceType[]}
   */
  readAll() {
    this.database.readAll();
  }

  /**
   * @description Delete a user from the database
   * @param {string} email User email
   * @returns {void}
   */
  deleteUser(email) {
    this.database.deleteUser(email);
  }

  /**
   * @description Delete a ip from the user field
   * @param {string} email User email
   * @param {string} ip User ip
   * @returns {void}
   */
  deleteIp(email, ip) {
    this.database.deleteIp(email, ip);
  }

  /**
   * @description Add a user to database
   * @param {DataInterfaceType} data
   * @returns {void}
   */
  addUser(data) {
    this.database.addUser(data);
  }

  /**
   * @description Add a ip from the user field
   * @param {string} email User email
   * @param {IPSDataType} ip ip data
   * @returns {void}
   */
  addIp(email, ip) {
    this.database.addIp(email, ip);
  }
}

module.exports = { DBAdapter };
