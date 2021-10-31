import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ColumnModel } from '@syncfusion/ej2-angular-treegrid';
import { Observable } from 'rxjs';
import { TaskModel } from '../models/taskModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly header: HttpHeaders;

  private readonly BASIC_URL = environment.API_URL;

  constructor(private readonly http: HttpClient) {
    this.header = new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  public getColumns(): Observable<ColumnModel[]> {
    return this.http.get(this.BASIC_URL + '/columns') as Observable<
      ColumnModel[]
    >;
  }

  public createColumn(headerText: string): Observable<any> {
    return this.http.post<any>(
      this.BASIC_URL + '/columns',
      JSON.stringify({
        headerText,
      }),
      {
        headers: this.header,
      }
    );
  }

  public createRow(row: Partial<TaskModel>, position: number): Observable<any> {
    return this.http.post<any>(
      this.BASIC_URL + '/create-rows',
      JSON.stringify({
        row,
        position,
      }),
      {
        headers: this.header,
      }
    );
  }

  public updateColumn(
    col: ColumnModel,
    newHeaderText?: string
  ): Observable<any> {
    const { field, editType, customAttributes, minWidth, textAlign } = col;
    const headerText = newHeaderText ?? col.headerText;

    return this.http.put<any>(
      this.BASIC_URL + `/columns/${col.field}`,
      JSON.stringify({
        field,
        headerText,
        editType,
        minWidth,
        customAttributes,
        textAlign,
      }),
      {
        headers: this.header,
      }
    );
  }

  public deleteColumn(id: string): Observable<any> {
    return this.http.delete<any>(this.BASIC_URL + `/columns/${id}`, {
      headers: this.header,
    });
  }

  public getRows(): Observable<TaskModel[]> {
    return this.http.get(this.BASIC_URL + '/rows') as Observable<TaskModel[]>;
  }

  public updateRow(task: TaskModel): Observable<any> {
    return this.http.put<any>(
      this.BASIC_URL + `/rows/${task.taskID}`,
      JSON.stringify({
        ...task,
      }),
      {
        headers: this.header,
      }
    );
  }

  public deleteRow(ids: (string | number)[]): Observable<any> {
    return this.http.post<any>(
      this.BASIC_URL + '/rows',
      JSON.stringify({
        ids,
      }),
      {
        headers: this.header,
      }
    );
  }
}
