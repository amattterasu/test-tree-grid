import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { createDataSource } from '../shared';

export enum TextWrapEnum {
  Normal = 'normal',
  Nowrap = 'nowrap',
}

export type textWrap = 'normal' | 'nowrap';

const typesValue: TextWrapEnum[] = [TextWrapEnum.Normal, TextWrapEnum.Nowrap];

export const textWrap: FieldSettingsModel[] = createDataSource(typesValue);
