import TaskTracker from "../js/TaskTracker";

// taskTracker.test.js

describe("TaskTracker", () => {
  let taskTracker;
  let mockDocument;

  // Mock DOM elements and functions before each test
  beforeEach(() => {
    // Mock DOM elements
    mockDocument = {
      search: document.createElement("input"),
      error: document.createElement("div"),
      pinnedTasks: document.createElement("div"),
      allTasks: document.createElement("div"),
      noPinned: document.createElement("div"),
      noTasks: document.createElement("div"),
    };

    // Mock getElementById
    document.getElementById = jest.fn((id) => {
      switch (id) {
        case "search":
          return mockDocument.search;
        case "error":
          return mockDocument.error;
        case "pinned-tasks":
          return mockDocument.pinnedTasks;
        case "all-tasks":
          return mockDocument.allTasks;
        case "no-pinned":
          return mockDocument.noPinned;
        case "no-tasks":
          return mockDocument.noTasks;
        default:
          return null;
      }
    });

    // Initialize TaskTracker
    taskTracker = new TaskTracker();

    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("initialization", () => {
    test("should initialize with empty tasks array", () => {
      expect(taskTracker.tasks).toEqual([]);
    });

    test("should set up all DOM element references", () => {
      expect(taskTracker.searchInput).toBeDefined();
      expect(taskTracker.errorElement).toBeDefined();
      expect(taskTracker.pinnedTasksContainer).toBeDefined();
      expect(taskTracker.allTasksContainer).toBeDefined();
      expect(taskTracker.noPinned).toBeDefined();
      expect(taskTracker.noTasks).toBeDefined();
    });
  });

  describe("showError", () => {
    test("should show and then hide error message after timeout", () => {
      taskTracker.showError();

      // Проверяем, что ошибка показана
      expect(taskTracker.errorElement.style.display).toBe("block");

      // Продвигаем таймеры на 2000мс
      jest.advanceTimersByTime(2000);

      // Проверяем, что ошибка скрыта
      expect(taskTracker.errorElement.style.display).toBe("none");
    });
  });

  describe("handleAddTask", () => {
    test("should add task on Enter key press with valid input", () => {
      const event = new KeyboardEvent("keypress", { key: "Enter" });
      taskTracker.searchInput.value = "New task";

      taskTracker.handleAddTask(event);

      expect(taskTracker.tasks).toHaveLength(1);
      expect(taskTracker.tasks[0].text).toBe("New task");
      expect(taskTracker.searchInput.value).toBe("");
      expect(taskTracker.errorElement.style.display).toBe("none");
    });

    test("should show error on empty input and hide it after timeout", () => {
      const event = new KeyboardEvent("keypress", { key: "Enter" });
      taskTracker.searchInput.value = "   ";

      taskTracker.handleAddTask(event);

      expect(taskTracker.tasks).toHaveLength(0);
      expect(taskTracker.errorElement.style.display).toBe("block");

      // Продвигаем таймеры на 2000мс
      jest.advanceTimersByTime(2000);

      // Проверяем, что ошибка скрыта
      expect(taskTracker.errorElement.style.display).toBe("none");
    });

    test("should not add task on non-Enter key press", () => {
      const event = new KeyboardEvent("keypress", { key: "a" });
      taskTracker.searchInput.value = "New task";

      taskTracker.handleAddTask(event);

      expect(taskTracker.tasks).toHaveLength(0);
    });
  });

  describe("addTask", () => {
    test("should add a new task to tasks array", () => {
      taskTracker.addTask("Test task");
      expect(taskTracker.tasks).toHaveLength(1);
      expect(taskTracker.tasks[0].text).toBe("Test task");
      expect(taskTracker.tasks[0].pinned).toBe(false);
    });

    test("should generate unique IDs for tasks", () => {
      const dateSpy = jest.spyOn(Date, "now");
      dateSpy.mockReturnValueOnce(123);
      dateSpy.mockReturnValueOnce(456);

      taskTracker.addTask("Task 1");
      taskTracker.addTask("Task 2");

      expect(taskTracker.tasks[0].id).toBe(123);
      expect(taskTracker.tasks[1].id).toBe(456);

      dateSpy.mockRestore();
    });
  });

  describe("filterTasks", () => {
    beforeEach(() => {
      taskTracker.tasks = [
        { id: 1, text: "Task 1", pinned: false },
        { id: 2, text: "Task 2", pinned: true },
        { id: 3, text: "Another task", pinned: false },
      ];
    });

    test("should filter tasks based on search input", () => {
      taskTracker.searchInput.value = "task 1";
      taskTracker.filterTasks();

      expect(taskTracker.allTasksContainer.innerHTML).toContain("Task 1");
      expect(taskTracker.allTasksContainer.innerHTML).not.toContain(
        "Another task",
      );
    });

    test("should show pinned tasks separately", () => {
      taskTracker.filterTasks();

      expect(taskTracker.pinnedTasksContainer.innerHTML).toContain("Task 2");
      expect(taskTracker.allTasksContainer.innerHTML).not.toContain("Task 2");
    });

    test('should show/hide "no tasks" messages appropriately', () => {
      taskTracker.tasks = [];
      taskTracker.filterTasks();

      expect(taskTracker.noPinned.style.display).toBe("block");
      expect(taskTracker.noTasks.style.display).toBe("block");
    });
  });

  describe("handlePin", () => {
    beforeEach(() => {
      taskTracker.tasks = [{ id: 1, text: "Task 1", pinned: false }];
    });

    test("should toggle pin status of task", () => {
      const mockEvent = {
        target: {
          classList: {
            contains: () => true,
          },
          dataset: {
            id: "1",
          },
        },
      };

      taskTracker.handlePin(mockEvent);
      expect(taskTracker.tasks[0].pinned).toBe(true);

      taskTracker.handlePin(mockEvent);
      expect(taskTracker.tasks[0].pinned).toBe(false);
    });

    test("should not modify tasks when clicking non-pin elements", () => {
      const mockEvent = {
        target: {
          classList: {
            contains: () => false,
          },
        },
      };

      taskTracker.handlePin(mockEvent);
      expect(taskTracker.tasks[0].pinned).toBe(false);
    });
  });

  describe("createTaskHTML", () => {
    test("should create correct HTML for unpinned task", () => {
      const task = { id: 1, text: "Test task", pinned: false };
      const html = taskTracker.createTaskHTML(task);

      expect(html).toContain("Test task");
      expect(html).toContain('data-id="1"');
      expect(html).not.toContain('class="pin-btn pinned"');
    });

    test("should create correct HTML for pinned task", () => {
      const task = { id: 1, text: "Test task", pinned: true };
      const html = taskTracker.createTaskHTML(task);

      expect(html).toContain("Test task");
      expect(html).toContain('data-id="1"');
      expect(html).toContain('class="pin-btn pinned"');
    });
  });
});
