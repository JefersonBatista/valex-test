import { jest } from "@jest/globals";
import { faker } from "@faker-js/faker";

import cardService from "../../src/services/cardService";
import companyService from "../../src/services/companyService";
import employeeService from "../../src/services/employeeService";
import cardRepository from "../../src/repositories/cardRepository";

describe("Card service", () => {
  describe("Card creation", () => {
    it("should create a card, given a valid one", async () => {
      jest
        .spyOn(companyService, "validateApiKeyOrFail")
        .mockImplementation(async (apiKey) => {});

      jest.spyOn(employeeService, "getById").mockResolvedValue({
        id: 2,
        fullName: "Ciclana Maria Madeira",
        cpf: "08434681895",
        companyId: 1,
        email: "ciclaninha@gmail.com",
      });

      jest
        .spyOn(cardRepository, "findByTypeAndEmployeeId")
        .mockResolvedValue(null);

      const mockedInsert = jest.spyOn(cardRepository, "insert");

      await cardService.create("anyone", 2, "education");

      expect(mockedInsert).toBeCalledTimes(1);
    });
  });
});
