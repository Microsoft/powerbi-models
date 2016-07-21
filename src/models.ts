declare var require: Function;

export const advancedFilterSchema = require('./schemas/advancedFilter.json');
export const filterSchema = require('./schemas/filter.json');
export const filtersContainerSchema = require('./schemas/filtersContainer.json');
export const loadSchema = require('./schemas/load.json');
export const pageSchema = require('./schemas/page.json');
export const pageTargetSchema = require('./schemas/pageTarget.json');
export const settingsSchema = require('./schemas/settings.json');
export const targetSchema = require('./schemas/target.json');
export const basicFilterSchema = require('./schemas/basicFilter.json');
export const visualTargetSchema = require('./schemas/visualTarget.json');

import * as jsen from 'jsen';

interface IValidationError {
  path: string;
  keyword: string;
  message: string;
}

export interface IError {
  message: string;
}

function normalizeError(error: IValidationError): IError {
  if(!error.message) {
    error.message = `${error.path} is invalid. Not meeting ${error.keyword} constraint`;
  }

  delete error.path;
  delete error.keyword;

  return error;
}

/**
 * Takes in schema and returns function which can be used to validate the schema with better semantics around exposing errors
 */
function validate(schema: any, options?: any) {
  return (x: any): IError[] => {
    const validate = jsen(schema, options);
    const isValid = validate(x);

    if(isValid) {
      return undefined;
    }
    else {
      return validate.errors
        .map(normalizeError);
    }
  }
}

export interface ISettings {
  filterPaneEnabled?: boolean;
  navContentPaneEnabled?: boolean;
}

export const validateSettings = validate(settingsSchema, {
  schemas: {
    basicFilter: basicFilterSchema,
    advancedFilter: advancedFilterSchema
  }
});

export interface ILoadConfiguration {
  accessToken: string;
  id: string;
  settings?: ISettings;
  pageName?: string;
  filter?: any;
}

export const validateLoad = validate(loadSchema, {
  schemas: {
    settings: settingsSchema,
    basicFilter: basicFilterSchema,
    advancedFilter: advancedFilterSchema
  }
});

export interface IPageTarget {
  type: "page";
  name: string;
}


export interface IVisualTarget {
  type: "visual";
  id: string;
}

export declare type ITarget = (IPageTarget | IVisualTarget);

export const validateTarget = validate(targetSchema, {
  schemas: {
    pageTarget: pageTargetSchema,
    visualTarget: visualTargetSchema
  }
});

export interface IPage {
  name: string;
  displayName: string;
}

export interface IVisual {
  id: string;
}

export const validatePage = validate(pageSchema);

export const validateFiltersContainer = validate(filtersContainerSchema, {
  schemas: {
    target: targetSchema,
    pageTarget: pageTargetSchema,
    visualTarget: visualTargetSchema,
    filter: filterSchema,
    basicFilter: basicFilterSchema,
    advancedFilter: advancedFilterSchema
  }
})

export const validateFilter = validate(filterSchema, {
  schemas: {
    basicFilter: basicFilterSchema,
    advancedFilter: advancedFilterSchema
  }
});

/**
 * Copied powerbi-filters code into this file.
 */
export interface IBaseFilterTarget {
  table: string;
}

export interface IFilterColumnTarget extends IBaseFilterTarget {
  column: string;
}

export interface IFilterHierarchyTarget extends IBaseFilterTarget {
  hierarchy: string;
  hierarchyLevel: string;
}

export interface IFilterMeasureTarget extends IBaseFilterTarget {
  measure: string;
}

export declare type IFilterTarget = (IFilterColumnTarget | IFilterHierarchyTarget | IFilterMeasureTarget);

export interface IFiltersContainer {
  target?: ITarget,
  filters: (IBasicFilter | IAdvancedFilter)[]
}

export interface IFilter {
  $schema: string;
  target: IFilterTarget;
}

export interface IBasicFilter extends IFilter {
  operator: BasicFilterOperators;
  values: (string | number | boolean)[];
}

export type BasicFilterOperators = "In" | "NotIn";
export type AdvancedFilterLogicalOperators = "And" | "Or";
export type AdvancedFilterConditionOperators = "None" | "LessThan" | "LessThanOrEqual" | "GreaterThan" | "GreaterThanOrEqual" | "Contains" | "DoesNotContain" | "StartsWith" | "DoesNotStartWith" | "Is" | "IsNot" | "IsBlank" | "IsNotBlank";

export interface IAdvancedFilterCondition {
  value: (string | number | boolean);
  operator: AdvancedFilterConditionOperators;
}

