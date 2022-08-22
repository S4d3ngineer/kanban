import {
  makeAddTaskAction,
  makeDeleteTableAction,
  makeDeleteTaskAction,
  makeEditTableTitleAction,
  makeEditTaskAction,
  makeMoveTaskAction,
} from "./actions.js";

export default class Table extends HTMLElement {
  constructor(data, dispatchActionCallback) {
    super();

    this._id = data.client_side_id;
    this._title = data.title;
    this._dispatchAction = dispatchActionCallback;

    // Adding listeneres for drag & drop functionality
    this.addEventListener("dragover", (e) => e.preventDefault());
    this.addEventListener("drop", this.handleDrop);

    // Keeps my styles separate from outside of the component in order to avoid naming conflicts
    this._shadow = this.attachShadow({ mode: "open" });
    this.setList(data.tasks);
  }

  getList() {
    return this._list;
  }

  setList(updatedList) {
    this._list = [...updatedList];
    this.render();
  }

  // Fires when Table component is inserted into dom
  connectedCallback() {
    this.render();
  }

  handleNewTask = (input) => (e) => {
    if (e.key === "Enter" && input.value) {
      this._dispatchAction(makeAddTaskAction(this._id, input.value));
    }
  };

  adjustTextAreaHeight = (input) => () => {
    input.style.height = input.scrollHeight + "px";
  };

  editTableTitle = (input) => (e) => {
    if (
      (e.key === "Enter" && input.value) ||
      (e.type === "blur" && input.value !== this._title) // FIXME edittable fires twice because of re rendering which fires blur(?)
    ) {
      this._dispatchAction(makeEditTableTitleAction(this._id, input.value));
    }
  };

  editTask = (input, taskData) => (e) => {
    // If task editing was finished dispatch action in order to alter store data
    if (
      (e.key === "Enter" && input.value) ||
      (e.type === "blur" && input.value !== taskData.content)
    ) {
      const newContent = input.value;
      this._dispatchAction(
        makeEditTaskAction(taskData.client_side_id, newContent)
      );
    }
  };

  deleteTask = (task) => () => {
    this._dispatchAction(makeDeleteTaskAction(this._id, task.client_side_id));
  };

