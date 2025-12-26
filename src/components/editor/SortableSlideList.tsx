"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Slide } from "@/types";

interface SortableSlideListProps {
  slides: Slide[];
  onReorder: (slides: Slide[]) => void;
  onDelete: (slideId: string) => void;
}

interface SortableSlideItemProps {
  slide: Slide;
  index: number;
  onDelete: (slideId: string) => void;
}

function SortableSlideItem({ slide, index, onDelete }: SortableSlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-lg border bg-white p-2 ${
        isDragging ? "border-primary-500 shadow-lg" : "border-gray-200"
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
        </svg>
      </button>

      {/* Thumbnail */}
      <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
        <Image
          src={slide.imageUrl}
          alt={slide.alt || `Slide ${index + 1}`}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          スライド {index + 1}
        </p>
        <p className="truncate text-xs text-gray-500">
          {slide.alt || "説明なし"}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(slide.id)}
        className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        aria-label="削除"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}

export function SortableSlideList({
  slides,
  onReorder,
  onDelete,
}: SortableSlideListProps) {
  const [items, setItems] = useState(slides);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with parent
  if (
    slides.length !== items.length ||
    slides.some((s, i) => s.id !== items[i]?.id)
  ) {
    setItems(slides);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex).map(
        (slide, index) => ({
          ...slide,
          order: index,
        })
      );

      setItems(reordered);
      onReorder(reordered);
    }
  };

  if (slides.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
        スライドがありません
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        スライド一覧 ({slides.length}枚)
      </label>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((slide, index) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default SortableSlideList;
