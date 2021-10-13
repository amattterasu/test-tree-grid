import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  BooleanEditCell,
  DatePickerEditCell,
  DropDownEditCell,
  NumericEditCell,
  DefaultEditCell,
} from '@syncfusion/ej2-angular-grids';
import { createDataSource } from '../shared';

export enum DataEditTypes {
  defaultedit = 'defaultedit',
  numericedit = 'numericedit',
  datepickeredit = 'datepickeredit',
  booleanedit = 'booleanedit',
  dropdownedit = 'dropdownedit',
}

const typesValue: String[] = [
  'defaultedit',
  'numericedit',
  'datepickeredit',
  'booleanedit',
  'dropdownedit',
];

const typeText: String[] = ['Text', 'Num', 'Date', 'Boolean', 'DropDownList'];

export const dataTypes: FieldSettingsModel[] = createDataSource(
  typesValue,
  typeText
);

export type EditCell =
  | DefaultEditCell
  | DatePickerEditCell
  | DropDownEditCell
  | BooleanEditCell
  | NumericEditCell;

export interface IEditCell {
  edit: EditCell;
  type: string;
}
