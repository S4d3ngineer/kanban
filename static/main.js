import { deepCopy, insertTable, saveChanges, dbGetUserData, insertToast } from "./helpers.js";
import { makeCompleteInitializationAction, makeInitializeStoreAction, makeInsertTableAction } from "./actions.js";
import { reducer } from "./reducer.js";

const appRoot = document.querySelector("#app");

// Using Redux-like design pattern in designing store object
const store = {
  data: {
    tables: [],
    appInitialized: false,
  },

  Observers: [],

  // Immidietly after subscribing callback will receive current store status
  subscribe(callback) {
    this.Observers.push(callback);
    callback(this.data);
  },

  /** Dispatching new action based on its type and passing payload to reducer function
   *
   * @param { {type: Symbol, payload: obj} } action
   */
  dispatchAction(action) {
    const copy = deepCopy(this.data);
    this.data = reducer(copy, action);
    // Silent action doesn't trigger subscribed observers
    if (!action.silent) {
      this.Observers.forEach((observer) => {
        const updatedCopy = deepCopy(this.data);
        observer(updatedCopy);
      });
    }
  },
};

// Initialization of app
if (appRoot) {
  const addTableButton = document.querySelector("#add-table");
  // Preventing user from smashing "add" before tables load
  addTableButton.disabled = true;
  addTableButton.addEventListener("click", () => {
    if(store.data.appInitialized) {
      store.dispatchAction(makeInsertTableAction(appRoot, action => store.dispatchAction(action)));
    };
  });

  const tableData = await dbGetUserData();
  store.dispatchAction(makeInitializeStoreAction(tableData));

  // Currently each tables is re-rendered up writing data to store
  store.subscribe((data) => {
    const existingTables = document.querySelectorAll(".kanban-table");
    existingTables.forEach((table) => table.remove());

    data.tables.forEach((table) => {
      insertTable(appRoot, table, action => store.dispatchAction(action));
    });
  });

  store.subscribe((data) => {
    if (data.appInitialized) {
      const warningToast = document.querySelector(".warning");
      if (!warningToast) {
        insertToast("warning", "Content is about to be saved. Don't leave this page!");
      }
      saveChanges(data.tables);
    }
  });

  // Finalize app initialization
  addTableButton.disabled = false;
  store.dispatchAction(makeCompleteInitializationAction());
}