interface APIError {
  status: number;
  code: number;
  message: string;
  [additionalFieldKey: string]: unknown;
}

const APIErrors = {
  INSUFFICIENT_BALANCE: {
    status: 403,
    code: 1,
    message: "User dont have insufficient balance !",
  },
  INVALID_PARAMETERS: {
    status: 400,
    code: 2,
    message: "Mandatory parameters not provided, of incorrect type or invalid.",
  },
  INVALID_RETRIEVING_RTP: {
    status: 400,
    code: 3,
    message: "An error occurred while retrieving RTP.",
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 3,
    message: "The server was unable to complete your request. Please try again later.",
  },

};

export default (): typeof APIErrors => APIErrors;
export { APIErrors, APIError };
