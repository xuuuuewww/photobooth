"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

function getHeadingsFromDOM(): Heading[] {
  if (typeof document === "undefined") return [];
  const container = document.querySelector("[data-blog-article]");
  if (!container) return [];
  const h2s = container.querySelectorAll("h2");
  return Array.from(h2s).map((el) => ({
    id: el.id || "",
    text: (el.textContent || "").trim(),
  }));
}

export function TOC() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 从 DOM 读取 H2 构建目录
  useEffect(() => {
    function collect() {
      const list = getHeadingsFromDOM().filter((h) => h.id && h.text);
      if (list.length) setHeadings(list);
    }
    collect();
    const timer = setTimeout(collect, 100);
    const timer2 = setTimeout(collect, 500);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  // IntersectionObserver 监听当前阅读位置
  useEffect(() => {
    if (headings.length === 0) return;
    const container = document.querySelector("[data-blog-article]");
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const byTop = [...intersecting].sort(
          (a, b) => (a.boundingClientRect?.top ?? 0) - (b.boundingClientRect?.top ?? 0)
        );
        setActiveId(byTop[0].target.id);
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const scrollTo = (id: string) => {
    document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  if (headings.length === 0) return null;

  const linkClass = (id: string) =>
    `block border-l-2 py-1.5 pl-3 text-sm transition-colors duration-200 cursor-pointer ${
      activeId === id
        ? "border-pink-500 text-pink-700"
        : "border-transparent text-gray-500 hover:text-pink-600"
    }`;

  return (
    <>
      {/* 桌面端：仅渲染目录内容，由页面包在固定容器内 */}
      <nav
        className="hidden lg:block max-h-[calc(100vh-180px)] overflow-y-auto"
        aria-label="Contents"
      >
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Contents
        </h2>
        <ul className="space-y-0.5">
          {headings.map(({ id, text }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => scrollTo(id)}
                className={`w-full text-left ${linkClass(id)}`}
                >
                  {text}
                </button>
              </li>
          ))}
        </ul>
      </nav>

      {/* 移动端：顶部可折叠，整块同一底色，去掉上边框避免上方出现横线 */}
      <div className="-mt-px mb-6 block lg:hidden overflow-hidden rounded-xl border border-pink-100 border-t-0 bg-pink-50/50">
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className="flex w-full items-center justify-between bg-transparent px-4 py-3 text-left text-sm font-semibold text-pink-700 transition hover:bg-pink-100/50"
          aria-expanded={isOpen}
        >
          Contents
          <span
            className={`inline-block transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-200 ease-out ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="px-4 pb-3 pt-0">
            <ul className="space-y-0.5">
              {headings.map(({ id, text }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(id)}
                    className={`w-full py-1.5 pl-0 text-left text-sm transition-colors duration-200 ${
                      activeId === id ? "text-pink-700 font-medium" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
