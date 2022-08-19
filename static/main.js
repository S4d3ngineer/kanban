import Table from "./Table.js";
import { deepCopy, insertTable } from "./helpers.js";
import { makeInitializeTablesAction, makeInsertTableAction } from "./actions.js";
import { reducer } from "./reducer.js";

const appRoot = document.querySelector("#app");

function debounce(callback, delay = 5000) { // TODO move to helper along with other functions maybe? Like NewLoadTables dbGetData itp.
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  }
};

const saveChanges = debounce((data) => dbSaveData(data));

// Using Redux-like design pattern in designing store object
const store = {
  // _data: new Map(),
  // _observers: [], // List of subscribed observers

  newData: {
    tables: [],
    initialized: false,
  },

  newObservers: [],

  // Immidietly after subscribing callback will receive current store status
  newSubscribe(callback) {
    this.newObservers.push(callback);
    callback(this.newData);
  },

  newSetData(newData) {
    this.newData = deepCopy(newData);
    this.newObservers.forEach((observer) => {
      observer(this.newData);
    });
  },

  // Action contains its name and a payload
  /**
   *
   * @param { {type: Symbol, payload: obj} } action
   */
  // newDispatchAction(action) {
  //     switch(action.type) {
  //         case INITIALIZE_TABLES: {
  //             this.newSetData({
  //                 ...this.newData,
  //                 tables: action.payload,
  //                 initialized: true
  //             });
  //             break;
  //         }
  //         case ADD_TASK: {
  //             this.newSetData({
  //                 ...this.newData,
  //                 tables: deepCopy(this.newData.tables).map((table) => {
  //                     if (table.client_side_id === action.payload.tableId) {
  //                         // const newTaskId = getUniqueTaskId(this.newData);
  //                         const newTask = {
  //                             client_side_id: getUniqueTaskId(this.newData),
  //                             content: action.payload.content
  //                         }
  //                         table.tasks.push(newTask);
  //                     }
  //                     return table;
  //                 })
  //             });
  //             break;
  //         }
  //     }
  // },

  newDispatchAction(action) {
    const copy = deepCopy(this.newData);
    this.newData = reducer(copy, action);
    this.newObservers.forEach((observer) => {
      const updatedCopy = deepCopy(this.newData);
      observer(updatedCopy);
    });
  },

  // newDispatchAction: action => {
  //     const  = deepCopy(this.newData);
  //     this.newData = reducer()
  // },

  // getData() {
  //   return this._data;
  // },

  // getTableData(key) {
  //   return this._data.get(key);
  // },

  // setTableData(key, value) {
  //   // TODO if key doesn't exist call new Table ??
  //   this._data.set(key, value);
  //   const tableObserver = this._observers.filter(
  //     (observer) => observer.tableId === key
  //   )[0];

  //   if (tableObserver) {
  //     tableObserver.callback(this._data);
  //     debounce(() => this.saveData(), "saveDataTimer");
  //   }
  // },

  // // Each table can be a subject to changes so each Table object needs to be subscribed!
  // subscribe(tableId, callback) {
  //   this._observers.push({ tableId, callback });
  // },

  // async saveData() {
  //   const data = [];
  //   this._data.forEach((content, id) => {
  //     const tableObject = {
  //       client_side_id: id,
  //       title: content.title,
  //       tasks: content.tasks,
  //     };
  //     data.push(tableObject);
  //   });
  //   const response = await fetch("/update_user_data", {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   response.ok
  //     ? console.log("PUT has succeed")
  //     : console.log("PUT has failed");
  //   const json = await response.json();
  // },

  // TODO should I have declared it outside of the store? or toss it out completly?
  // async deleteTable(tableId) {
  //   const response = await fetch("http://127.0.0.1:5000/delete_table", {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(tableId),
  //   });
  //   response.ok
  //     ? console.log("DELETE has succeed")
  //     : console.log("DELETE has failed");
  //   const json = await response.json();
  //   console.log(json);
  //   // Re-render tables after adding new one
  //   await loadTables(store, json);
  //   return json;
  // },
};

