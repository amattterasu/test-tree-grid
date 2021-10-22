import { ICustomEditCell } from './../models/types';
import { FormGroup } from '@angular/forms';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Injectable } from '@angular/core';
import {
  Column,
  ColumnModel,
  TreeGridComponent,
} from '@syncfusion/ej2-angular-treegrid';
import { DataEditTypes } from '../models/types';
import { DefaultEditCell } from '@syncfusion/ej2-grids';
import {
  BooleanEditCell,
  DatePickerEditCell,
  IEditCell,
  IGrid,
  NumericEditCell,
} from '@syncfusion/ej2-angular-grids';
import { IStyles } from '../models/style-interface';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class ColumnsService {
  public grid: TreeGridComponent;
  private saveColEditType: IEditCell;

  constructor(private readonly requestService: RequestService) {}

  /**
   * Добавить колонку в таблицу
   * @param cols Колонки
   */
  public addColumn(cols: ColumnModel[]): void {
    const col = new Column({
      field: null,
      headerText: `New Column ${Math.floor(Math.random() * 1000)}`,
    });
    this.grid.showSpinner();
    this.requestService.createColumn(col.headerText).subscribe((res) => {
      if (res.success) {
        col.field = res.id;
        cols.push(col);
        this.grid.refreshColumns();
      }
      this.grid.hideSpinner();
    });
  }

  /**
   * Удалить колонку их таблицы
   * @param index индекс колонки
   * @param cols Колонки
   */
  public deleteColumn(index: number, cols: ColumnModel[]): void {
    const col = cols[index];
    // including 0
    if (!index) {
      return;
    }
    this.requestService.deleteColumn(col.field).subscribe((res) => {
      if (res.success) {
        cols.splice(index, 1);
        this.grid.refreshColumns();
      }
    });
  }

  /**
   * Обработчики кнопок
   * @param index индекс колонки
   * @param cols Колонки
   * @param dialog Форма диалога
   */
  public addListeners(
    index: number,
    cols: ColumnModel[],
    dialog: DialogComponent,
    form?: FormGroup
  ): void {
    const col = cols[index];
    document.getElementById('saveButton').onclick = (): void => {
      this.updateColStyle(col, dialog, form.value);
    };

    document.getElementById('renameButton').onclick = (): void => {
      this.updateHeaderTextValue(col, dialog);
    };
  }

  /**
   * Редактировать стиль колонки
   * @param col Колонка для редактирования
   * @param dialog Форма диалога
   * @param value Значение из формы
   */
  private updateColStyle(
    col: ColumnModel,
    dialog: DialogComponent,
    value: IStyles
  ): void {
    if (col.editType === DataEditTypes.dropdownedit) {
      this.saveColEditType = col.edit;
    }

    col.minWidth = Math.abs(+value.minWidth);
    col.editType = value.typeData;
    col.textAlign = value.textAlign;
    col.type = this.getType(value.typeData).type;
    col.edit = this.getType(value.typeData).edit
      ? this.getType(value.typeData).edit
      : this.saveColEditType;
    col.customAttributes = {
      style: {
        color:
          value.fontColor ??
          (col.customAttributes?.style as CSSStyleDeclaration)?.color,
        fontSize: value.fontSize
          ? value.fontSize + 'px'
          : (col.customAttributes?.style as CSSStyleDeclaration)?.fontSize,
        backgroundColor:
          value.backgroundColor ??
          (col.customAttributes?.style as CSSStyleDeclaration)?.backgroundColor,
        whiteSpace:
          value.textWrap ??
          (col.customAttributes?.style as CSSStyleDeclaration)?.whiteSpace,
      },
    };
    col.displayAsCheckBox = value.typeData === DataEditTypes.booleanedit;
    this.grid.refreshColumns();
    dialog.hide();
  }

  /**
   * Получить параметры для ячеек колонок при изменении типа колонки
   * @param type выбранный тип тип
   * @return ICustomEditCell
   */
  private getType(type: string): ICustomEditCell {
    switch (type) {
      case DataEditTypes.datepickeredit:
        return {
          edit: new DatePickerEditCell(this.grid as any),
          type: 'date',
        };
      case DataEditTypes.dropdownedit:
        return {
          // через new DropDownEditCell баг
          edit: null,
          type: 'string',
        };
      case DataEditTypes.defaultedit:
        return {
          edit: new DefaultEditCell(this.grid as any) as any,
          type: 'string',
        };
      case DataEditTypes.booleanedit:
        return {
          edit: new BooleanEditCell(this.grid as any),
          type: 'boolean',
        };
      case DataEditTypes.numericedit:
        return {
          edit: new NumericEditCell(this.grid as any),
          type: 'number',
        };
      default:
        return {
          edit: new DefaultEditCell(this.grid as any) as any,
          type: 'string',
        };
    }
  }

  /**
   * Переименовать колонку
   * @param col Колонка для редактирования
   * @param dialog Форма диалога
   */
  private updateHeaderTextValue(
    col: ColumnModel,
    dialog: DialogComponent
  ): void {
    const input: HTMLInputElement = document.getElementById(
      'inVal'
    ) as HTMLInputElement;

    if (input.value === col.headerText) {
      dialog.hide();
      return;
    }

    if (input.value !== '') {
      this.requestService.updateColumn(col, input.value).subscribe((res) => {
        if (res.success) {
          col.headerText = input.value;
          this.grid.refreshColumns();
          dialog.hide();
          input.value = '';
        }
      });
    }
  }
}
