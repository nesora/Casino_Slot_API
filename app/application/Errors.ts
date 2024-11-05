import { CustomError } from "../infrastructure/CustomErrors";

const Errors: { [ClassName: string]: any } = {};

class InsufficientBalanceError extends CustomError {
  constructor() {
    super(`User doesn't have sufficient balance.`);
  }
}

class UserTryToWithdrawAboveBalanceError extends CustomError {
  constructor() {
    super(`User tries to withdraw more money than he have in balance !`);
  }
}

class RetrievingRTPError extends CustomError {
  constructor() {
    super(`An error occurred while retrieving RTP. !`);
  }
}

class InternalServerError extends CustomError {
  constructor() {
    super(`The server was unable to complete your request. Please try again later.`);
  }
}

Errors.InsufficientBalanceError = InsufficientBalanceError;
Errors.UserTryToWithdrawAboveBalanceError = UserTryToWithdrawAboveBalanceError;
Errors.RetrievingRTPError = RetrievingRTPError;
Errors.InternalServerError = InternalServerError;

export default (): typeof Errors => Errors;
export { InsufficientBalanceError, UserTryToWithdrawAboveBalanceError, RetrievingRTPError, InternalServerError };
