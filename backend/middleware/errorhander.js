class ErrorHandler extends Error {
  constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode
      Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = ErrorHandler

// class ErrorHandler extends Error {
//     /**
//      * Create a custom error object.
//      * @param {string} message - The error message.
//      * @param {number} statusCode - The HTTP status code to associate with the error.
//      */
//     constructor(message, statusCode) {
//       super(message);
//       this.statusCode = statusCode;
//       Error.captureStackTrace(this, this.constructor);
//     }
//   }
  
//   module.exports = ErrorHandler;
  