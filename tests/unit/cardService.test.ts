import { jest } from "@jest/globals";

import * as companyService from "../../src/services/companyService";

describe("Card service", () => {
  describe("Card creation", () => {
    it("should create a card, given a valid one", () => {
      jest
        .spyOn(companyService, "validateApiKeyOrFail")
        .mockImplementation(async () => {});
    });
  });
});
