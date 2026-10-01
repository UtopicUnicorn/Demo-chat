import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";

import { errorMiddleware } from "./errorMiddleware.js";
import { HttpError } from "./httpError.js";

function createResponse(headersSent = false) {
  const response = {
    headersSent,
    json: jest.fn(),
    status: jest.fn()
  };

  response.status.mockReturnValue(response);

  return response as unknown as Response & {
    json: jest.Mock;
    status: jest.Mock;
  };
}

function createNext() {
  return jest.fn();
}

function asNextFunction(next: ReturnType<typeof createNext>) {
  return next as unknown as NextFunction;
}

describe("errorMiddleware", () => {
  it("serializes HttpError responses", () => {
    const response = createResponse();
    const next = createNext();

    errorMiddleware(new HttpError(404, "Not found"), {} as Request, response, asNextFunction(next));

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        message: "Not found"
      }
    });
  });

  it("serializes unknown errors as internal server errors", () => {
    const response = createResponse();
    const next = createNext();

    errorMiddleware(new Error("Unexpected"), {} as Request, response, asNextFunction(next));

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        message: "Internal server error"
      }
    });
  });

  it("delegates when response headers are already sent", () => {
    const response = createResponse(true);
    const next = createNext();
    const error = new Error("Late failure");

    errorMiddleware(error, {} as Request, response, asNextFunction(next));

    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });
});
