// 2. src/components/MainApp.tsx
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, isToday } from "date-fns";
import { toast } from "react-toastify";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { Button } from "@/components/ui/button";

const familyMembers = ["Dad", "Mom", "Kid"];

export default function MainApp() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [form, setForm] = useState({
    name: "",
    description: "",
    priority: "normal",
    person: "",
  });

  useEffect(() => {
    const upcoming = tasks.find(task => isToday(new Date(task.date)));
    if (upcoming) {
      toast.info(`Reminder: ${upcoming.name} is scheduled for today!`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [tasks]);

  const addOrUpdateTask = () => {
    if (!selectedDate || !currentUser) return;
    const trimmedName = form.name.trim();
    if (!trimmedName) return toast.error("Please enter a task name.");

    if (editingTaskId !== null) {
      const updatedTasks = tasks.map(task =>
        task.id === editingTaskId ? { ...form, date: selectedDate, id: editingTaskId, person: currentUser } : task
      );
      setTasks(updatedTasks);
      setEditingTaskId(null);
    } else {
      const newTask = {
        ...form,
        name: trimmedName,
        date: selectedDate,
        id: Date.now(),
        person: currentUser,
      };
      setTasks([...tasks, newTask]);
    }
    setForm({ name: "", description: "", priority: "normal", person: "" });
  };

  const deleteTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task?.person !== currentUser) return;
    setTasks(tasks.filter(task => task.id !== id));
  };

  const editTask = (task: any) => {
    if (task.person !== currentUser) return;
    setForm({ name: task.name, description: task.description, priority: task.priority, person: task.person });
    setSelectedDate(new Date(task.date));
    setEditingTaskId(task.id);
  };

  const filteredTasks = (date: Date) =>
    tasks.filter(task =>
      format(task.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
      (filterUser === "all" || task.person === filterUser)
    );

  const filteredAllTasks = () =>
    tasks.filter(task => filterUser === "all" || task.person === filterUser);

  if (!currentUser) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-white min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4 text-indigo-700">Welcome to All_Together</h1>
        <p className="text-sm text-gray-500 mb-4">Please select your profile to continue</p>
        <div className="space-y-3 w-full">
          {familyMembers.map(member => (
            <Button key={member} className="w-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setCurrentUser(member)}>
              Login as {member}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen rounded-2xl shadow-xl">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-indigo-700">📅 All_Together</h1>
      <h2 className="text-lg mb-4 text-center text-slate-700">Logged in as <span className="font-bold">{currentUser}</span></h2>

      <Tabs defaultValue="calendar">
        <TabsList className="grid grid-cols-2 mb-6 rounded-full bg-indigo-100">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-full">Calendar View</TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-full">Tasks / More</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ dot: tasks.map(t => new Date(t.date)) }}
            modifiersClassNames={{ dot: "after:content-['•'] after:text-indigo-600 after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2" }}
            className="rounded-xl border shadow"
          />

          <Card className="mt-6 border-indigo-200">
            <CardContent className="space-y-4 p-6">
              <TaskForm
                selectedDate={selectedDate}
                form={form}
                setForm={setForm}
                addOrUpdateTask={addOrUpdateTask}
                editingTaskId={editingTaskId}
              />
            </CardContent>
          </Card>

          <Card className="mt-6 border-indigo-200">
            <CardContent className="space-y-4 p-4">
              <TaskList
                tasks={filteredTasks(selectedDate || new Date())}
                currentUser={currentUser}
                filterUser={filterUser}
                setFilterUser={setFilterUser}
                editTask={editTask}
                deleteTask={deleteTask}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="border-indigo-200">
            <CardContent className="p-4 space-y-4">
              <TaskList
                tasks={filteredAllTasks()}
                currentUser={currentUser}
                filterUser={filterUser}
                setFilterUser={setFilterUser}
                editTask={editTask}
                deleteTask={deleteTask}
                showDate={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
