class ErrorHelper extends Error {
  constructor(status, ...args) {
    super(args);
    this.status = status;
  }
}

export default ErrorHelper;
