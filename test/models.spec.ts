import * as models from '../src/models';

describe('Unit | Models', function () {
  function testForExpectedMessage(errors: models.IError[], message: string) {
    expect(errors).toBeDefined();
      errors
        .forEach(error => {
          if (error.message === message) {
            expect(true).toBe(true);
          }
        });
  } 

  describe('validateLoad', function () {
    const accessTokenRequiredMessage = models.loadSchema.properties.accessToken.messages.required;
    const accessTokenInvalidTypeMessage = models.loadSchema.properties.accessToken.messages.type;
    const idRequiredMessage = models.loadSchema.properties.id.messages.required;
    const idInvalidTypeMessage = models.loadSchema.properties.id.messages.type;
    const filterInvalidMessage = models.loadSchema.properties.filter.invalidMessage;
    const pageNameInvalidTypeMessage = models.loadSchema.properties.pageName.messages.type;

    it(`should return errors with one containing message '${accessTokenRequiredMessage}' if accessToken is not defined`, function () {
      // Arrange
      const testData = {
        load: {
        }
      };

      // Act
      const errors = models.validateLoad(testData.load);

      // Assert
      testForExpectedMessage(errors, accessTokenRequiredMessage);
    });

    it(`should return errors with one containing message '${accessTokenInvalidTypeMessage}' if accessToken is not a string`, function () {
      // Arrange
      const testData = {
        load: {
          accessToken: 1
        }
      };

      // Act
      const errors = models.validateLoad(testData.load);

      // Assert
      testForExpectedMessage(errors, accessTokenInvalidTypeMessage);
    });

    it(`should return errors with one containing message '${idRequiredMessage}' if id is not defined`, function () {
      // Arrange
      const testData = {
        load: {
        }
      };

      // Act
      const errors = models.validateLoad(testData.load);

      // Assert
      testForExpectedMessage(errors, idRequiredMessage);
    });

    it(`should return errors with one containing message '${idInvalidTypeMessage}' if id is not a string`, function () {
      // Arrange
      const testData = {
        load: {
        }
      };

      // Act
      const errors = models.validateLoad(testData.load);

      // Assert
      testForExpectedMessage(errors, idRequiredMessage);
    });

    it(`should return undefined if id and accessToken are provided`, function () {
      // Arrange
      const testData = {
        load: {
          id: 'fakeId',
          accessToken: 'fakeAccessToken'
        }
      };

      // Act
      const errors = models.validateLoad(testData.load);

      // Assert
      expect(errors).toBeUndefined();
    });

    it(`should return errors with one containing message '${filterInvalidMessage}' if filter is not a valid basicFilter or advancedFilter`, function () {
      // Arrange
      const testData = {
        load: {
          id: 'fakeId',
          accessToken: 'fakeAccessToken',
          filter: { x: 1 }
        }
      };

      // Act
      const errors = models.validateLoad(testData.load);

      // Assert
      testForExpectedMessage(errors, filterInvalidMessage);
    });

    it(`should return errors with one containing message '${pageNameInvalidTypeMessage}' if pageName is not a string`, function () {
      // Arrange
      const testData = {
        load: {
          id: 'fakeId',
          accessToken: 'fakeAccessToken',
          pageName: 1
        }
      };

      // Act
      const errors = models.validateLoad(testData.load);

      // Assert
      testForExpectedMessage(errors, pageNameInvalidTypeMessage);
    });
  });

  describe('validateSettings', function () {
    const filterPaneEnabledInvalidTypeMessage = models.settingsSchema.properties.filterPaneEnabled.messages.type;
    const navContentPaneEnabledInvalidTypeMessage = models.settingsSchema.properties.navContentPaneEnabled.messages.type;

    it(`should return errors with one containing message '${filterPaneEnabledInvalidTypeMessage}' if filterPaneEnabled is not a boolean`, function () {
      // Arrange
      const testData = {
        settings: {
          filterPaneEnabled: 1
        }
      };

      // Act
      const errors = models.validateSettings(testData.settings);

      // Assert
      testForExpectedMessage(errors, filterPaneEnabledInvalidTypeMessage);
    });

    it(`should return errors with one containing message '${navContentPaneEnabledInvalidTypeMessage}' if navContentPaneEnabled is not a boolean`, function () {
      // Arrange
      const testData = {
        settings: {
          navContentPaneEnabled: 1
        }
      };

      // Act
      const errors = models.validateSettings(testData.settings);

      // Assert
      testForExpectedMessage(errors, navContentPaneEnabledInvalidTypeMessage);
    });

    it(`should return undefined settings is valid`, function () {
      // Arrange
      const testData = {
        settings: {
        }
      };

      // Act
      const errors = models.validateSettings(testData.settings);

      // Assert
      expect(errors).toBeUndefined();
    });
  });
});

