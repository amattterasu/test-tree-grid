import { IEditCell } from './../models/types';
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
  DropDownEditCell,
  IGrid,
  NumericEditCell,
} from '@syncfusion/ej2-angular-grids';
import { IStyles } from '../models/style-interface';

@Injectable({
  providedIn: 'root',
})
export class ColumnsService {
  public grid: IGrid | TreeGridComponent;

  public get defaultColumns(): ColumnModel[] {
    return [
      {
        field: 'taskID',
        headerText: 'Task ID',
        width: 70,
        isPrimaryKey: true,
      },
      {
        field: 'taskName',
        headerText: 'Task Name',
      },
      {
        field: 'startDate',
        headerText: 'Start Date',
        format: 'yMd',
        editType: 'datePickerEdit',
      },
      {
        field: 'duration',
        headerText: 'Duration',
        editType: 'numericEdit',
      },
      {
        field: 'approved',
        headerText: 'Approved',
        displayAsCheckBox: true,
        editType: 'booleanEdit',
      },
      {
        field: 'priority',
        headerText: 'Priority',
        editType: 'defaultedit',
      },
    ];
  }

  /**
   * Добавить колонку в таблицу
   * @param cols Колонки
   */
  public addColumn(cols: ColumnModel[]): void {
    const col = new Column({
      field: `newColId ${Math.random() * 1000 * Math.random()}`,
      headerText: `New Column ${Math.floor(Math.random() * 1000)}`,
    });
    cols.push(col);
  }

  /**
   * Удалить колонку их таблицы
   * @param index индекс колонки
   * @param cols Колонки
   */
  public deleteColumn(index: number, cols: ColumnModel[]): void {
    // including 0
    if (!index) {
      return;
    }
    cols.splice(index, 1);
  }

  /**
   * Обработчики кнопок
   * @todo Рефакторинг
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
    col.minWidth = Math.abs(+value.minWidth);
    col.editType = value.typeData;
    col.textAlign = value.textAlign;
    col.type = this.getType(value.typeData).type;
    col.edit = this.getType(value.typeData).edit;
    col.customAttributes = {
      style: {
        color: value.fontColor ?? (col.customAttributes?.style as any)?.color,
        'font-size': value.fontSize
          ? value.fontSize + 'px'
          : (col.customAttributes?.style as any)?.['font-size'],
        'background-color':
          value.backgroundColor ??
          (col.customAttributes?.style as any)?.['background-color'],
        'white-space':
          value.textWrap ??
          (col.customAttributes?.style as any)?.['white-space'],
      },
    };
    col.displayAsCheckBox = value.typeData === DataEditTypes.booleanedit;
    (this.grid as TreeGridComponent).refreshColumns();
    dialog.hide();
  }

  /**
   * Получить параметры для ячеек колонок при изменении типа колонки
   * @param type выбранный тип тип
   * @return IEditCell
   */
  private getType(type: string): IEditCell {
    switch (type) {
      case DataEditTypes.datepickeredit:
        return {
          edit: new DatePickerEditCell(this.grid as IGrid),
          type: 'date',
        };
      case DataEditTypes.dropdownedit:
        return {
          edit: new DropDownEditCell(this.grid as IGrid),
          type: 'string',
        };
      case DataEditTypes.defaultedit:
        return {
          edit: new DefaultEditCell(this.grid as any) as any,
          type: 'string',
        };
      case DataEditTypes.booleanedit:
        return {
          edit: new BooleanEditCell(this.grid as IGrid),
          type: 'boolean',
        };
      case DataEditTypes.numericedit:
        return {
          edit: new NumericEditCell(this.grid as IGrid),
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
      col.headerText = input.value;
      (this.grid as TreeGridComponent).refreshColumns();
      dialog.hide();
      input.value = '';
    }
  }
}
