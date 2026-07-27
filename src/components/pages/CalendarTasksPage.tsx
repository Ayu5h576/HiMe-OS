import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Sparkles, 
  Check, 
  Clock, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { CalendarEvent, TaskItem } from '../../types';

interface CalendarTasksPageProps {
  events: CalendarEvent[];
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: TaskItem) => void;
}

export const CalendarTasksPage: React.FC<CalendarTasksPageProps> = ({
  events,
  tasks,
  onToggleTask,
  onAddTask
}) => {
  const [taskList, setTaskList] = useState<TaskItem[]>(tasks);
  const [eventList, setEventList] = useState<CalendarEvent[]>(events);
  const [showFocusTimer, setShowFocusTimer] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      completed: false,
      priority: newTaskPriority,
      dueDate: new Date().toISOString().split('T')[0],
      estimatedMinutes: 30,
      category: 'AI Task'
    };

    onAddTask(task);
    setTaskList((prev) => [task, ...prev]);
    setNewTaskTitle('');
  };

  const handleAiOptimizeSchedule = () => {
    // Simulated AI schedule re-ordering
    setEventList((prev) => [
      ...prev,
      {
        id: `cal-ai-${Date.now()}`,
        title: 'AI Auto-Scheduled Focus Block',
        startTime: '15:30',
        endTime: '16:30',
        date: '2026-07-27',
        type: 'focus',
        location: 'Studio Deep Work Space',
        aiSuggested: true
      }
    ]);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <GlassCard className="p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-indigo-400/30 text-indigo-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Calendar & Task Planner
                <span className="text-xs px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold font-mono glow-cyan">
                  {eventList.length} Events
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">Gemini AI time blocking and focus session manager</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiOptimizeSchedule}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all glow-cyan"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>AI Optimize Schedule</span>
            </button>

            <button
              onClick={() => setShowFocusTimer(!showFocusTimer)}
              className="px-4 py-2.5 rounded-full glass hover:bg-white/15 border border-white/20 text-xs font-mono font-bold text-white flex items-center gap-2 transition-all uppercase tracking-wider"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Focus Mode Timer</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Focus Timer Bar (if active) */}
      {showFocusTimer && (
        <GlassCard className="p-6 text-center space-y-4 rounded-3xl border border-cyan-400/40 glow-cyan">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-extrabold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" /> Deep Focus Mode Audio Wave
          </div>

          <div className="text-5xl font-extrabold text-white font-mono tracking-widest">
            {formatTimer(timerSeconds)}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="px-6 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 glow-cyan transition-all"
            >
              {timerActive ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
              <span>{timerActive ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }}
              className="p-2.5 rounded-full glass hover:bg-white/15 text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Main Grid: Calendar Timeline & Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Events List */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-white">Upcoming Events</h3>
            <span className="text-xs font-mono text-cyan-400 font-extrabold">Today</span>
          </div>

          <div className="space-y-3">
            {eventList.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl glass border border-white/10 space-y-2 flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{evt.title}</span>
                    {evt.aiSuggested && (
                      <span className="text-[10px] font-mono px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold">
                        AI Suggested
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/50 font-mono flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{evt.startTime} - {evt.endTime}</span>
                    <span>•</span>
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Task Planner */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-white">Task Queue</h3>
            <span className="text-xs font-mono text-cyan-400 font-extrabold">{taskList.filter(t => !t.completed).length} Pending</span>
          </div>

          {/* Quick Create Task Input */}
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add new task..."
              className="flex-1 p-3 rounded-2xl glass border border-white/15 text-xs text-white placeholder-white/40 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs glow-cyan"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </form>

          <div className="space-y-2.5">
            {taskList.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  onToggleTask(task.id);
                  setTaskList(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  task.completed ? 'glass border-white/5 opacity-40' : 'glass border-white/10 hover:border-cyan-400/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    task.completed ? 'bg-cyan-400 border-cyan-400 text-black glow-cyan' : 'border-white/30'
                  }`}>
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
                      {task.title}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      Due: {task.dueDate} • Est: {task.estimatedMinutes}m
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-3 py-0.5 rounded-full font-extrabold uppercase ${
                  task.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
