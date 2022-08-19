import Table from "./Table.js";

// TODO add jdoc wherever neccessary
export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function getUniqueTaskId(data) {
  const idList = data.tables
    .map((table) => table.tasks)
    .reduce((allTasks, tableTasks) => [...allTasks, ...tableTasks], [])
    .map((task) => task.client_side_id);

  let id;
  do {
    id = makeId();
  } while (idList.includes(id));
  return id;
}

export function getUniqueTableId(data) {
  const idList = data.tables.map((table) => table.client_side_id);

  let id;
  do {
    id = makeId();
  } while (idList.includes(id));
  return id;
}

function makeId() {
  // Postgres integer datatype is 4 bytes and it is signed, thus max is:
  const maxPositiveInteger = 2 ** (4 * 8 - 1) - 1;
  const idFloat = Math.random() * maxPositiveInteger;
  return Math.round(idFloat);
}

/**
 * 
 * @param { Node } appRoot 
 * @param { { client_side_id: Number, title: String, tasks: Array<Tasks> } } tableData 
 * @param { Callback } dispatchActionCallback 
 */
export function insertTable(appRoot, tableData, dispatchActionCallback) {
  const col = document.createElement("div");
  col.classList.add("kanban-table");
  const newTable = new Table(tableData, dispatchActionCallback);
  col.appendChild(newTable);
  appRoot.appendChild(col);
}
