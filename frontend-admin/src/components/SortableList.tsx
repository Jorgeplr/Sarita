import { ReactNode, useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Layout = "list" | "grid";

interface SortableItemProps {
  id: string;
  layout: Layout;
  children: ReactNode;
}

function SortableItem({ id, layout, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  if (layout === "grid") {
    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative">
        <button
          type="button"
          {...listeners}
          className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing touch-none rounded-full bg-ink/80 px-2 py-1 text-xs text-mist/80 hover:text-mist backdrop-blur"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>
        {children}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2">
      <button
        type="button"
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none shrink-0 p-1 text-mist/40 hover:text-mist/70"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

interface SortableListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  onReorder: (orderedIds: string[]) => void;
  layout?: Layout;
}

export default function SortableList<T extends { id: string }>({
  items,
  renderItem,
  onReorder,
  layout = "list",
}: SortableListProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  useEffect(() => setLocalItems(items), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );
  const ids = useMemo(() => localItems.map((item) => item.id), [localItems]);
  const strategy = layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy;
  const containerClassName =
    layout === "grid"
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
      : "space-y-3";

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;
        const next = arrayMove(localItems, oldIndex, newIndex);
        setLocalItems(next);
        onReorder(next.map((item) => item.id));
      }}
    >
      <SortableContext items={ids} strategy={strategy}>
        <div className={containerClassName}>
          {localItems.map((item) => (
            <SortableItem key={item.id} id={item.id} layout={layout}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
