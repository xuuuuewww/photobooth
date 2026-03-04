import Image from "next/image";
import type { PhotoboothTemplate } from "@/data/templates";

type TemplateCardProps = {
  template: PhotoboothTemplate;
};

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-[0_10px_26px_rgba(15,23,42,0.12)] transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:border-pink-300 hover:shadow-[0_24px_70px_rgba(244,114,182,0.45)]">
      <div className="flex items-center justify-center bg-neutral-100/80 px-3 pt-3 pb-2">
        <div className="overflow-hidden rounded-[1.4rem] bg-neutral-900/5">
          <Image
            src={template.imageSrc}
            alt={template.name}
            width={280}
            height={640}
            className="h-auto w-[7.5rem] md:w-[8.25rem] lg:w-[8.75rem]"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-between gap-2.5 px-3 pb-3 pt-2">
        <div className="text-center">
          <h3 className="text-[13px] font-semibold tracking-wide text-neutral-900">
            {template.name}
          </h3>
          <p className="mt-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-500">
            {template.styleLabel}
          </p>
        </div>
        <button
          type="button"
          className="pointer-events-none mt-1 inline-flex items-center justify-center rounded-full bg-pink-500 px-3.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-sm transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0.5 group-hover:opacity-100"
          aria-hidden="true"
        >
          Use This Template
        </button>
      </div>
    </article>
  );
}