// MAIN FN ------------------------------------------------

const tableReferences = []; // FIXME is it not used for sure?

if (appRoot) {
  // loadTables(store);
  // .then () => initialized = true;
  const addTableButton = document.querySelector("#add-table");
  // NOTE user can smash "add" before tables load and stuff happens
  store.newSubscribe((data) => {
    addTableButton.disabled = !data.initialized;
  });
  addTableButton.addEventListener("click", () => {
    if(store.newData.initialized) {
      store.newDispatchAction(makeInsertTableAction(appRoot, action => store.newDispatchAction(action)));
    };
  });

  newLoadTables();
  store.newSubscribe((data) => {
    if (data.initialized) {
      const existingTables = document.querySelectorAll(".kanban-table");
      existingTables.forEach((table) => table.remove());

      // do sth to render tables
      data.tables.forEach((table) => {
        // const col = document.createElement("div");
        // col.classList.add("container", "mb-2", "kanban-table");
        // const newTable = new Table(table, action =>
        //   store.newDispatchAction(action)
        // );
        // tableReferences.push(newTable);
        // col.appendChild(newTable);
        // appRoot.appendChild(col);
        insertTable(appRoot, table, action => store.newDispatchAction(action));
      });
    }
  });
  store.newSubscribe((data) => {
    if (data.initialized) {
      saveChanges(data.tables);
    }
  })
}

// -----------------------------------------------------

async function newLoadTables() {
  const tableData = await dbGetUserData();

  store.newDispatchAction(makeInitializeTablesAction(tableData));
}

// async function loadTables(store, data) {
//   let tablesData;
//   data === undefined
//     ? (tablesData = await dbGetUserData())
//     : (tablesData = data);

//   console.log("tablesData:");
//   console.log(tablesData);
//   tablesData.forEach((tableData) => {
//     const tableObject = {
//       title: tableData.title,
//       tasks: tableData.tasks,
//     };
//     store.setTableData(tableData.client_side_id, tableObject);
//     const col = document.createElement("div");
//     col.classList.add("container", "mb-2", "kanban-table");
//     const table = new Table(store, tableData.client_side_id);
//     col.appendChild(table);
//     appRoot.appendChild(col);
//   });
//   console.log(store._data);
//   console.log(store._observers);
// }

async function dbGetUserData() {
  const response = await fetch("http://127.0.0.1:5000/get_user_data");
  return response.json();
}

async function dbSaveData(data) {
  const response = await fetch("http://127.0.0.1:5000/update_user_data", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
    
  })
  
  response.ok
   ? console.log("PUT has succeed")
   : console.log("PUT has failed");

  // const data = [];
  // this._data.forEach((content, id) => {
  //   const tableObject = {
  //     client_side_id: id,
  //     title: content.title,
  //     tasks: content.tasks,
  //   };
  //   data.push(tableObject);
  // });
  // const response = await fetch("/update_user_data", {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(data),
  // });
  // response.ok
  //   ? console.log("PUT has succeed")
  //   : console.log("PUT has failed");
  // const json = await response.json();
}

// ########################################################################

// async function dbGetTables() {
//     const response = await fetch('http://127.0.0.1:5000/get_tables');
//     const json = await response.json()
//     return(json);
// }

// async function dbGetItems() {
//     return;
// }

// It is called after loadTables so data will already be in store
// function insertTable() {
//   const newTable = new Table(store);
//   const newTableObject = {
//     client_side_id: newTable._id,
//     title: newTable._title,
//     tasks: [],
//   };
//   store.setTableData(newTable._id, newTableObject);
//   const col = document.createElement("div");
//   col.classList.add("container", "mb-2", "kanban-table");
//   col.appendChild(newTable);
//   appRoot.appendChild(col);
// }
