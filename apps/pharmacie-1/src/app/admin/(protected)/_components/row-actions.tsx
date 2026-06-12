"use client";

import { PencilIcon, TrashIcon } from "@pharmacie/ui";
import Link from "next/link";

interface RowActionsProps {
  editHref: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  itemId: string;
}

export function RowActions({ editHref, deleteAction, itemId }: RowActionsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <Link
        href={editHref}
        title="Éditer"
        className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-bg-subtle hover:text-brand-700"
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </Link>
      <form action={deleteAction}>
        <input type="hidden" name="id" value={itemId} />
        <button
          type="submit"
          title="Supprimer"
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-danger-bg hover:text-danger-solid"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
