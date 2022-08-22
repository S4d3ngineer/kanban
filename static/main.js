import { deepCopy, insertTable, saveChanges, dbGetUserData, insertToast } from "./helpers.js";
import { makeInitializeTablesAction, makeInsertTableAction } from "./actions.js";
import { reducer } from "./reducer.js";

const appRoot = document.querySelector("#app");

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

  /** Dispatching new action based on its type and passing payload to reducer function
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

if (appRoot) {
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

  const tableData = await dbGetUserData();
  store.newDispatchAction(makeInitializeTablesAction(tableData));

  // Currently each tables is re-rendered up writing data to store
  store.newSubscribe((data) => {
    if (data.initialized) {
      const existingTables = document.querySelectorAll(".kanban-table");
      existingTables.forEach((table) => table.remove());

      data.tables.forEach((table) => {
        insertTable(appRoot, table, action => store.newDispatchAction(action));
      });
    }
  });

  store.newSubscribe((data) => {
    if (data.initialized) {
      const warningToast = document.querySelector(".warning");
      if (!warningToast) {
        insertToast("warning", "Content is about to be saved. Don't leave this page!");
      }
      saveChanges(data.tables);
    }
  })
}