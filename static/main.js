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
  newDispatchAction(action) {
    const copy = deepCopy(this.newData);
    this.newData = reducer(copy, action);
    this.newObservers.forEach((observer) => {
      const updatedCopy = deepCopy(this.newData);
      observer(updatedCopy);
    });
  },
};

// MAIN FN ------------------------------------------------

if (appRoot) {
  // loadTables(store);
  // .then () => initialized = true;
  const addTableButton = document.querySelector("#add-table");
  // Preventing user from smashing "add" before tables load
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
}