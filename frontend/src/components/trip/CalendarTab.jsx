import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { formatDisplayDate } from '../../utils/dates';
import { formatUsd } from '../../utils/currency';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStopActivity } from '../../api/stopActivities';

export function CalendarTab({ trip, days, getActivitiesForDay }) {
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState({});

  useEffect(() => {
    const initialColumns = {};
    days.forEach((day) => {
      initialColumns[day] = getActivitiesForDay(trip, day);
    });
    setColumns(initialColumns);
  }, [trip, days, getActivitiesForDay]);

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateStopActivity(id, body),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
    },
  });

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceDay = source.droppableId;
    const destDay = destination.droppableId;

    const sourceList = Array.from(columns[sourceDay] || []);
    const movedItem = sourceList[source.index];
    if (!movedItem) return;

    // Validate that activity is not dropped outside its city stop stay range
    const { stop } = movedItem;
    if (stop && (destDay < stop.arrivalDate || destDay > stop.departureDate)) {
      alert(
        `Cannot move activity to ${formatDisplayDate(destDay)}. "${
          movedItem.stopActivity.activity.name
        }" belongs to ${stop.city.name} (${formatDisplayDate(stop.arrivalDate)} to ${formatDisplayDate(
          stop.departureDate,
        )}).`,
      );
      return;
    }

    const destList = sourceDay === destDay ? sourceList : Array.from(columns[destDay] || []);
    sourceList.splice(source.index, 1);

    // Use noon UTC ISO string to prevent timezone offset shifts
    const newDateStr = `${destDay}T12:00:00.000Z`;

    const updatedMovedItem = {
      ...movedItem,
      stopActivity: {
        ...movedItem.stopActivity,
        scheduledAt: newDateStr,
        orderIndex: destination.index,
      },
    };

    destList.splice(destination.index, 0, updatedMovedItem);

    setColumns((prev) => ({
      ...prev,
      [sourceDay]: sourceList,
      [destDay]: destList,
    }));

    updateMutation.mutate({
      id: draggableId,
      body: {
        scheduledAt: newDateStr,
        orderIndex: destination.index,
      },
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-4">
        {days.map((day) => {
          const stopsOnDay = trip.stops.filter(
            (stop) => day >= stop.arrivalDate && day <= stop.departureDate,
          );
          const dayActivities = columns[day] || [];

          return (
            <section key={day} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{formatDisplayDate(day)}</h3>
                {stopsOnDay.length > 0 && (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    In: {stopsOnDay.map((s) => s.city.name).join(', ')}
                  </span>
                )}
              </div>

              <Droppable droppableId={day}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`mt-3 min-h-[60px] rounded-lg p-2 transition ${
                      snapshot.isDraggingOver ? 'bg-sky-50 border border-sky-200' : 'bg-slate-50/50'
                    }`}
                  >
                    {dayActivities.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-xs text-slate-400 py-3 text-center">Drag activities here</p>
                    )}
                    <ul className="space-y-2">
                      {dayActivities.map(({ stop, stopActivity }, index) => (
                        <Draggable key={stopActivity.id} draggableId={stopActivity.id} index={index}>
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`rounded-xl border px-3.5 py-2.5 text-sm transition ${
                                snapshot.isDragging
                                  ? 'border-sky-400 bg-sky-100 shadow-lg'
                                  : 'border-slate-200 bg-white shadow-xs hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-900">
                                      {stopActivity.activity.name}
                                    </span>
                                    <span className="rounded bg-sky-100 px-1 py-0.5 text-[9px] font-medium text-sky-700 capitalize">
                                      {stopActivity.activity.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">📍 {stop.city.name}</p>
                                </div>
                                <span className="text-xs font-bold text-slate-700">
                                  {formatUsd(stopActivity.effectiveCost ?? stopActivity.activity.estimatedCost)}
                                </span>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                    </ul>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
          );
        })}
      </div>
    </DragDropContext>
  );
}
