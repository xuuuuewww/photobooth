import React from "react";

type Row = string[];

export function ComparisonTable({
  headers = [],
  rows = [],
}: {
  headers?: string[];
  rows?: Row[];
}) {
  const headerList = Array.isArray(headers) ? headers : [];
  const rowList = Array.isArray(rows) ? rows : [];
  if (headerList.length === 0 || rowList.length === 0) return null;
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-pink-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-pink-200 bg-pink-50/60">
            {headerList.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 font-semibold text-pink-800 first:rounded-tl-xl last:rounded-tr-xl"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white text-neutral-900">
          {rowList.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-pink-100 last:border-b-0 hover:bg-pink-50/30"
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
