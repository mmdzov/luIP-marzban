// Globally

/**
 * @typedef {Object} IPSDataType
 * @property {string} ip
 * @property {number} port
 * @property {string} date
 * @property {boolean} first
 */

/**
 * @typedef {IPSDataType[]} IPSType
 */

/**
 * @typedef {Object} DataInterfaceType
 * @property {string} email
 * @property {number} allowedUsers
 * @property {IPSType} ips
 */

/**
 * @typedef {object} WebSocketConfigType
 * @property {string} url
 * @property {string} accessToken
 * @property {object} DB
 * @property {string} node
 * @property {Object} api
 * @property {import("./config").Socket} socket
 */

/**
 * @typedef {Object} NewUserIpType
 * @property {string} ip
 * @property {string} port
 * @property {string} email
 */

/**
 * @typedef {Object} BanIpConfigAddType
 * @property {string} ip
 */

// API

/**
 * @typedef {Object} ApiSetTokenType
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {"INVALID" | "NOT_MATCH" | "AUTH" | "DUPLICATE" | "NOT_FOUND"} ApiErrorTypes
 */

/**
 * @typedef {Object} ApiResponseErrorType
 * @property {ApiErrorTypes} type
 * @property {string} reason
 */

/**
 * @typedef {Object} ApiResponseType
 * @property {Object | null} data
 * @property {ApiResponseErrorType} error
 * @property {0|1} status
 */

/**
 * @typedef {Object} IpGuardType
 * @property {*} banDB
 * @property {import("./config").Socket} socket
 * @property {import("./config").Api} api
 * @property {import("./db/Adapter").DBAdapter} db
 */
