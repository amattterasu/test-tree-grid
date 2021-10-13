import { textWrap } from './models/wrap';
import { FormService } from './services/form.service';
import { ITaskModel } from './../datasource';
import { ColumnsService } from './services/columns.service';
import { Component, ViewChild } from '@angular/core';
import {
  ColumnModel,
  EditSettingsModel,
  SelectionSettingsModel,
  TreeGridComponent,
} from '@syncfusion/ej2-angular-treegrid';
import { createTasks } from '../datasource';
import { BeforeOpenCloseEventArgs } from '@syncfusion/ej2-angular-inputs';
import {
  BeforeOpenCloseMenuEventArgs,
  ContextMenuComponent,
  MenuEventArgs,
  MenuItemModel,
} from '@syncfusion/ej2-angular-navigations';
import { closest, createElement } from '@syncfusion/ej2-base';
import { createCheckBox } from '@syncfusion/ej2-angular-buttons';
import { FormGroup } from '@angular/forms';

import { DialogComponent, OpenEventArgs } from '@syncfusion/ej2-angular-popups';
import {
  headerCheckboxMenuItems,
  headerMenuItems,
  rowCheckboxMenuItems,
  rowMenuItems,
} from './models/items';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { dataTypes } from './models/types';
import { alignment } from './models/alignment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public data: ITaskModel[];
  public contextMenuItems: Object[];
  public editSettings: EditSettingsModel;
  public headerMenuItems: MenuItemModel[];
  public rowMenuItems: MenuItemModel[];
  public isEnableFilter: boolean;
  public frozenColumns: number;
  public allowSorting: boolean;
  private clickedColIndex: number;
  private checkBoxes: String[];
  private selectedCheckBox: String[];
  public columns: ColumnModel[];
  public selectionOptions: SelectionSettingsModel;
  public visible: Boolean = false;
  public rowDrop: Object;
  public styleForm: FormGroup;
  public dataTypes: FieldSettingsModel[];
  public alignment: FieldSettingsModel[];
  public textWrap: FieldSettingsModel[];
  private clickedRowIndex: number;

  @ViewChild('grid') grid: TreeGridComponent;
  @ViewChild('headerContextMenu') headerContextMenu: ContextMenuComponent;
  @ViewChild('rowContextMenu') rowContextMenu: ContextMenuComponent;
  @ViewChild('dialogEdit') dialogEdit: DialogComponent;
  @ViewChild('dialogStyle') dialogStyle: DialogComponent;

  constructor(
    private readonly columnsService: ColumnsService,
    private readonly formService: FormService
  ) {
    this.initData();
  }

  /**
   * Срабатывает после открытия диалога колонок
   */
  public dialogOpen(args: OpenEventArgs): void {
    const type = args.element.id;
    let form;
    let dialog;
    if (type === 'dialogStyle') {
      form = this.styleForm;
      dialog = this.dialogStyle;
    } else if (type === 'dialogEdit') {
      form = null;
      dialog = this.dialogEdit;
    }
    this.columnsService.grid = this.grid;
    this.columnsService.addListeners(
      this.clickedColIndex,
      this.grid.columns as ColumnModel[],
      dialog,
      form
    );
  }

  /**
   * Срабатывает после закрытия модала
   */
  public dialogClose(): void {
    // this.grid.refreshColumns();
  }

  public beforeOpenDialog(): void {
    const input: HTMLInputElement = document.getElementById(
      'inVal'
    ) as HTMLInputElement;
    input.value = this.columns[this.clickedColIndex].headerText;
  }

  /**
   * Инициализация
   */
  initData(): void {
    this.contextMenuItems = [];
    this.data = createTasks(1000);
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Dialog',
      newRowPosition: 'Bottom',
    };
    this.headerMenuItems = [...headerCheckboxMenuItems, ...headerMenuItems];
    this.rowMenuItems = [...rowCheckboxMenuItems, ...rowMenuItems];
    this.isEnableFilter = false;
    this.frozenColumns = 0;
    this.clickedColIndex = 0;
    this.selectedCheckBox = [];
    this.allowSorting = false;
    this.checkBoxes = [...headerCheckboxMenuItems, ...rowCheckboxMenuItems].map(
      (el) => el.id
    );
    this.columns = this.columnsService.defaultColumns;
    this.selectionOptions = {
      type: 'Multiple',
      mode: 'Row',
    };
    this.styleForm = this.formService.createFormGroup();
    this.dataTypes = dataTypes;
    this.alignment = alignment;
    this.textWrap = textWrap;
  }

  /**
   * Событие открытия контекстного меню
   * @param args BeforeOpenCloseEventArgs
   */
  public beforeOpenHeaderCM(args: BeforeOpenCloseEventArgs): void {
    this.dialogEdit.hide();
    this.dialogStyle.hide();
    this.clickedColIndex = +(args.event.target as Element)
      .closest('.e-headercell')
      .getAttribute('aria-colindex');
  }

  /**
   * Обработчик клика по элементу меню хедера колонки
   * @param args MenuEventArgs
   */
  public select(args: MenuEventArgs): void {
    switch (args.item.id) {
      case 'filter':
        this.isEnableFilter = !this.isEnableFilter;
        break;
      case 'frozen':
        this.frozenCols();
        this.refreshHeaderCM();
        break;
      case 'sort':
        this.allowSorting = !this.allowSorting;
        break;
      case 'show':
        this.showChooserColumns();
        break;
      case 'new':
        this.columnsService.addColumn(this.grid.columns as ColumnModel[]);
        this.grid.refreshColumns();
        break;
      case 'del':
        this.columnsService.deleteColumn(
          this.clickedColIndex,
          this.grid.columns as ColumnModel[]
        );
        this.grid.refreshColumns();
        break;
      case 'edit':
        this.onOpenEdit();
        break;
      case 'style':
        this.onOpenStyle();
        break;
    }
  }

  /**
   * Обработчик клика по заголовку строки
   * @param args
   */
  public selectRow(args: MenuEventArgs): void {
    switch (args.item.id) {
      case 'new':
        this.grid.addRecord({ taskID: this.grid.getRows().length + 1 });
        break;
      case 'del':
        this.grid.deleteRecord();
        break;
      case 'copy':
        break;
      case 'cut':
        break;
      case 'child':
        break;
    }
  }

  /**
   * Показать окно редактирования названия колонки
   */
  public onOpenEdit(): void {
    this.dialogEdit.show();
  }

  /**
   * Показать окно изменения стилей
   */
  public onOpenStyle(): void {
    const col = this.columns[this.clickedColIndex];
    this.styleForm = this.formService.createFormGroup(col);
    this.dialogStyle.show();
  }

  /**
   * Открытие модала отображения/скрытия столбцов
   */
  private showChooserColumns(): void {
    const tarElement: HTMLElement = this.headerContextMenu.element;
    const x = tarElement.offsetLeft + tarElement.clientWidth;
    this.grid.columnChooserModule.openColumnChooser(x, 0);
  }

  /**
   * Зафиксировать колонки, включая выбранную
   */
  private frozenCols(): void {
    const currentColumn =
      this.grid.getColumns().length === this.clickedColIndex + 1
        ? this.clickedColIndex
        : ++this.clickedColIndex;

    // Virtual scrolling is not compatible with Batch editing, detail template and Frozen columns
    this.grid.enableVirtualization = !this.grid.enableVirtualization;
    this.frozenColumns = this.frozenColumns ? 0 : currentColumn;
  }

  /**
   * Срабатывает перед закрытием контекстного меню
   * @param args BeforeOpenCloseMenuEventArgs
   */
  public beforeCloseCM(args: BeforeOpenCloseMenuEventArgs): void {
    if (!(args.event.target as Element).closest('.e-menu-item')) {
      return;
    }
    const checkbox: HTMLElement = closest(
      args.event.target as Element,
      '.e-menu-item'
    ) as HTMLElement;

    const frame: HTMLElement = checkbox.querySelector('.e-frame');

    if (checkbox && frame?.classList.contains('e-check')) {
      frame.classList.remove('e-check');
      this.selectedCheckBox = this.selectedCheckBox.filter(
        (el) => el !== checkbox.id
      );
    } else if (checkbox && frame) {
      frame.classList.add('e-check');
      this.selectedCheckBox.push(checkbox.id);
    }
  }

  /**
   * Формирование шаблона контекстного меню
   * @param args MenuEventArgs
   */
  public itemRender(args: MenuEventArgs): void {
    if (!this.checkBoxes.includes(args.item.id)) {
      return;
    }
    const check: Element = createCheckBox(createElement, false, {
      label: args.item.text,
      checked: this.selectedCheckBox.includes(args.item.id),
    });
    args.element.innerHTML = '';
    args.element.appendChild(check);
  }

  /**
   * Обновление контекстного меню Column Header
   * Исправляет баг с непоявлением контекстного меню
   * после манипуляций с колонками
   */
  private refreshHeaderCM(): void {
    setTimeout(() => {
      this.headerContextMenu.refresh();
    }, 5);
  }

  /**
   * Срабатывает до открытия контекстного меню строки
   * Target - весь контент таблицы, а необходим только drag-item
   * @param args
   */
  public beforeOpenRowCM(args: BeforeOpenCloseEventArgs): void {
    if (!(args.event.target as Element).closest('.e-rowdragdrop')) {
      args.cancel = true;
    }
    this.clickedRowIndex = +(args.event.target as Element)
      .closest('.e-row')
      .getAttribute('aria-rowindex');
  }
}
