import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ContextMenuModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {
  ColumnChooserService,
  ColumnMenuService,
  ContextMenuService,
  EditService,
  FilterService,
  FreezeService,
  ReorderService,
  ResizeService,
  RowDDService,
  SortService,
  TreeGridModule,
  VirtualScrollService,
} from '@syncfusion/ej2-angular-treegrid';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    TreeGridModule,
    ContextMenuModule,
    ButtonModule,
    FormsModule,
    DialogModule,
    ReactiveFormsModule,
    DropDownListModule,
    HttpClientModule,
  ],
  providers: [
    ContextMenuService,
    EditService,
    ReorderService,
    ResizeService,
    FilterService,
    FreezeService,
    SortService,
    ColumnMenuService,
    ColumnChooserService,
    VirtualScrollService,
    RowDDService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
