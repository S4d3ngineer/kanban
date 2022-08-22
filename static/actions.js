export const INITIALIZE_STORE = Symbol("INITIALIZE_TABLES");

/** Setting store tables data to payload value and setting store's initialized property to true
 * @param { Array<TableData> } tablesData
 * @returns { { type: Symbol, payload: { tablesData: Array<TableData> } } } action object
 */
export function makeInitializeStoreAction(tablesData) {
  return { type: INITIALIZE_STORE, payload: { tablesData } };
}

export const COMPLETE_INITIALIZATION = Symbol("COMPLETE_INITIALIZATION");

/** Silent action that marks app initialization as completed.
 * Silent action does not trigger any subsribed observers
 * 
 * @returns { { type: Symbol, payload: { silent: boolean } } };
 */
export function makeCompleteInitializationAction() {
  return { type: COMPLETE_INITIALIZATION, silent: true };
}

export const ADD_TASK = Symbol("ADD_TASK");

/** Setting new task data to table identified by tableId
 *
 * @param { Number } tableId
 * @param { String } content
 * @returns { { type: Symbol, payload: { tableId: Number, content: String } } } action object
 */
export function makeAddTaskAction(tableId, content) {
  return { type: ADD_TASK, payload: { tableId, content } };
}

export const DELETE_TASK = Symbol("DELETE_TASK");

/**
 * 
 * @param { Number } taskId 
 * @param { Number } tableId
 * @returns { { type: Symbol, payload { tableId: Number, taskId: Number }} } action payload
 */
export function makeDeleteTaskAction(tableId, taskId) {
  return { type: DELETE_TASK, payload: { tableId, taskId }}
}

export const EDIT_TABLE_TITLE = Symbol("EDIT_TABLE_TITLE");

/**
 *
 * @param { Number } tableId
 * @param { String } newTitle
 * @returns { { type: Symbol, payload: { Number, String } } } action object
 */
export function makeEditTableTitleAction(tableId, newTitle) {
  return { type: EDIT_TABLE_TITLE, payload: { tableId, newTitle } };
}

export const EDIT_TASK = Symbol("EDIT_TASK");

/**
 *
 * @param { Number } taskId
 * @param { String } newContent
 * @returns { { type: Symbol, payload: { taskId: Number, newContent: String } } } action object
 */
export function makeEditTaskAction(taskId, newContent) {
  return { type: EDIT_TASK, payload: { taskId, newContent } };
}

export const MOVE_TASK = Symbol("MOVE_TASK");

/**
 *
 * @param { Number } sourceTableId
 * @param { Number } targetTableId
 * @param { Number } newPosition
 * @param { { client_side_id: Number, content: String } } task
 * @returns { {
  *  type: Symbol,
  *  payload: {
    *  sourceTableId: Number,
    *  targetTableId: Number,
    *  newPosition: Number,
    *  task: {
    *   this_client_id: Number,
    *   content: String
    *  }
  *  }
  * } } action object
 */
export function makeMoveTaskAction(
  sourceTableId,
  targetTableId,
  newPosition,
  task
) {
  return {
    type: MOVE_TASK,
    payload: { sourceTableId, targetTableId, newPosition, task }
  };
}

export const CREATE_TABLE = Symbol("INSERT_TABLE");

/**
 * @param { Node } appRoot
 * @param { Callback } storeDispatchCallback
 * @returns { { type: Symbol, payload: { appRoot: Node, storeDispatchCallback: Callback } } } action object
 */
export function makeInsertTableAction(appRoot, storeDispatchCallback) {
  return { type: CREATE_TABLE, payload: { appRoot, storeDispatchCallback } };
}

export const DELETE_TABLE = Symbol("DELETE_TABLE");

/**
 * 
 * @param { Number } tableId 
 * @returns { { type: Symbol, payload: { tableId: Number } } }
 */
export function makeDeleteTableAction(tableId) {
  return { type: DELETE_TABLE, payload: { tableId }};
}

