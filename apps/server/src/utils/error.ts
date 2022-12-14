import type { NextFunction } from "express";
import { Prisma } from "@qw/db";

export class AppError extends Error {
  private readonly statusCode: number;

  constructor(errorType: keyof typeof ErrorType, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = ErrorType[errorType];
    console.error({ errorType, message });
  }

  get StatusCode() {
    return this.statusCode;
  }

  get JSON(): ErrorResponse {
    return {
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

export const handleControllerError = (e: any, next: NextFunction) => {
  console.log("controllerError:", e);

  if (e instanceof AppError) {
    return next(e);
  }

  if (e instanceof Prisma.PrismaClientUnknownRequestError) {
    const error = new AppError("BadRequestException", "Unknown Request Error");
    return next(error);
  }

  if (e instanceof Prisma.PrismaClientValidationError) {
    const error = new AppError("BadRequestException", "Validation Error");
    return next(error);
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    const error = new AppError("BadRequestException", "Known Request Error");
    return next(error);
  }

  if (e instanceof Prisma.PrismaClientRustPanicError) {
    const error = new AppError("BadRequestException", "Rust Panic Error");
    return next(error);
  }

  if (e instanceof Prisma.PrismaClientInitializationError) {
    const error = new AppError("BadRequestException", "Initialization Error");
    return next(error);
  }
};

export const ErrorType = {
  BadRequestException: 400,
  UnauthorizedException: 401,
  NotFoundException: 404,
  ForbiddenException: 403,
  NotAcceptableException: 406,
  RequestTimeoutException: 408,
  ConflictException: 409,
  GoneException: 410,
  HttpVersionNotSupportedException: 505,
  PayloadTooLargeException: 413,
  UnsupportedMediaTypeException: 415,
  UnprocessableEntityException: 422,
  InternalServerErrorException: 500,
  NotImplementedException: 501,
  ImATeapotException: 418,
  MethodNotAllowedException: 405,
  BadGatewayException: 502,
  ServiceUnavailableException: 503,
  GatewayTimeoutException: 504,
  PreconditionFailedException: 412,
};

export interface ErrorResponse {
  statusCode: number;
  message: string;
}

export const SuccessType = {
  OK: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  IMUsed: 226,
};
