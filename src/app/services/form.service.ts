import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ColumnModel } from '@syncfusion/ej2-angular-treegrid';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  public createFormGroup(col?: ColumnModel): FormGroup {
    return new FormGroup({
      minWidth: new FormControl(col?.minWidth),
      typeData: new FormControl(col?.editType),
      textAlign: new FormControl(col?.textAlign),
      fontColor: new FormControl(),
      backgroundColor: new FormControl(),
      fontSize: new FormControl(),
      textWrap: new FormControl(),
    });
  }
}
