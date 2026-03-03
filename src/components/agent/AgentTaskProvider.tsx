'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export type AgentTaskStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'terminated';

export type AgentTaskKind =
  | 'profile_parse'
  | 'jd_parse'
  | 'match_run'
  | 'resume_generate';

export interface AgentTask {
  id: string;
  kind: AgentTaskKind;
  title: string;
  description?: string;
  status: AgentTaskStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  successMessage?: string;
}

interface RunAgentTaskOptions {
  kind: AgentTaskKind;
  title: string;
  description?: string;
  successMessage?: string;
}

interface AgentTaskContextValue {
  tasks: AgentTask[];
  runTask: <T>(
    options: RunAgentTaskOptions,
    runner: (signal: AbortSignal) => Promise<T>
  ) => Promise<T>;
  terminateTask: (taskId: string) => void;
  dismissTask: (taskId: string) => void;
  clearFinishedTasks: () => void;
}

const MAX_TASKS = 24;

const AgentTaskContext = createContext<AgentTaskContextValue | null>(null);

export class AgentTaskTerminatedError extends Error {
  constructor() {
    super('任务已终止');
    this.name = 'AgentTaskTerminatedError';
  }
}

export function isAgentTaskTerminatedError(error: unknown): boolean {
  return error instanceof AgentTaskTerminatedError;
}

export function AgentTaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const tasksRef = useRef<AgentTask[]>([]);
  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  const commitTasks = useCallback((updater: (prev: AgentTask[]) => AgentTask[]) => {
    setTasks((prev) => {
      const next = updater(prev);
      tasksRef.current = next;
      return next;
    });
  }, []);

  const updateTask = useCallback(
    (taskId: string, updater: (task: AgentTask) => AgentTask) => {
      commitTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updater(task) : task))
      );
    },
    [commitTasks]
  );

  const runTask = useCallback(
    async <T,>(
      options: RunAgentTaskOptions,
      runner: (signal: AbortSignal) => Promise<T>
    ): Promise<T> => {
      const taskId = crypto.randomUUID();
      const now = new Date().toISOString();
      const controller = new AbortController();
      const newTask: AgentTask = {
        id: taskId,
        kind: options.kind,
        title: options.title,
        description: options.description,
        status: 'planned',
        createdAt: now,
        updatedAt: now,
      };

      controllersRef.current.set(taskId, controller);

      commitTasks((prev) => [newTask, ...prev].slice(0, MAX_TASKS));

      updateTask(taskId, (task) => ({
        ...task,
        status: 'in_progress',
        updatedAt: new Date().toISOString(),
      }));

      try {
        const result = await runner(controller.signal);
        const currentTask = tasksRef.current.find((task) => task.id === taskId);

        if (currentTask?.status !== 'terminated') {
          updateTask(taskId, (task) => ({
            ...task,
            status: 'completed',
            successMessage: options.successMessage,
            updatedAt: new Date().toISOString(),
          }));
        }

        return result;
      } catch (error) {
        const isAborted =
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === 'AbortError');

        if (isAborted) {
          updateTask(taskId, (task) => ({
            ...task,
            status: 'terminated',
            errorMessage: '任务已终止',
            updatedAt: new Date().toISOString(),
          }));
          throw new AgentTaskTerminatedError();
        }

        updateTask(taskId, (task) => ({
          ...task,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
          updatedAt: new Date().toISOString(),
        }));
        throw error;
      } finally {
        controllersRef.current.delete(taskId);
      }
    },
    [commitTasks, updateTask]
  );

  const terminateTask = useCallback(
    (taskId: string) => {
      const controller = controllersRef.current.get(taskId);
      if (controller) {
        controller.abort();
      } else {
        updateTask(taskId, (task) => ({
          ...task,
          status: task.status === 'completed' ? task.status : 'terminated',
          errorMessage: task.status === 'completed' ? task.errorMessage : '任务已终止',
          updatedAt: new Date().toISOString(),
        }));
      }
    },
    [updateTask]
  );

  const dismissTask = useCallback((taskId: string) => {
    commitTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, [commitTasks]);

  const clearFinishedTasks = useCallback(() => {
    commitTasks((prev) =>
      prev.filter((task) => task.status === 'planned' || task.status === 'in_progress')
    );
  }, [commitTasks]);

  const value = useMemo<AgentTaskContextValue>(
    () => ({
      tasks,
      runTask,
      terminateTask,
      dismissTask,
      clearFinishedTasks,
    }),
    [tasks, runTask, terminateTask, dismissTask, clearFinishedTasks]
  );

  return (
    <AgentTaskContext.Provider value={value}>
      {children}
    </AgentTaskContext.Provider>
  );
}

export function useAgentTasks() {
  const context = useContext(AgentTaskContext);
  if (!context) {
    throw new Error('useAgentTasks must be used within AgentTaskProvider');
  }
  return context;
}
