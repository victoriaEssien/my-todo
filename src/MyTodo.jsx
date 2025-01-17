import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/Card";
import { Button, Input } from "./components/Actions";
import { CheckSquare, Square, Trash2, Plus, X } from "lucide-react";
import { db } from "./firebase_setup/firebase";
import { useAuth } from "./hooks/useAuth";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";

const PRIORITY_LEVELS = {
  HIGH: { label: "High", color: "bg-red-100 text-red-800" },
  MEDIUM: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  LOW: { label: "Low", color: "bg-green-100 text-green-800" },
};

const MyTodo = () => {
  const today = new Date().toISOString().split("T")[0];
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(today);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [todos, setTodos] = useState({});
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [error, setError] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCategories(userData.categories || ['Work', 'Personal']);
          setCategory(userData.categories?.[0] || 'Work');
        }

        const todosDocRef = doc(db, 'todos', user.uid);
        const todosDoc = await getDoc(todosDocRef);
        
        if (todosDoc.exists()) {
          setTodos(todosDoc.data());
        } else {
          // Initialize todos document
          await setDoc(todosDocRef, {});
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load your todos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const calculateProgress = (todos) => {
    if (!todos || todos.length === 0) return 0;
    const completed = todos.filter((todo) => todo.completed).length;
    return Math.round((completed / todos.length) * 100);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim() || !user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        categories: arrayUnion(newCategory.trim())
      });
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory("");
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
    }
  };

  const removeCategory = async (categoryToRemove) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        categories: arrayRemove(categoryToRemove)
      });
      
      setCategories(prev => prev.filter(cat => cat !== categoryToRemove));
      if (category === categoryToRemove) {
        setCategory(categories[0] || "");
      }
    } catch (error) {
      console.error('Error removing category:', error);
      setError('Failed to remove category');
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    if (!newTask.trim()) {
      setError("Please enter a task");
      return;
    }
    if (selectedDate < today) {
      setError("Cannot add tasks to past dates");
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: newTask,
      completed: false,
      category,
      priority,
      createdAt: new Date().toISOString(),
      userId: user.uid
    };

    try {
      const todosDocRef = doc(db, 'todos', user.uid);
      const updatedTodos = {
        ...todos,
        [selectedDate]: [...(todos[selectedDate] || []), newTodo]
      };
      
      await setDoc(todosDocRef, updatedTodos);
      setTodos(updatedTodos);
      setNewTask("");
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo');
    }
  };

  const toggleTodo = async (todoId) => {
    if (!user) return;

    try {
      const todosDocRef = doc(db, 'todos', user.uid);
      const updatedTodos = {
        ...todos,
        [selectedDate]: todos[selectedDate].map(todo =>
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        )
      };
      
      await setDoc(todosDocRef, updatedTodos);
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (todoId) => {
    if (!user) return;

    try {
      const todosDocRef = doc(db, 'todos', user.uid);
      const updatedTodos = {
        ...todos,
        [selectedDate]: todos[selectedDate].filter(todo => todo.id !== todoId)
      };
      
      await setDoc(todosDocRef, updatedTodos);
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo');
    }
  };

  const currentTodos = todos[selectedDate] || [];
  const progress = calculateProgress(currentTodos);

  const getPriorityStyle = (priority) => {
    return PRIORITY_LEVELS[priority]?.color || PRIORITY_LEVELS.MEDIUM.color;
  };

  const getPriorityLabel = (priority) => {
    return PRIORITY_LEVELS[priority]?.label || PRIORITY_LEVELS.MEDIUM.label;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="my-10 mx-2">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My ToDo</CardTitle>
            <Button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Manage Categories
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setError("");
              }}
              className="w-full p-2 border rounded"
            />

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
              <div className="my-4">
                <Input
                  type="text"
                  value={newTask}
                  onChange={(e) => {
                    setNewTask(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter a new task..."
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border rounded px-2 w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="border rounded px-2"
                >
                  {Object.entries(PRIORITY_LEVELS).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="bg-[#333]">
                  <Plus className="w-4 h-4 text-[#fff]" />
                </Button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>

            <div className="space-y-2">
              {currentTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    className="text-blue-600 hover:text-blue-800 mt-1 flex-shrink-0"
                  >
                    {todo.completed ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`block break-words ${
                        todo.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {todo.text}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {todo.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${getPriorityStyle(
                          todo.priority
                        )}`}
                      >
                        {getPriorityLabel(todo.priority)}
                      </span>
                    </div>
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

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Manage Categories</h3>

            <form onSubmit={addCategory} className="flex gap-2 mb-4">
              <Input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category..."
                className="flex-1"
              />
              <Button type="submit" className="bg-[#333]">
                <Plus className="w-4 h-4 text-[#fff]" />
              </Button>
            </form>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              className="mt-4 w-full bg-[#333] text-white"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTodo;
