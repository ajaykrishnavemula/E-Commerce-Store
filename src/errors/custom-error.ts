import { StatusCodes } from 'http-status-codes';

class CustomAPIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class UnauthenticatedError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class NotFoundError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class ForbiddenError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class ConflictError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT);
  }
}

export class TooManyRequestsError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
  }
}

export class InternalServerError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export class PaymentRequiredError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.PAYMENT_REQUIRED);
  }
}

export class ServiceUnavailableError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.SERVICE_UNAVAILABLE);
  }
}

export default CustomAPIError;

