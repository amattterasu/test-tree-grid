import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

export function createDataSource(
  typesValue: String[],
  typeText: String[] = typesValue
): FieldSettingsModel[] {
  return typesValue.map((value: String, index: number) => {
    return { text: typeText[index], value } as FieldSettingsModel;
  });
}
