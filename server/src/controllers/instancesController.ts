import type { RequestHandler } from "express";

import { HttpError } from "../http/httpError.js";
import { readRouteParam } from "../http/validate.js";
import type { MemoryStore } from "../store/memoryStore.js";

export function createInstancesController(store: MemoryStore) {
  const listInstances: RequestHandler = (_request, response) => {
    response.json({
      data: store.listInstances()
    });
  };

  const getInstance: RequestHandler = (request, response, next) => {
    try {
      const instanceId = readRouteParam(request.params.instanceId, "instanceId");
      const instance = store.getInstance(instanceId);

      if (!instance) {
        throw new HttpError(404, "Instance not found");
      }

      response.json({
        data: instance
      });
    } catch (error) {
      next(error);
    }
  };

  return {
    getInstance,
    listInstances
  };
}
