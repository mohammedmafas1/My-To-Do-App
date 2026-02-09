const todoapp = document.querySelector('.todoapp');
const addTaskBtn = document.querySelector('#addTaskBtn');
const taskList = document.querySelector('.task-list');
const createTaskBtn = document.querySelector('#createTaskBtn');
const timeWrapper = document.querySelectorAll('.time-box-wrapper input');
const taskPanel = document.querySelector('.add-task-panel');
const closePanel = document.querySelector('.close-panel');
const searchInputBox = document.querySelector('#searchInputBox');
const themeBtn = document.querySelector('#themeBtn');

// set theme function 
const setTheme = (theme) => {
    if(theme === 'dark'){
        document.body.classList.add('dark-theme');
        themeBtn.querySelector('span').classList.replace('bxs-moon', 'bxs-sun')
    }else{
        document.body.classList.remove('dark-theme');
        themeBtn.querySelector('span').classList.replace('bxs-sun', 'bxs-moon');
    }
    localStorage.setItem('theme', theme);
}

// toggle theme function 
const toggleTheme = () => {
    const isDark = document.body.classList.contains('dark-theme');
    setTheme(isDark ? 'light' : 'dark');
}

themeBtn.addEventListener('click', toggleTheme);




const todoList = [];
let isEditedIndex = null;

// add the stored task to todolist array when document loads 
document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme') ?? 'dark';
    setTheme(theme);
    const storedTodo = JSON.parse(localStorage.getItem('todolist'));
    if (storedTodo) {
        todoList.push(...storedTodo);
    }
    updateTask();
})

// save task in local storeage 
const saveTask = () => {
    localStorage.setItem('todolist', JSON.stringify(todoList));
}

// add task panel 
addTaskBtn.addEventListener('click', () => {
    taskPanel.classList.add('active');
    if (taskPanel.classList.contains('active')) {
        todoapp.classList.add('hidetodoapp');
    }
})

// close panel 
closePanel.addEventListener('click', () => {
    taskPanel.classList.remove('active');
    todoapp.classList.remove('hidetodoapp');
});


// format 24h time to 12h am and pm 
const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = Number(hours);
    const isAM_PM = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // if come falsy value it will be assign next value
    return `${hour12}:${minutes} ${isAM_PM}`;
}

// check task completed or not 
const toggleTaskComplete = (index) => {
    todoList[index].completed = !todoList[index].completed;
    updateTask();
    saveTask();
}

// delete task 
const deleteTask = (index) => {
    if (!todoList[index].completed) {
        alert('please select to delete the task');
        return;
    }
    todoList.splice(index, 1);
    updateTask();
    saveTask();
    searchTasks();
}

// edit task 
const editTask = (index) => {
    const inputBox = document.querySelector('#addTaskInputBox');
    const [startTime, endTime] = timeWrapper;
    inputBox.value = todoList[index].task;
    startTime.value = todoList[index].startTime;
    endTime.value = todoList[index].endTime;
    isEditedIndex = index;
    createTaskBtn.textContent = "Update Task";
    taskPanel.classList.add('active');
    todoapp.classList.add('hidetodoapp');
}

// clear inputs 
const clearInputs = () => {
    const inputBox = document.querySelector('#addTaskInputBox');
    const [startTime, endTime] = timeWrapper;
    inputBox.value = '';
    startTime.value = '';
    endTime.value = '';
    createTaskBtn.textContent = 'Create task';
}

// create task 
const createTask = () => {
    const inputBox = document.querySelector('#addTaskInputBox');
    const [startTime, endTime] = timeWrapper;

    if (inputBox.value === '') {
        alert('please add a new task');
        return;
    }

    if (!startTime || !endTime) {
        alert('plese select both start and end time');
        return;
    }

    if (endTime.value <= startTime.value) {
        alert('end time must be after start time');
        return;
    }

    if (isEditedIndex !== null) {
        todoList[isEditedIndex] = {
            id: todoList[isEditedIndex].id, //keep same id
            task: inputBox.value.trim(),
            startTime: startTime.value,
            endTime: endTime.value,
            completed: todoList[isEditedIndex].completed
        };
        // reset editing process 
        isEditedIndex = null;
    } else {
        todoList.push({
            id: Date.now(),
            task: inputBox.value.trim(),
            startTime: startTime.value,
            endTime: endTime.value,
            completed: false
        });
    }

    clearInputs();
    taskPanel.classList.remove('active');
    todoapp.classList.remove('hidetodoapp');
    currentTime();
    saveTask();
    searchInputBox.value = '';
    updateTask();
}

