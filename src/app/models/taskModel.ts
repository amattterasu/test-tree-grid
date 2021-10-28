export class TaskModel {
  taskID?: string | number;
  taskName?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  duration?: number;
  approved?: boolean;
  priority?: string;
  parentIndex?: string | number;
  isParent?: boolean;
  [key: string]: any;

  constructor(task: TaskModel) {
    this.taskID = task.taskID;
    this.taskName = task.taskName;
    this.startDate = task.startDate;
    this.endDate = task.endDate;
    this.duration = task.duration;
    this.approved = task.approved;
    this.priority = task.priority;
    this.parentIndex = task.parentIndex;
    this.isParent = task.isParent;
  }
}
