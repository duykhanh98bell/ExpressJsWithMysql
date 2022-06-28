function AppError({ message,code }) {
    Error.captureStackTrace(this,AppError);

    this.name = 'CustomError'; // String
    this.message = message; // String
    this.code = code; // String
}

AppError.prototype = Object.create(Error.prototype);

export default AppError;