'use client';

import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { Board as BoardType, useBoardStore } from '../../store/boardStore';
import ColumnComponent from './Column';
import { useEffect, useState } from 'react';

export default function BoardComponent({ board }: { board: BoardType }) {
  const moveTask = useBoardStore(state => state.moveTask);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => { setTimeout(() => setIsBrowser(true), 0); }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveTask(draggableId, destination.droppableId, destination.index);
  };

  if (!isBrowser) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column" isDropDisabled>
        {(provided) => (
          <div className="flex gap-4 h-full items-start" {...provided.droppableProps} ref={provided.innerRef}>
            {board.columns.map(column => (
              <ColumnComponent
                key={column.id}
                column={column}
                tasks={board.tasks.filter(task => task.columnId === column.id)}
                boardId={board.id}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
