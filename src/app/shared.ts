import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

export const UID_LENGTH = 16;

export function createDataSource(
  typesValue: String[],
  typeText: String[] = typesValue
): FieldSettingsModel[] {
  return typesValue.map((value: String, index: number) => {
    return { text: typeText[index], value } as FieldSettingsModel;
  });
}

export function getClone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}