export interface IAdvancedFilter extends IFilter {
  logicalOperator: AdvancedFilterLogicalOperators;
  conditions: IAdvancedFilterCondition[];
}

export enum FilterType {
  Advanced,
  Basic,
  Unknown
}

export function getFilterType(filter: IFilter): FilterType {
  const basicFilter = filter as IBasicFilter;
  const advancedFilter = filter as IAdvancedFilter;

  if ((typeof basicFilter.operator === "string")
    && (Array.isArray(basicFilter.values))
  ) {
    return FilterType.Basic;
  }
  else if ((typeof advancedFilter.logicalOperator === "string")
    && (Array.isArray(advancedFilter.conditions))
  ) {
    return FilterType.Advanced;
  }
  else {
    return FilterType.Unknown;
  }
}

export function isMeasure(arg: any): arg is IFilterMeasureTarget {
  return arg.table !== undefined && arg.measure !== undefined;
}

export function isColumn(arg: any): arg is IFilterColumnTarget {
  return arg.table !== undefined && arg.column !== undefined;
}

export function isHierarchy(arg: any): arg is IFilterHierarchyTarget {
  return arg.table !== undefined && arg.hierarchy !== undefined && arg.hierarchyLevel !== undefined;
}

export abstract class Filter {
  protected static schemaUrl: string;
  protected schemaUrl: string;
  static schema: string;
  target: IFilterTarget;
  
  constructor(
    target: IFilterTarget
  ) {
    this.target = target;
  }
  
  toJSON(): IFilter {
    return {
      $schema: this.schemaUrl,
      target: this.target
    }
  };
}

export class BasicFilter extends Filter {
  static schemaUrl: string = "http://powerbi.com/product/schema#basic";
  operator: BasicFilterOperators;
  values: (string | number | boolean)[];
  
  constructor(
    target: IFilterTarget,
    operator: BasicFilterOperators,
    ...values: ((string | number | boolean) | (string | number | boolean)[])[]
  ) {
    super(target);
    this.operator = operator;
    this.schemaUrl = BasicFilter.schemaUrl;
    
    if(values.length === 0) {
      throw new Error(`values must be a non-empty array. You passed: ${values}`);
    }
    
    /**
     * Accept values as array instead of as individual arguments
     * new BasicFilter('a', 'b', 1, 2);
     * new BasicFilter('a', 'b', [1,2]);
     */
    if(Array.isArray(values[0])) {
      this.values = <(string | number | boolean)[]>values[0];
    }
    else {
      this.values = <(string | number | boolean)[]>values;
    }
  }
  
  toJSON(): IBasicFilter {
    const filter = <IBasicFilter>super.toJSON();
    
    filter.operator = this.operator;
    filter.values = this.values;
    
    return filter;
  }
}

export class AdvancedFilter extends Filter {
  static schemaUrl: string = "http://powerbi.com/product/schema#advanced";
  
  logicalOperator: AdvancedFilterLogicalOperators;
  conditions: IAdvancedFilterCondition[];
  
  constructor(
    target: IFilterTarget,
    logicalOperator: AdvancedFilterLogicalOperators,
    ...conditions: (IAdvancedFilterCondition | IAdvancedFilterCondition[])[]
  ) {
    super(target);
    this.schemaUrl = AdvancedFilter.schemaUrl;
    
    // Guard statements
    if(typeof logicalOperator !== "string" || logicalOperator.length === 0) {
      // TODO: It would be nicer to list out the possible logical operators.
      throw new Error(`logicalOperator must be a valid operator, You passed: ${logicalOperator}`);
    }
    
    this.logicalOperator = logicalOperator;
    
    if(conditions.length === 0) {
      throw new Error(`conditions must be a non-empty array. You passed: ${conditions}`);
    }
    if(conditions.length > 2) {
      throw new Error(`AdvancedFilters may not have more than two conditions. You passed: ${conditions.length}`);
    }
    
    /**
     * Accept conditions as array instead of as individual arguments
     * new AdvancedFilter('a', 'b', "And", { value: 1, operator: "Equals" }, { value: 2, operator: "IsGreaterThan" });
     * new AdvancedFilter('a', 'b', "And", [{ value: 1, operator: "Equals" }, { value: 2, operator: "IsGreaterThan" }]);
     */
    if(Array.isArray(conditions[0])) {
      this.conditions = <IAdvancedFilterCondition[]>conditions[0];
    }
    else {
      this.conditions = <IAdvancedFilterCondition[]>conditions;
    }
  }
  
  toJSON(): IAdvancedFilter {
    const filter = <IAdvancedFilter>super.toJSON();
    
    filter.logicalOperator = this.logicalOperator;
    filter.conditions = this.conditions;
    
    return filter;
  }
}