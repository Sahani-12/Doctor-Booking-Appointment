import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export function AdminTable({ headers, children }: TableProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-b border-slate-700/50">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left text-sm font-semibold text-slate-200"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTableRow({ children, className = "" }: TableRowProps) {
  return (
    <tr
      className={`hover:bg-slate-700/30 transition-colors duration-150 ${className}`}
    >
      {children}
    </tr>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}

export function AdminTableCell({
  children,
  className = "",
  ...props
}: TableCellProps) {
  return (
    <td className={`px-6 py-4 text-sm text-slate-300 ${className}`} {...props}>
      {children}
    </td>
  );
}
