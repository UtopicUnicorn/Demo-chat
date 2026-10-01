import type { ErrorRequestHandler } from "express";

import { HttpError } from "./httpError.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message
      }
    });
    return;
  }

  response.status(500).json({
    error: {
      message: "Internal server error"
    }
  });
};
