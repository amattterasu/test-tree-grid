import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ColumnModel } from '@syncfusion/ej2-angular-treegrid';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  public createFormGroup(
    col?: ColumnModel,
    colStyles?: CSSStyleDeclaration
  ): FormGroup {
    const fontSize = colStyles?.fontSize
      ? parseInt(colStyles.fontSize ?? '16')
      : null;

    return new FormGroup({
      minWidth: new FormControl(col?.minWidth, [
        Validators.pattern('^[0-9]*$'),
      ]),
      typeData: new FormControl(col?.editType),
      textAlign: new FormControl(col?.textAlign),
      fontColor: new FormControl(colStyles?.color),
      backgroundColor: new FormControl(colStyles?.backgroundColor),
      fontSize: new FormControl(fontSize, [Validators.pattern('^[0-9]*$')]),
      textWrap: new FormControl(colStyles?.whiteSpace),
    });
  }
}
