import { jest } from "@jest/globals";
import bcrypt from "bcrypt";

import cardService from "../../src/services/cardService";
import companyService from "../../src/services/companyService";
import employeeService from "../../src/services/employeeService";
import cardRepository from "../../src/repositories/cardRepository";
import dayjs from "dayjs";

describe("Card service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

      const mockedInsert = jest
        .spyOn(cardRepository, "insert")
        .mockImplementation(async () => {});

      await cardService.create("anyone", 2, "education");

      expect(mockedInsert).toBeCalledTimes(1);
    });

    it("should throw 'conflict', given a card with existent type and employee", async () => {
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

      jest.spyOn(cardRepository, "findByTypeAndEmployeeId").mockResolvedValue({
        cardholderName: "FAKE",
        employeeId: 20,
        expirationDate: "05/27",
        id: 4,
        isBlocked: false,
        isVirtual: false,
        number: "FAKE",
        securityCode: "FAKE",
        type: "restaurant",
      });

      const mockedInsert = jest
        .spyOn(cardRepository, "insert")
        .mockImplementation(async () => {});

      let thrownError: object = undefined;

      try {
        await cardService.create("anyone", 2, "education");
      } catch (error) {
        thrownError = error;
      }

      expect(mockedInsert).toBeCalledTimes(0);
      expect(thrownError).toEqual({ type: "conflict" });
    });
  });

  describe("Card activation", () => {
    it("should make activation, given an existent card, the right cvc and a valid password", async () => {
      jest.spyOn(cardRepository, "findById").mockResolvedValue({
        id: 4,
        cardholderName: "FAKE",
        employeeId: 3,
        expirationDate: dayjs().add(5, "year").format("MM/YY"),
        isBlocked: false,
        isVirtual: false,
        number: "FAKE",
        securityCode: "719",
        type: "health",
      });

      jest.spyOn(bcrypt, "compareSync").mockReturnValue(true);

      jest.spyOn(bcrypt, "hashSync").mockReturnValue("hashedPassword");

      const mockedUpdate = jest
        .spyOn(cardRepository, "update")
        .mockImplementation(async () => {});

      await cardService.activate(4, "719", "2222");

      expect(mockedUpdate).toBeCalledTimes(1);
    });

    it("should throw 'bad_request', given a card already with password", async () => {
      jest.spyOn(cardRepository, "findById").mockResolvedValue({
        id: 4,
        cardholderName: "FAKE",
        employeeId: 3,
        expirationDate: dayjs().add(5, "year").format("MM/YY"),
        isBlocked: false,
        isVirtual: false,
        number: "FAKE",
        securityCode: "719",
        type: "health",
        password: "EXISTENT",
      });

      jest.spyOn(bcrypt, "compareSync").mockReturnValue(true);

      jest.spyOn(bcrypt, "hashSync").mockReturnValue("hashedPassword");

      const mockedUpdate = jest
        .spyOn(cardRepository, "update")
        .mockImplementation(async () => {});

      let thrownError: object = undefined;
      try {
        await cardService.activate(4, "719", "2222");
      } catch (error) {
        thrownError = error;
      }

      expect(mockedUpdate).toBeCalledTimes(0);
      expect(thrownError).toEqual({ type: "bad_request" });
    });

    it("should throw 'bad_request', given an invalid password", async () => {
      jest.spyOn(cardRepository, "findById").mockResolvedValue({
        id: 4,
        cardholderName: "FAKE",
        employeeId: 3,
        expirationDate: dayjs().add(5, "year").format("MM/YY"),
        isBlocked: false,
        isVirtual: false,
        number: "FAKE",
        securityCode: "719",
        type: "health",
      });

      jest.spyOn(bcrypt, "compareSync").mockReturnValue(true);

      jest.spyOn(bcrypt, "hashSync").mockReturnValue("hashedPassword");

      const mockedUpdate = jest
        .spyOn(cardRepository, "update")
        .mockImplementation(async () => {});

      let thrownError: object = undefined;
      try {
        await cardService.activate(4, "719", "22a2");
      } catch (error) {
        thrownError = error;
      }

      expect(mockedUpdate).toBeCalledTimes(0);
      expect(thrownError).toEqual({ type: "bad_request" });
    });

    it("should throw 'unauthorized', given an invalid cvc", async () => {
      jest.spyOn(cardRepository, "findById").mockResolvedValue({
        id: 4,
        cardholderName: "FAKE",
        employeeId: 3,
        expirationDate: dayjs().add(5, "year").format("MM/YY"),
        isBlocked: false,
        isVirtual: false,
        number: "FAKE",
        securityCode: "719",
        type: "health",
      });

      jest.spyOn(bcrypt, "compareSync").mockReturnValue(false);

      jest.spyOn(bcrypt, "hashSync").mockReturnValue("hashedPassword");

      const mockedUpdate = jest
        .spyOn(cardRepository, "update")
        .mockImplementation(async () => {});

      let thrownError: object = undefined;
      try {
        await cardService.activate(4, "720", "22a2");
      } catch (error) {
        thrownError = error;
      }

      expect(mockedUpdate).toBeCalledTimes(0);
      expect(thrownError).toEqual({ type: "unauthorized" });
    });
  });

  describe("Password validation", () => {
    it("should only execute for a valid password", () => {
      jest.spyOn(bcrypt, "compareSync").mockReturnValueOnce(true);

      let thrownError: object = undefined;

      try {
        cardService.validatePasswordOrFail("", "");
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toEqual(undefined);
    });

    it("should throw 'unauthorized' for an invalid password", () => {
      jest.spyOn(bcrypt, "compareSync").mockReturnValueOnce(false);

      let thrownError: object = undefined;

      try {
        cardService.validatePasswordOrFail("", "");
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toEqual({ type: "unauthorized" });
    });
  });
});
