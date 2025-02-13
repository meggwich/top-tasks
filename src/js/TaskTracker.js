export default class TaskTracker {
  constructor() {
    this.tasks = [];
    this.searchInput = document.getElementById("search");
    this.errorElement = document.getElementById("error");
    this.pinnedTasksContainer = document.getElementById("pinned-tasks");
    this.allTasksContainer = document.getElementById("all-tasks");
    this.noPinned = document.getElementById("no-pinned");
    this.noTasks = document.getElementById("no-tasks");

    this.initialize();
  }

  initialize() {
    this.searchInput.addEventListener(
      "keypress",
      this.handleAddTask.bind(this),
    );
    this.searchInput.addEventListener("input", () => this.filterTasks());
    this.pinnedTasksContainer.addEventListener(
      "click",
      this.handlePin.bind(this),
    );
    this.allTasksContainer.addEventListener("click", this.handlePin.bind(this));
    this.filterTasks();
  }

  handleAddTask(e) {
    if (e.key === "Enter") {
      const text = this.searchInput.value.trim();
      if (!text) {
        this.showError();
        return;
      }
      this.addTask(text);
      this.searchInput.value = "";
      this.errorElement.style.display = "none";
      this.filterTasks();
    }
  }

  showError() {
    this.errorElement.style.display = "block";
    setTimeout(() => {
      this.errorElement.style.display = "none";
    }, 2000);
  }

  addTask(text) {
    this.tasks.push({
      id: Date.now(),
      text,
      pinned: false,
    });
  }

  filterTasks() {
    const searchText = this.searchInput.value.toLowerCase();
    const pinnedTasks = this.tasks.filter((t) => t.pinned);
    const filteredTasks = this.tasks.filter(
      (t) => !t.pinned && t.text.toLowerCase().includes(searchText),
    );

    this.renderTasks(pinnedTasks, filteredTasks);
  }

  handlePin(e) {
    if (e.target.classList.contains("pin-btn")) {
      const taskId = parseInt(e.target.dataset.id);
      const task = this.tasks.find((t) => t.id === taskId);
      task.pinned = !task.pinned;
      this.filterTasks();
    }
  }

  renderTasks(pinnedTasks, filteredTasks) {
    this.pinnedTasksContainer.innerHTML = pinnedTasks
      .map((t) => this.createTaskHTML(t))
      .join("");

    this.allTasksContainer.innerHTML = filteredTasks
      .map((t) => this.createTaskHTML(t))
      .join("");

    this.noPinned.style.display = pinnedTasks.length ? "none" : "block";
    this.noTasks.style.display = filteredTasks.length ? "none" : "block";
  }

  createTaskHTML(task) {
    return `
            <div class="task-item">
                ${task.text}
                <button class="pin-btn ${task.pinned ? "pinned" : ""}" 
                        data-id="${task.id}"></button>
            </div>
        `;
  }
}
