import { getUniqueTableId, getUniqueTaskId, insertTable } from "./helpers.js";
import {
  INITIALIZE_STORE,
  ADD_TASK,
  DELETE_TASK,
  EDIT_TABLE_TITLE,
  EDIT_TASK,
  MOVE_TASK,
  CREATE_TABLE,
  DELETE_TABLE,
  COMPLETE_INITIALIZATION,
} from "./actions.js";

/**
 *
 * @param { { tables: Array<TableData>,  initializied: boolean } } stateCopy State's deep copy.
 * @param { { type: Symbol, payload: any} } action Action object containing type and payload.
 * @returns { { tables: Array<TableData>,  initializied: boolean } } Updated state.
 */
export const reducer = (stateCopy, action) => {
  switch (action.type) {
    case INITIALIZE_STORE: {
      const newState = {
        ...stateCopy,
        tables: action.payload.tablesData
      };
      return newState;
    }
    case COMPLETE_INITIALIZATION: {
      const newState = {
        ...stateCopy,
        appInitialized: true
      };
      return newState;
    }
    case ADD_TASK: {
      const newTask = {
        client_side_id: getUniqueTaskId(stateCopy.tables),
        content: action.payload.content,
      };
      const updatedTable = stateCopy.tables.find(
        (table) => table.client_side_id === action.payload.tableId
      );
      updatedTable.tasks.push(newTask);
      return stateCopy;
    }
    case DELETE_TASK: {
      const tableToUpdate = stateCopy.tables.find(
        (table) => table.client_side_id === action.payload.tableId
      );
      tableToUpdate.tasks = tableToUpdate.tasks.filter(
        (task) => task.client_side_id !== action.payload.taskId
      );
      return stateCopy;
    }
    case EDIT_TABLE_TITLE: {
      const updatedTable = stateCopy.tables.find(
        (table) => table.client_side_id === action.payload.tableId
      );
      updatedTable.title = action.payload.newTitle;
      return stateCopy;
    }
    case EDIT_TASK: {
      loopTables: for (const table of stateCopy.tables) {
        const editedTask = table.tasks.find(
          (task) => task.client_side_id === action.payload.taskId
        );
        if (editedTask) {
          editedTask.content = action.payload.newContent;
          break;
        }
      }
      return stateCopy;
    }
    case MOVE_TASK: {
      // Removing task from sourceTable data
      const sourceTable = stateCopy.tables.find(
        (table) => table.client_side_id === action.payload.sourceTableId
      );
      sourceTable.tasks = sourceTable.tasks.filter(
        (task) => task.client_side_id !== action.payload.task.client_side_id
      );
      // Moving data into targetTable
      const targetTable = stateCopy.tables.find(
        (table) => table.client_side_id === action.payload.targetTableId
      );
      targetTable.tasks.splice(
        action.payload.newPosition,
        0,
        action.payload.task
      );
      return stateCopy;
    }
    case CREATE_TABLE: {
      const newTable = {
        client_side_id: getUniqueTableId(stateCopy.tables),
        title: "New Table",
        tasks: [],
      };
      stateCopy.tables.push(newTable);
      insertTable(
        action.payload.appRoot,
        newTable,
        action.payload.storeDispatchCallback
      );
      return stateCopy;
    }
    case DELETE_TABLE: {
      stateCopy.tables = stateCopy.tables.filter(
        (table) => table.client_side_id !== action.payload.tableId
      );
      return stateCopy;
    }
  }
};