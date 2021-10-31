import { serverData } from './../datasource';
import { TaskModel } from './models/taskModel';
import { textWrap } from './models/wrap';
import { FormService } from './services/form.service';
import { ColumnsService } from './services/columns.service';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  CellSaveEventArgs,
  ColumnModel,
  EditSettingsModel,
  SelectionSettingsModel,
  TreeGridComponent,
} from '@syncfusion/ej2-angular-treegrid';
import { BeforeOpenCloseEventArgs } from '@syncfusion/ej2-angular-inputs';
import {
  BeforeOpenCloseMenuEventArgs,
  ContextMenuComponent,
  MenuEventArgs,
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
} from './models/menu-items';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { dataTypes } from './models/types';
import { alignment } from './models/alignment';
import { uid } from 'uid';
import { RequestService } from './services/request.service';
import {
  RowDragEventArgs,
  RowSelectEventArgs,
} from '@syncfusion/ej2-angular-grids';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  public data: TaskModel[];
  public contextMenuItems: Object[];
  public editSettings: EditSettingsModel;
  public isEnableFilter: boolean;
  public frozenColumns: number;
  public allowSorting: boolean;
  public columns: ColumnModel[];
  public selectionOptions: SelectionSettingsModel;
  public visible: Boolean;
  public styleForm: FormGroup;
  public dataTypes: FieldSettingsModel[];
  public alignment: FieldSettingsModel[];
  public textWrap: FieldSettingsModel[];
  private clickedColIndex: number;
  private checkBoxes: String[];
  private selectedCheckBox: String[];
  private clickedRowIndex: number;
  private copyData: TaskModel[];
  private needReverseData: boolean;
  private highlightedRows: HTMLElement[];
  private cutMode: boolean;
  private destroy$: Subject<any> = new Subject<any>();
  private headerIds: string[];
  private rowIds: string[];

  @ViewChild('grid') grid: TreeGridComponent;
  @ViewChild('contextMenu') contextMenu: ContextMenuComponent;
  @ViewChild('dialogEdit') dialogEdit: DialogComponent;
  @ViewChild('dialogStyle') dialogStyle: DialogComponent;

  constructor(
    private readonly columnsService: ColumnsService,
    private readonly formService: FormService,
    private readonly requestService: RequestService
  ) {
    this.initData();
  }

  ngOnInit() {
    this.requestService.getColumns().subscribe((columns: ColumnModel[]) => {
      this.columns = columns;
    });
    this.requestService
      .getRows()
      .pipe(takeUntil(this.destroy$))
      .subscribe((rows: TaskModel[]) => {
        this.data = rows;
        // this.data = serverData;
        console.info('Rows count:', this.data.length);
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    this.columnsService.grid = this.grid;
  }

  /**
   * Обновление таблицы
   */
  public refreshGrid(): void {
    this.grid.refresh();
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
    this.columnsService.addListeners(
      this.clickedColIndex,
      this.grid.columns as ColumnModel[],
      dialog,
      form
    );
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
    this.columns = [{}];
    this.contextMenuItems = [];
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      allowEditOnDblClick: false,
      mode: 'Dialog',
    };
    this.isEnableFilter = false;
    this.frozenColumns = 0;
    this.selectedCheckBox = [];
    this.allowSorting = false;
    this.checkBoxes = [...headerCheckboxMenuItems, ...rowCheckboxMenuItems].map(
      (el) => el.id
    );
    this.selectionOptions = {
      mode: 'Row',
    };
    this.styleForm = this.formService.createFormGroup();
    this.dataTypes = dataTypes;
    this.alignment = alignment;
    this.textWrap = textWrap;
    this.copyData = [];
    this.highlightedRows = [];
    this.visible = false;
    this.cutMode = false;
    this.contextMenuItems = [
      ...headerCheckboxMenuItems,
      ...headerMenuItems,
      ...rowCheckboxMenuItems,
      ...rowMenuItems,
    ];
    this.headerIds = [...headerCheckboxMenuItems, ...headerMenuItems].map(
      (item) => item.id
    );
    this.rowIds = [...rowCheckboxMenuItems, ...rowMenuItems].map(
      (item) => item.id
    );
  }

  /**
   * Обработчик клика по контекстному меню
   * @param args
   */
  public select(args: MenuEventArgs): void {
    switch (args.item.id) {
      case 'col-filter':
        this.isEnableFilter = !this.isEnableFilter;
        break;
      case 'col-frozen':
        this.frozenCols();
        setTimeout(() => {
          this.contextMenu.refresh();
        }, 5);
        break;
      case 'col-sort':
        this.allowSorting = !this.allowSorting;
        break;
      case 'col-choose':
        this.showChooserColumns();
        break;
      case 'col-new':
        this.columnsService.addColumn(this.grid.columns as ColumnModel[]);
        this.grid.refreshColumns();
        break;
      case 'col-del':
        this.columnsService.deleteColumn(
          this.clickedColIndex,
          this.grid.columns as ColumnModel[]
        );
        this.grid.refreshColumns();
        break;
      case 'col-edit':
        this.onOpenEdit();
        break;
      case 'col-style':
        this.onOpenStyle();
        break;
      case 'row-multi-select':
        setTimeout(() => {
          this.toggleSelectionType();
        }, 5);
        break;
      case 'row-addNext':
      case 'row-addChild':
        const isParent: boolean = args.item.id === 'row-addChild';
        this.addRow(isParent);
        break;
      case 'row-delRow':
        this.deleteRow();
        break;
      case 'row-editRow':
        this.editRow();
        break;
      case 'row-copy':
      case 'row-cut':
        this.cutMode = args.item.id === 'row-cut';
        this.copyRows();
        break;
      case 'row-paste-sibling':
      case 'row-paste-child':
        if (this.copyData.length) {
          const isParent: boolean = args.item.id === 'row-paste-child';
          this.pasteRows(isParent);
        }
        break;
      case 'col-reorder':
        this.grid.allowReordering = !this.grid.allowReordering;
        break;
    }
  }

  /**
   * Добавить строку
   * @param position Позиция добавления строки
   */
  private addRow(isParent: boolean): void {
    this.grid.selectRow(this.clickedRowIndex);
    // this.createRow(isParent);
    const selectedRec = this.grid.getSelectedRecords()[0] as TaskModel;
    const offsetNextPaste = 2;
    const newRec = new TaskModel({
      parentIndex: isParent ? selectedRec.taskID : selectedRec.parentIndex,
      isParent: isParent,
    });

    const position = this.clickedRowIndex + offsetNextPaste;
    this.requestService.createRow(newRec, position).subscribe((res) => {
      if (res.success) {
        this.data.splice(position, 0, {
          ...newRec,
          taskID: res.id,
        });
        setTimeout(() => {
          this.refreshGrid();
        }, 5);
      }
    });
  }

  /**
   * Выделить строку при копировании
   */
  private highlightedColor(): void {
    this.highlightedRows.forEach((row: HTMLElement) => {
      row.classList.remove('bg-pink');
    });
    this.grid.getSelectedRows().forEach((row: Element) => {
      (row as HTMLElement).classList.add('bg-pink');
      this.highlightedRows.push(row as HTMLElement);
    });
  }

  /**
   * Фокус на нажатую строку
   */
  private rowFocus(): void {
    if (this.grid.selectionSettings.type === 'Single') {
      this.grid.selectRow(this.clickedRowIndex);
    }
  }

  /**
   * Скопировать выделенные строки
   */
  private copyRows(): void {
    this.rowFocus();
    this.highlightedColor();

    this.copyData = [];
    this.needReverseData = true;

    this.grid.getSelectedRecords().forEach((row: TaskModel) => {
      this.copyData.push({ ...row });
    });
  }

  /**
   * Вставить строки
   * @param position Позиция добавления строк
   */
  private pasteRows(isParent: boolean): void {
    this.grid.selectRow(this.clickedRowIndex);
    if (this.needReverseData && this.grid.selectionSettings.type !== 'Single') {
      this.copyData.reverse();
      this.needReverseData = false;
    }

    if (this.cutMode) {
      this.copyData.forEach((copyRow: TaskModel) => {
        this.data = this.data.filter(
          (dataRow) => dataRow.taskID !== copyRow.taskID
        );
      });
    }

    this.copyData.forEach((copyRow: TaskModel) => {
      this.createRow(isParent, {
        ...(copyRow as any).taskData,
      });
    });

    if (this.cutMode) {
      this.cutMode = false;
      this.copyData = [];
    }
    setTimeout(() => {
      this.refreshGrid();
    }, 5);
    this.grid.refreshColumns();
  }

  public actionBegin(args: CellSaveEventArgs): void {
    if (args.action === 'edit') {
      args.data = { ...args.data, taskID: (args.rowData as TaskModel).taskID };
    }
    if (args.requestType === 'virtualscroll') {
      return;
    }
    this.grid.showSpinner();
  }

  public actionComplete(args: CellSaveEventArgs) {
    if (args.requestType === 'save') {
      const task = this.createDataRow(args.data);
      this.requestService.updateRow(task).subscribe();
    }
    this.grid.hideSpinner();
  }

  /**
   * Преобразовать данные для отправки
   * @param data строка
   * @return Данные строки по всем полям столбцов
   */
  private createDataRow(data: any): TaskModel {
    const task = new TaskModel(data);
    const fields = this.columns.map((col) => col.field);

    fields.forEach((field) => {
      task[field] = data[field];
    });

    return task;
  }

  /**
   * Запрет перемещения root строк в child
   */
  public rowDrop(args: RowDragEventArgs) {
    if (args.fromIndex === args.dropIndex) {
      return;
    }
  }

  /**
   * Создать строку
   * @param position Позиция добавления
   * @param data Данные строки для копирования
   */
  private createRow(isParent: boolean, data?: TaskModel): void {
    const selectedRec = this.grid.getSelectedRecords()[0] as TaskModel;
    const taskID = this.cutMode ? data.taskID : uid();
    const offsetNextPaste = 2;
    const newRec = {
      ...data,
      taskID,
      parentIndex: isParent ? selectedRec.taskID : selectedRec.parentIndex,
      isParent: isParent,
    };
    this.data.splice(this.clickedRowIndex + offsetNextPaste, 0, newRec);
  }

  rowSelected(args: RowSelectEventArgs) {
    console.log(args);
  }

  /**
   * Задать тип выделения строк
   */
  private toggleSelectionType(): void {
    const isMultiSelect = this.selectedCheckBox.includes('row-multi-select');
    this.grid.selectionSettings.type = isMultiSelect ? 'Multiple' : 'Single';
  }

  /**
   * Редактировать строку
   */
  private editRow(): void {
    this.grid.selectRow(this.clickedRowIndex);
    this.grid.startEdit();
  }

  /**
   * Удалить строку
   */
  private deleteRow(): void {
    this.rowFocus();
    const ids = this.grid
      .getSelectedRecords()
      .map((row: TaskModel) => row.taskID);

    this.requestService.deleteRow(ids).subscribe((res) => {
      if (res.success) {
        this.grid.deleteRecord();
        this.grid.refreshColumns();
      }
    });
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
    const colStyles = (
      this.grid.getColumnHeaderByIndex(this.clickedColIndex) as HTMLElement
    ).style;
    this.styleForm = this.formService.createFormGroup(col, colStyles);
    this.dialogStyle.show();
  }

  /**
   * Открытие модала отображения/скрытия столбцов
   */
  private showChooserColumns(): void {
    const tarElement: HTMLElement = this.contextMenu.element;
    this.grid.columnChooserModule.openColumnChooser(tarElement.offsetLeft, 0);
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
   * @param args
   */
  public beforeCloseCM(args: BeforeOpenCloseMenuEventArgs): void {
    const checkbox = closest(
      args.event.target as Element,
      '.e-menu-item'
    ) as HTMLElement;

    if (!checkbox) {
      return;
    }
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
   * @param args
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
   * Срабатывает до открытия контекстного меню
   * @param args
   */
  public beforeOpenContextMenu(args: BeforeOpenCloseEventArgs): void {
    const elem: Element = args.event.target as Element;
    const row = elem.closest('.e-rowdragdrop');
    const col = elem.closest('.e-headercell');

    if (row) {
      this.switchContextMenuItems(this.rowIds, this.headerIds);
      this.clickedRowIndex = +row.parentElement.getAttribute('aria-rowindex');
      return;
    }
    if (col) {
      this.switchContextMenuItems(this.headerIds, this.rowIds);
      this.clickedColIndex = +col.getAttribute('aria-colindex');
      return;
    }
    args.cancel = true;
  }

  /**
   * Изменить опции в контекстном меню
   * @param showItems Опции для показа
   * @param hideItems Опции для скрытия
   * @param isUniqueId Идентификация опций по id
   */
  private switchContextMenuItems(
    showItems: string[],
    hideItems: string[],
    isUniqueId = true
  ): void {
    this.contextMenu.hideItems(hideItems, isUniqueId);
    this.contextMenu.showItems(showItems, isUniqueId);
  }
}
