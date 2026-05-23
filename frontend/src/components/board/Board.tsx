'use client';

import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { Board as BoardType, useBoardStore } from '../../store/boardStore';
import ColumnComponent from './Column';
import { useEffect, useState } from 'react';

export default function BoardComponent({ board }: { board: BoardType }) {
  const moveTask = useBoardStore(state => state.moveTask);
  // strict mode bug fix for drag and drop
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTask(draggableId, destination.droppableId, destination.index);
  };

  if (!isBrowser) {
    return null; // Avoid hydration mismatch on server
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column" isDropDisabled={true}>
        {(provided) => (
          <div
            className="flex gap-4 h-full items-start"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {board.columns.map((column) => {
              const tasks = board.tasks
                .filter(task => task.columnId === column.id)
              // Optional: ensure stable sorting based on array order
              // for this simple mock, they are inherently sorted by their presence in the `tasks` array
              return (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  boardId={board.id}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
