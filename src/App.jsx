import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/Card";
import { Button, Input } from "./components/Actions";
import { CheckSquare, Square, Trash2, Plus } from "lucide-react";

const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Home'
];

const TodoApp = () => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize state with localStorage data if available
  const [selectedDate, setSelectedDate] = useState(today);
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      // Filter out past dates
      const parsedTodos = JSON.parse(savedTodos);
      const filteredTodos = Object.entries(parsedTodos).reduce((acc, [date, tasks]) => {
        if (date >= today) {
          acc[date] = tasks;
        }
        return acc;
      }, {});
      return filteredTodos;
    }
    return {};
  });
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState('');

  // Save to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Calculate progress for current date
  const calculateProgress = (todos) => {
    if (!todos || todos.length === 0) return 0;
    const completed = todos.filter(todo => todo.completed).length;
    return Math.round((completed / todos.length) * 100);
  };

  const addTodo = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newTask.trim()) {
      setError('Please enter a task');
      return;
    }
    if (selectedDate < today) {
      setError('Cannot add tasks to past dates');
      return;
    }

    setTodos(prev => ({
      ...prev,
      [selectedDate]: [
        ...(prev[selectedDate] || []),
        {
          id: Date.now(),
          text: newTask,
          completed: false,
          category,
          createdAt: new Date().toISOString()
        }
      ]
    }));
    setNewTask('');
  };

  const toggleTodo = (todoId) => {
    setTodos(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  };

  const deleteTodo = (todoId) => {
    setTodos(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter(todo => todo.id !== todoId)
    }));
  };

  const currentTodos = todos[selectedDate] || [];
  const progress = calculateProgress(currentTodos);

  return (
<div className='my-10 mx-2'>
<Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>My ToDo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setError('');
            }}
            className="w-full p-2 border rounded"
          />

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 text-right">
            {progress}% Complete
          </div>

          <form onSubmit={addTodo} className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newTask}
                onChange={(e) => {
                  setNewTask(e.target.value);
                  setError('');
                }}
                placeholder="Enter a new task..."
                className="flex-1"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded px-2"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Button type="submit" className="bg-[#333]">
                <Plus className="w-4 h-4 text-[#fff]" />
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>

          <div className="space-y-2">
            {currentTodos.map(todo => (
              <div
                key={todo.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {todo.completed ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <span className={todo.completed ? "line-through text-gray-500" : ""}>
                    {todo.text}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {todo.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
</div>
  );
};

export default TodoApp;