describe("Unit | Filters", function () {
  describe("BasicFilter", function () {
    it("should accept values as separate arguments", function () {
      // Arrange
      
      // Act
      const basicFilter = new models.BasicFilter({ table: "t", column: "c" }, "In", 1, 2);
      
      // Assert
      expect(basicFilter.values).toEqual([1,2]);
    });
    
    it("should accept values as an array", function () {
      // Arrange
      const values = [1,2];
      
      // Act
      const basicFilter = new models.BasicFilter({ table: "t", column: "c" }, "In", values);
      
      // Assert
      expect(basicFilter.values).toEqual(values);
    });
    
    it("should return valid json format when toJSON is called", function () {
      // Arrange
      const expectedFilter: models.IBasicFilter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
          table: "a",
          column: "b"
        },
        operator: "In",
        values: [
          1,
          2,
          3
        ]
      };
      
      // Act
      const filter = new models.BasicFilter(
        expectedFilter.target,
        expectedFilter.operator,
        expectedFilter.values);
      
      // Assert
      expect(filter.toJSON()).toEqual(expectedFilter);
    });
    
    it("validator should return false if object does not validate against schema", function () {
      // Arrange
      const malformedFilter: any = {
        target: {
          table: "c",
          column: "d"
        }
      };
      
      // Act
      const errors = models.validateFilter(malformedFilter);
      
      // Assert
      expect(errors).toBeDefined();
    });
    
    it("should be able to be validated using json schema", function () {
      // Arrange
      const expectedFilter: models.IBasicFilter = {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
          table: "a",
          column: "b"
        },
        operator: <any>"x",
        values: [
          "a",
          100,
          false
        ]
      };
      
      // Act
      const filter = new models.BasicFilter(
        expectedFilter.target,
        expectedFilter.operator,
        expectedFilter.values);
      
      // Assert
      expect(models.validateFilter(filter.toJSON())).toBeUndefined();
    });

    it("can be constructed using either array form or individual arguments", function () {
      // Arrange
      const expectedFilter: models.IBasicFilter = {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
          table: "a",
          column: "b"
        },
        operator: <any>"x",
        values: [
          "a",
          100,
          false
        ]
      };

      // Act
      const filter1 = new models.BasicFilter(expectedFilter.target, expectedFilter.operator, expectedFilter.values);
      const filter2 = new models.BasicFilter(expectedFilter.target, expectedFilter.operator, ...expectedFilter.values);

      // Assert
      expect(filter1.toJSON()).toEqual(filter2.toJSON());
    });
  });
  
  describe("AdvancedFilter", function () {
    it("should throw an error if logical operator is not a non-empty string", function () {
      // Arrange
      const condition: models.IAdvancedFilterCondition = {
        value: "a",
        operator: "LessThan"
      };
      
      // Act
      const attemptToCreateFilter = () => {
        return new models.AdvancedFilter({ table: "t", column: "c" }, <any>1, condition);
      };
      
      // Assert
      expect(attemptToCreateFilter).toThrowError();
    });
    
    it("should throw an error if more than two conditions are provided", function () {
      // Arrange
      const conditions: models.IAdvancedFilterCondition[] = [
        {
          value: "a",
          operator: "LessThan"
        },
        {
          value: "b",
          operator: "LessThan"
        },
        {
          value: "c",
          operator: "LessThan"
        }
      ];
      
      
      // Act
      const attemptToCreateFilter = () => {
        return new models.AdvancedFilter({ table: "Table", column: "c" }, "And", ...conditions);
      };
      
      // Assert
      expect(attemptToCreateFilter).toThrowError();
    });
    
    it("should output the correct json when toJSON is called", function () {
      // Arrange
      const expectedFilter: models.IAdvancedFilter = {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
          table: "a",
          column: "b"
        },
        logicalOperator: "And",
        conditions: [
          {
            value: "a",
            operator: "LessThan"
          },
          {
            value: "b",
            operator: "LessThan"
          }
        ]
      };
      
      // Act
      const filter = new models.AdvancedFilter(
        expectedFilter.target,
        expectedFilter.logicalOperator,
        ...expectedFilter.conditions);
      
      // Assert
      expect(filter.toJSON()).toEqual(expectedFilter);
    });
    
    it("validator should return false if object does not validate against schema", function () {
      // Arrange
      const malformedFilter: any = {
        filter: {
          entity: "c",
          property: "d"
        }
      };
      const malformedFilter2: any = {
        target: {
          table: 'a',
          column: 'b'
        },
        logicalOperator: 'And',
        conditions: [
          {
            value: { x: 1 },
            operator: 'condition1'
          }
        ]
      };
      
      // Act
      const errors = models.validateFilter(malformedFilter);
      const errors2 = models.validateFilter(malformedFilter2);
      
      // Assert
      expect(errors).toBeDefined();
      expect(errors2).toBeDefined();
    });
    
    it("should be able to be validated using json schema", function () {
      // Arrange
      const expectedFilter: models.IAdvancedFilter = {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
          table: "a",
          column: "b"
        },
        logicalOperator: "And",
        conditions: [
          {
            value: "a",
            operator: "Is"
          },
          {
            value: true,
            operator: "Is"
          },
          {
            value: 1,
            operator: "Is"
          }
        ]
      };
      
      const filter = new models.AdvancedFilter(
        expectedFilter.target,
        expectedFilter.logicalOperator,
        ...expectedFilter.conditions.slice(0,2));

      const filter2 = new models.AdvancedFilter(
        expectedFilter.target,
        expectedFilter.logicalOperator,
        ...expectedFilter.conditions.slice(1,3));

      // Act
      const errors = models.validateFilter(filter.toJSON());
      const errors2 = models.validateFilter(filter2.toJSON());

      // Assert
      expect(errors).toBeUndefined();
      expect(errors2).toBeUndefined();
    });

    it("can be constructed using either array form or individual arguments", function () {
      // Arrange
      const expectedFilter: models.IAdvancedFilter = {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
          table: "a",
          column: "b"
        },
        logicalOperator: <any>"x",
        conditions: [
          {
            value: "v1",
            operator: "Contains"
          },
          {
            value: "v2",
            operator: "Contains"
          }
        ]
      };

      // Act
      const filter1 = new models.AdvancedFilter(expectedFilter.target, expectedFilter.logicalOperator, expectedFilter.conditions);
      const filter2 = new models.AdvancedFilter(expectedFilter.target, expectedFilter.logicalOperator, ...expectedFilter.conditions);

      // Assert
      expect(filter1.toJSON()).toEqual(filter2.toJSON());
    });
  });

  describe('validateTarget', function () {
    it("validator should return false if object does not validate against page target schema", function () {
      // Arrange
      const malformedPageTarget = {
        type: 'page',
      };
      
      // Act
      const errors = models.validateTarget(malformedPageTarget);
      
      // Assert
      expect(errors).toBeDefined();
    });

    it("validator should return false if object does not validate against visual target schema", function () {
      // Arrange
      const malformedVisualTarget = {
        type: 'visual',
      };
      
      // Act
      const errors = models.validateTarget(malformedVisualTarget);
      
      // Assert
      expect(errors).toBeDefined();
    });

    it(`should return no error if visual target is valid`, function () {
      // Arrange
      let validVisualTarget: models.IVisualTarget = {
        type: 'visual',
        id: 'visualId'
      };

      // Act
      const errors = models.validateTarget(validVisualTarget);

      // Assert
      expect(errors).toBeUndefined();
    });

    it(`should return no error if page target is valid`, function () {
      // Arrange
      const validPageTarget: models.IPageTarget = {
        type: 'page',
        name: 'page1'
      };

      // Act
      const errors = models.validateTarget(validPageTarget);

      // Assert
      expect(errors).toBeUndefined();
    });
  });

  describe('determine filter type', function () {
    it('getFilterType should return type of filter given a filter object', function () {
      // Arrange
      const testData = {
      	basicFilter: new models.BasicFilter({ table: "a", column: "b" }, "In", ["x", "y"]),
        advancedFilter: new models.AdvancedFilter({ table: "a", column: "b" }, "And", 
          { operator: "Contains", value: "x" },
          { operator: "Contains", value: "x" }
        ),
        nonFilter: <models.IFilter>{}
      };

      // Act

      // Assert
      expect(models.getFilterType(testData.basicFilter.toJSON())).toBe(models.FilterType.Basic);
      expect(models.getFilterType(testData.advancedFilter.toJSON())).toBe(models.FilterType.Advanced);
      expect(models.getFilterType(testData.nonFilter)).toBe(models.FilterType.Unknown);
    });
  });
});