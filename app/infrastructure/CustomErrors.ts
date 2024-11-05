class CustomError extends Error {
    constructor(message: string) {
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
    }
  }
  
  export default (): typeof CustomError => CustomError;
  export { CustomError };
  