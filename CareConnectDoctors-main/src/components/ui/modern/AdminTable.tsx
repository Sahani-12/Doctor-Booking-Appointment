import React from "react";

export function AdminTable({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function AdminTableRow({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

interface AdminTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  header?: boolean;
  className?: string;
}

export function AdminTableCell({
  children,
  header = false,
  className = "",
  ...props
}: AdminTableCellProps) {
  if (header) {
    return (
      <th
        className={`bg-slate-100 px-4 py-3 text-left font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100 ${className}`}
        {...(props as React.ThHTMLAttributes<HTMLTableHeaderCellElement>)}
      >
        {children}
      </th>
    );
  }

  return (
    <td
      className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
