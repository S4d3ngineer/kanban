import Table from "./Table.js";
import Toast from "./Toast.js";

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Generates unique id for the task
 * 
 * @param { Array<Tables> } tablesData 
 * @returns { id: Number }
 */
export function getUniqueTaskId(tablesData) {
  const idList = tablesData
    .map((table) => table.tasks)
    .reduce((allTasks, tableTasks) => [...allTasks, ...tableTasks], [])
    .map((task) => task.client_side_id);

  let id;
  do {
    id = makeId();
  } while (idList.includes(id));
  return id;
}

/** Generates unique id for the table
 * 
 * @param { Array<Tables> } tablesData 
 * @returns { id: Number }
 */
export function getUniqueTableId(tablesData) {
  const idList = tablesData.map((table) => table.client_side_id);

  let id;
  do {
    id = makeId();
  } while (idList.includes(id));
  return id;
}

/**
 * 
 * @returns { Number }
 */
function makeId() {
  // Postgres integer datatype is 4 bytes and it is signed, thus max is:
  const maxPositiveInteger = 2 ** (4 * 8 - 1) - 1;
  const idFloat = Math.random() * maxPositiveInteger;
  return Math.round(idFloat);
}

/** Creates new table object and inserts it into DOM
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


/**
 * 
 * @param { String } type 
 * @param { String } message 
 */
export function insertToast(type, message) { // TODO add jdocs
  const toastRoot = document.querySelector("#custom-toast-container");
  const newToast = new Toast(type, message);
  newToast.classList.add(type);
  toastRoot.prepend(newToast);

  newToast.addEventListener('click', newToast.remove);
  // Remove the toast after 10 seconds
  if (type !== "warning") {
    setTimeout(() => newToast.remove(), 10000);
  }
}

/** 
 * 
 * @param { Callback } callback function to use debounce on
 * @param { Number } delay ms
 * @returns 
 */
function debounce(callback, delay = 5000) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  }
};

// ------------------------ API CALLS --------------------------
export const saveChanges = debounce((data) => dbSaveData(data));

/** Fetches current logged user data from database
 * 
 * @returns 
 */
export async function dbGetUserData() {
  const response = await fetch((window.location.origin + "/get_user_data"));
  return response.json();
}

/** Makes request to write current the store data to database
 * 
 * @param { Array<Tables> } data 
 */
async function dbSaveData(data) {
  const response = await fetch((window.location.origin + "/update_user_data"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  document.querySelector(".warning")?.remove();
  
   if (response.ok) {
    console.log("PUT has succeed");
    insertToast("success", "Data has been saved successfuly!");
   } else {
   console.log("PUT has failed");
    insertToast("failure", "Data saving resulted in failure.");
  }
}