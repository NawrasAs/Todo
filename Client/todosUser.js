const form = document.querySelector("[data-form]");
const lists = document.querySelector("[data-lists]");
const input = document.querySelector("[data-input]");
const logoutButton = document.querySelector("[data-logout]");

let todoArr = [];
const userData = sessionStorage.getItem('userData');

if (userData) {
    // Parse user data from JSON string
    const ud = JSON.parse(userData);
    const userName = ud.userName;
    const userEmail = ud.email;

    window.addEventListener("DOMContentLoaded", async () => {
        todoArr = await fetchTodoData(userEmail);
        console.log('Loaded todos:', todoArr);
        UI.displayData();
        UI.registerRemoveTodo();
        UI.registerEditTodo();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const todo = new Todo(input.value);
        todoArr.push(todo);
        console.log('Adding todo:', todo);
        await updateTodoData(userEmail, todoArr);
        console.log('Updated todos:', todoArr);
        UI.displayData();
        UI.clearInput();
    });

    logoutButton.addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = 'LoginUser.html';
        alert("Logged out successfully");
    });

    async function fetchTodoData(userEmail) {
        try {
            const response = await fetch(`/todos?email=${encodeURIComponent(userEmail)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const todos = await response.json();
                console.log('Fetched todos from server:', todos);
                return todos;
            } else {
                console.error('Failed to fetch todo data:', response.statusText);
                return [];
            }
        } catch (error) {
            console.error('Error fetching todo data:', error);
            return [];
        }
    }

    async function updateTodoData(userEmail, todoArr) {
        try {
            const response = await fetch(`/todos/${userEmail}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(todoArr)
            });
            if (!response.ok) {
                console.error('Failed to update todo data:', response.statusText);
            } else {
                console.log('Successfully updated todos on server');
            }
        } catch (error) {
            console.error('Error updating todo data:', error);
        }
    }

    class Todo {
        constructor(todo){
            this.todo = todo;
        }
    }

    class UI {
        static displayData(){
            console.log('Displaying data:', todoArr);
            let displayData = todoArr.map((item, index) => {
                return `
                    <div class="todo">
                        <p>${index + 1}. ${item.todo}</p>
                        <span class="edit" data-index=${index}>✏️</span>
                        <span class="remove" data-index=${index}>🗑️</span>
                    </div>
                `;
            });
            lists.innerHTML = displayData.join("");
        }

        static clearInput(){
            input.value = "";
        }

        static registerRemoveTodo(){
            lists.addEventListener("click", async (e) => {
                if(e.target.classList.contains("remove")){
                    let index = e.target.dataset.index;
                    console.log('Removing todo at index:', index);
                    todoArr.splice(index, 1);
                    await updateTodoData(userEmail, todoArr);
                    UI.displayData();
                }
            });
        }

        static registerEditTodo() {
            lists.addEventListener("click", (e) => {
                if (e.target.classList.contains("edit")) {
                    let index = e.target.dataset.index;
                    console.log('Editing todo at index:', index);
                    let newTodo = prompt("Edit your todo:", todoArr[index].todo);
                    if (newTodo !== null && newTodo.trim() !== "") {
                        todoArr[index].todo = newTodo.trim();
                        updateTodoData(userEmail, todoArr);
                        UI.displayData();
                    }
                }
            });
        }
    }
} else {
    window.location.href = 'LoginUser.html';
}