// create task 
createTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();
    createTask();
});

// update task 
const updateTask = (tasksToDisplay = null) => {
    taskList.innerHTML = '';
    // if no tasks are passed 
    const displayTask = tasksToDisplay || todoList.map((task, index) => ({ task, originalIndex: index }));
    if (displayTask.length === 0) {
        const searchQuery = searchInputBox.value.trim();
        if (searchQuery !== '') {
            taskList.innerHTML = ` <li style="text-align: center;">
                                    <img src="./src/img/no-results.png" width="200px" height="200px" alt=""/>
                                    <p style="font-size: 1.5rem; color: #8b8b8b;">no task found for "${searchQuery}"</p>
                                </li>`;
        } else {
            taskList.innerHTML = `<li style="text-align: center;">
                                    <img src="./src/img/no-results.png" width="200px" height="200px" alt=""/>
                                    <p style="font-size: 1.5rem; color: #8b8b8b;">It seems there are no task added yet. Add one!</p>
                                </li>`;
        }
        return;
    }

    displayTask.forEach((taskItem) => {
        // extract the task object and its orginal index 
        const task = taskItem.task;
        const originalIndex = taskItem.originalIndex;
        const li = document.createElement('li');
        li.dataset.index = originalIndex; // add data-index and store its index into it
        li.innerHTML = `<div class="task-item ${task.completed ? 'completed' : ''}">
                            <div class="task-content">
                                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}/>
                                <div class="task">
                                    <p class="taskcontent">${task.task}</p>
                                    <p class="time">${formatTime(task.startTime)} - ${formatTime(task.endTime)}</p>
                                </div>
                            </div>
                            <div class="task-icons">
                                <button class="edit-task">
                                    <span class="bx bxs-edit"></span>
                                </button>
                                <button class="delete-task">
                                    <span class="bx bxs-trash"></span>
                                </button>
                            </div>
                        </div>`;

        // for long content hide and read more button set up        
        const maxLength = 50;
        const p = li.querySelector('.taskcontent');
        const fullText = task.task;

        if (fullText.length > maxLength) {
            let isExpended = false;
            p.textContent = fullText.slice(0, maxLength);
            const readMoreBtn = document.createElement('a');
            readMoreBtn.textContent = 'Read more';
            readMoreBtn.href = '#';
            readMoreBtn.className = 'readmoreBtn';
            // readMoreBtn.href = 'javascript:void(0)'; // prevent page jumbs

            readMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // prevent event bubbling

                if (!isExpended) {
                    p.textContent = fullText;
                    readMoreBtn.textContent = 'show less';
                } else {
                    p.textContent = fullText.slice(0, maxLength);
                    readMoreBtn.textContent = 'Read more';
                }
                isExpended = !isExpended;
            });
            p.after(readMoreBtn); // place a tag beside p
            // li.querySelector('.task').appendChild(readMoreBtn);
        } else {
            p.textContent = fullText;
        }

        // when checkbox changes togglecomplete function calls 
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskComplete(originalIndex));

        const editBtn = li.querySelector('.edit-task');
        const deleteBtn = li.querySelector('.delete-task');
        editBtn.addEventListener('click', () => editTask(originalIndex));
        deleteBtn.addEventListener('click', () => deleteTask(originalIndex));

        taskList.append(li);
    });
}

// search task 
const searchTasks = () => {
    const searchQuery = searchInputBox.value.trim().toLowerCase();
    if (searchQuery === '') {
        updateTask();
        return;
    }

    // filter tasks that match the search query
    const filteredTasks = todoList
        .map((task, index) => ({ task, originalIndex: index }))
        .filter(item => item.task.task.toLowerCase().includes(searchQuery)); // filter by task
    updateTask(filteredTasks);
}

// search task calls when inputs 
searchInputBox.addEventListener('input', () => {
    searchTasks();
});

// search task calls to clear search keywords when keyup 
searchInputBox.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
        searchInputBox.value = '';
        searchTasks();
    }
});


// set default time inputs to current time  
const currentTime = () => {
    const time = new Date();
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    timeWrapper.forEach(input => {
        input.value = `${hours}:${minutes}`;
    });
}
currentTime();