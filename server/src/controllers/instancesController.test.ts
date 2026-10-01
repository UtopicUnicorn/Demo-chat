import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";

import { createInstancesController } from "./instancesController.js";
import { HttpError } from "../http/httpError.js";
import { MemoryStore } from "../store/memoryStore.js";

function createResponse() {
  return {
    json: jest.fn()
  } as unknown as Response & {
    json: jest.Mock;
  };
}

function createNext() {
  return jest.fn();
}

function asNextFunction(next: ReturnType<typeof createNext>) {
  return next as unknown as NextFunction;
}

describe("createInstancesController", () => {
  it("lists messenger instances", () => {
    const controller = createInstancesController(new MemoryStore());
    const response = createResponse();
    const next = createNext();

    controller.listInstances({} as Request, response, asNextFunction(next));

    expect(next).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ id: "max-main", type: "max" }),
        expect.objectContaining({ id: "telegram-main", type: "telegram" }),
        expect.objectContaining({ id: "whatsapp-main", type: "whatsapp" })
      ])
    });
  });

  it("gets one messenger instance", () => {
    const controller = createInstancesController(new MemoryStore());
    const response = createResponse();
    const next = createNext();

    controller.getInstance(
      {
        params: {
          instanceId: "max-main"
        }
      } as unknown as Request,
      response,
      asNextFunction(next)
    );

    expect(next).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "max-main",
        type: "max"
      })
    });
  });

  it("passes unknown instance errors to next middleware", () => {
    const controller = createInstancesController(new MemoryStore());
    const response = createResponse();
    const next = createNext();

    controller.getInstance(
      {
        params: {
          instanceId: "unknown-instance"
        }
      } as unknown as Request,
      response,
      asNextFunction(next)
    );

    expect(response.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]).toEqual(expect.objectContaining({ statusCode: 404 }));
  });
});
