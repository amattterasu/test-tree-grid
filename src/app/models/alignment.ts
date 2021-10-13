import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { createDataSource } from '../shared';

export enum TextAlignEnum {
  Left = 'Left',
  Right = 'Right',
  Center = 'Center',
  Justify = 'Justify',
}

export type TextAlign = 'Left' | 'Right' | 'Center' | 'Justify';

const typesValue: TextAlign[] = [
  TextAlignEnum.Left,
  TextAlignEnum.Right,
  TextAlignEnum.Center,
  TextAlignEnum.Justify,
];

export const alignment: FieldSettingsModel[] = createDataSource(typesValue);
