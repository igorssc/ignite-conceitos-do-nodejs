const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id: idTodo } = request.params;

  const todo = user.todos.find((todo) => todo.id === idTodo);

  if (!todo) {
    response.status(404).json({ error: "Todo not found" });
  }

  request.todo = todo;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (!(name && username)) {
    response.status(400).json({ error: "User or username not informed" });
  }

  const exixstsUser = users.some((user) => user.username === username);

  exixstsUser && response.status(400).json({ error: "User already exixsts" });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  if (!(title && deadline)) {
    response.status(400).json({ error: "Title or deadline not informed" });
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  response.status(201).send(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { title, deadline } = request.body;

    if (!(title && deadline)) {
      response.status(400).json({ error: "Title or deadline not informed" });
    }

    const { todo } = request;

    todo.title = title;
    todo.deadline = deadline;

    response.status(200).send(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { todo } = request;

    todo.done = true;

    response.status(200).send(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { user, todo } = request;

    user.todos.splice(todo, 1);

    response.status(204).send();
  }
);

module.exports = app;