  deleteTable = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this table and all of its tasks?"
      )
    ) {
      this._dispatchAction(makeDeleteTableAction(this._id));
    }
  };

  handleDragStart = (task) => (e) => {
    const draggedElement = e.srcElement;
    setTimeout(() => draggedElement.classList.add("dragging"), 0);
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ sourceTableId: this._id, task: task })
    );
  };

  handleDragEnd() {
    this.classList.remove("dragging");
  }

  handleDrop(e) {
    // Receiving data set during dragStart event
    const transferedDataJson = e.dataTransfer.getData("text/plain");
    const { sourceTableId, task } = JSON.parse(transferedDataJson);
    const dropPosition = this.getDropPosition(e);
    this._dispatchAction(
      makeMoveTaskAction(sourceTableId, this._id, dropPosition, task)
    );
  }

  getDropPosition(e) {
    const dropzoneTasks = [
      ...this._shadow.querySelectorAll(".task:not(.add-task)"),
    ];
    const dropY = e.clientY;
    const closest = dropzoneTasks.reduce(
      (closest, current, idx) => {
        const rect = current.getBoundingClientRect();
        const taskCenterY = rect.top + rect.height / 2;
        const distance = dropY - taskCenterY;
        return distance > 0 && distance < closest.distance
          ? { distance, idx: idx + 1 }
          : closest;
      },
      { distance: Number.POSITIVE_INFINITY, idx: 0 }
    );
    return closest.idx;
  }

  // Caling this function renders table with its elements in the app
  render() {
    // Creating table root
    this._shadow.innerHTML = `
      <div class="table"></div>
    `;
    const table = this._shadow.querySelector(".table");

    const style = document.createElement("style");
    style.textContent = `
      .table {
        font-family: Roboto, sans-serif;
        display: inline-flex;
        flex-direction: column;
        row-gap: 8px;
        font-family: Roboto, sans-serif;
        background-color: #212529;
        padding: 8px;
        margin: 0px 10px;
        border-radius: 10px;
      
        min-width: 250px;
        max-width: 350px;
      }

      .text-area {
        box-sizing: border-box;
        font-family: Roboto, sans-serif;
        padding: 4px;
        border: none;
        resize: none;
        overflow: hidden;
      }
      
      .title-div {
        display: flex;
        margin-bottom: 10px;
      }

      .table-title {
        align-self: center;
        font-size: 1.25rem;
        color: #f8f9fa;
        background: transparent;
        height: 2rem;
      }
      
      .delete-table {
        background-color: transparent;
        color: #f8f9fa;
        font-size: 0.8rem;
        padding: 0px 5px;
        margin: 0px 5px 0px 6px;
        border-style: solid;
        border-color: #f8f9fa;
        border-radius: 5px;
        opacity: 0;
        cursor: pointer;
      }
      
      .task-div {
        display: flex;
        background-color: #f8f9fa;
        padding: 4px;
        border-radius: 4px;
      }

      .title-div:hover .delete-table {
        opacity: 1;
      }
      
      .task {
        background-color: #f8f9fa;
        padding: 4px;
        border-radius: 4px;
        cursor: grab;
        width: 100%;
        height: 1rem;
      }
      
      .task:focus {
        cursor: text;
      }
      
      .add-task {
        background-color: #f8f9fa;
        padding: 4px;
        border-radius: 4px;
        height: 1.5rem;
      }
      
      .dragging {
        display: none;
      }
      
      .delete-task {
        background-color: transparent;
        font-size: 0.8rem;
        padding: 0px 4px;
        margin: 0px 5px 0px 3px;
        border-radius: 5px;
        opacity: 0;
      }
      
      .task-div:hover .delete-task {
        opacity: 1;
        cursor: pointer;
      }
    `;
    this._shadow.appendChild(style);

    // Creating title element
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("title-div");
    const title = document.createElement("textarea");
    title.classList.add("table-title", "text-area");
    title.value = this._title;
    title.maxLength = 50;
    title.spellcheck = false;
    title.addEventListener("input", this.adjustTextAreaHeight(title));
    title.addEventListener("keydown", this.editTableTitle(title));
    title.addEventListener("blur", this.editTableTitle(title));
    titleDiv.appendChild(title);
    const deleteTableButton = document.createElement("button");
    deleteTableButton.classList.add("delete-table");
    deleteTableButton.type = "button";
    deleteTableButton.innerHTML = "<b>x</b>";
    deleteTableButton.addEventListener("click", this.deleteTable);
    titleDiv.appendChild(deleteTableButton);
    table.appendChild(titleDiv);

    // Rendering tasks
    this._list?.forEach((task) => {
      const taskDiv = document.createElement("div");
      taskDiv.classList.add("task-div");

      const newTaskElement = document.createElement("textarea");
      newTaskElement.classList.add("task", "text-area");
      newTaskElement.draggable = "true";
      newTaskElement.value = task.content;
      newTaskElement.maxLength = 100;
      newTaskElement.spellcheck = false;
      newTaskElement.addEventListener(
        "input",
        this.adjustTextAreaHeight(newTaskElement)
      );
      newTaskElement.addEventListener(
        "blur",
        this.editTask(newTaskElement, task)
      );
      newTaskElement.addEventListener(
        "keydown",
        this.editTask(newTaskElement, task)
      );
      newTaskElement.addEventListener("dragstart", this.handleDragStart(task));
      newTaskElement.addEventListener("dragend", this.handleDragEnd);
      taskDiv.appendChild(newTaskElement);

      // Adding delete button for every task
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-task");
      deleteButton.type = "button";
      deleteButton.innerHTML = "<b>x</b>";
      deleteButton.addEventListener("click", this.deleteTask(task));
      taskDiv.appendChild(deleteButton);

      table.appendChild(taskDiv);
    });

    // Creating input field with ability to insert new tasks
    const addTask = document.createElement("textarea");
    addTask.classList.add("add-task", "text-area");
    addTask.placeholder = "Add Task";
    addTask.maxLength = 100;
    addTask.addEventListener("blur", () => addTask.value = "");
    addTask.addEventListener("input", this.adjustTextAreaHeight(addTask));
    addTask.addEventListener("keydown", this.handleNewTask(addTask));
    table.appendChild(addTask);

    const renderedTasks = this._shadow.querySelectorAll(".task");
    renderedTasks.forEach(
      (task) => (task.style.height = task.scrollHeight + "px")
    );
  }
}

customElements.define("kanban-table", Table);