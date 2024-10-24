import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

interface Task {
  id: string;
  title: string;
  assigneeAvatar: string;
  tags: string[];
  columnId: string; // Thay đổi từ column object sang columnId để dễ xử lý hơn
}

interface UserStory {
  id: string;
  title: string;
  tasks: Task[];
}

interface Column {
  id: string;
  name: string;
}

interface Data {
  userStories: UserStory[];
}

const columns: Column[] = [
  { id: 'todo', name: 'Todo' },
  { id: 'reopen', name: 'ReOpen' },
  { id: 'inprogress', name: 'In Progress' },
  { id: 'Resolve', name: 'Resolved' },
  { id: 'done', name: 'Done' }
];

const initialData: Data = {
  userStories: [
    {
      id: 'us1',
      title: 'User Story 1',
      tasks: [
        {
          id: 'task1.1a',
          title: 'Task 1.1.a This is a long task title that should wrap to the next line',
          assigneeAvatar: 'https://i.pravatar.cc/32?img=3',
          tags: ['Low', 'Review'],
          columnId: 'backlog',
        },
        {
          id: 'task1.1b',
          title: 'Task 1.1.b',
          assigneeAvatar: 'https://i.pravatar.cc/32?img=3',
          tags: ['Bug'],
          columnId: 'todo',
        },
        {
          id: 'task1.2',
          title: 'Task 1.2 Another very long task title that will demonstrate line wrapping in the UI',
          assigneeAvatar: 'https://i.pravatar.cc/32?img=3',
          tags: ['High Priority'],
          columnId: 'inprogress',
        },
      ],
    },
    {
      id: 'us2',
      title: 'User Story 2',
      tasks: [
        {
          id: 'task2.1',
          title: 'Task 2.1',
          assigneeAvatar: 'https://i.pravatar.cc/32?img=4',
          tags: ['Drafting'],
          columnId: 'todo',
        },
        {
          id: 'task2.2',
          title: 'Task 2.2',
          assigneeAvatar: 'https://i.pravatar.cc/32?img=4',
          tags: ['Drafting'],
          columnId: 'todo',
        },
      ],
    },
  ],
};

const TaskItem: React.FC<{ task: Task; index: number; moveTask: (taskId: string, to: string) => void }> = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white p-2 rounded-md shadow-md ${isDragging ? 'opacity-50' : ''}`}
      style={{ width: '160px', marginBottom: '4px' }}
    >
      <div className="flex items-center mb-2">
        <img src={task.assigneeAvatar} alt="Assignee Avatar" className="w-8 h-8 rounded-full mr-3" />
        <span title={task.title} className="font-semibold text-xs break-words" style={{ maxHeight: '32px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.title}</span>
      </div>
      <div className="flex space-x-2">
        {task.tags.map((tag, index) => (
          <span key={index} className="bg-blue-200 text-blue-800 text-ssm font-medium px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const Column: React.FC<{ droppableId: string; tasks: Task[]; title: string; moveTask: (taskId: string, to: string) => void }> = ({ droppableId, tasks, title, moveTask }) => {
  const [isOver, setIsOver] = useState(false);

  const [, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string }) => {
      moveTask(item.id, droppableId);
      setIsOver(false);
    },
    collect: (monitor) => {
      setIsOver(monitor.isOver());
    },
  });

  return (
    <div ref={drop} className="bg-gray-200 p-4 rounded-md h-full min-h-[216px]" style={{ width: '360px' }}>
      {isOver && (
        <div
          className="border-2 border-dashed border-gray-400 bg-gray-100 rounded-md mb-2 opacity-50"
          style={{ width: '160px', height: '80px' }}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} index={0} moveTask={moveTask} />
        ))}
      </div>
    </div>
  );
};

const Board: React.FC = () => {
  const [data, setData] = useState<Data>(initialData);

  const moveTask = (taskId: string, destinationColumnId: string) => {
    const updatedData = { ...data };
    let taskToMove: Task | null = null;

    // Identify and remove task from current position
    for (const story of updatedData.userStories) {
      const taskIndex = story.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        [taskToMove] = story.tasks.splice(taskIndex, 1);
        break;
      }
    }

    // Add task to the destination
    if (taskToMove) {
      // Update the columnId of the task to match the destination column
      taskToMove.columnId = destinationColumnId.split('-')[1];

      // Extract storyId from the droppableId which has the format storyId-columnId
      const [storyId] = destinationColumnId.split('-');

      // Find the correct UserStory to add the task to
      const destinationStory = updatedData.userStories.find((story) => story.id === storyId);

      if (destinationStory) {
        destinationStory.tasks.push(taskToMove);
      }
    }

    setData(updatedData);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full overflow-x-auto overflow-y-hidden bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Current Sprint Board</h2>
        {/* Render Columns Headers Once for All User Stories */}
        <div className="flex gap-4 mb-4">
          <div className="flex-none" style={{ width: '220px', flexGrow: 0 }}>
            {/* Placeholder for User Story Header Column */}
          </div>
          <div className="flex gap-4 flex-grow">
            {columns.map((column) => (
              <div key={column.id} className="w-[360px] text-lg font-semibold">
                {column.name}
              </div>
            ))}
          </div>
        </div>
        {/* Render User Stories and Columns */}
        <div className="flex flex-col gap-4 min-h-[calc(100vh-170px)]">
          {data.userStories.map((story) => (
            <div key={story.id} className="flex flex-col gap-4 mb-4 items-stretch">
              <div className="flex gap-4 items-stretch">
                {/* User Story Column */}
                <div className="flex-none" style={{ width: '220px', flexGrow: 0 }}>
                  <div className="bg-[#F8F6A5] p-4 rounded-md h-full flex items-center justify-center">
                    {story.title}
                  </div>
                </div>
                {/* Render Columns Based on Dynamic Definition */}
                <div className="flex gap-4 flex-grow">
                  {columns.map((column) => (
                    <Column
                      key={column.id}
                      droppableId={`${story.id}-${column.id}`}
                      tasks={story.tasks.filter((task) => task.columnId === column.id)}
                      title={column.name}
                      moveTask={moveTask}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Board;
