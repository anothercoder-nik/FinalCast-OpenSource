import { cn } from "@/lib/utils";


export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-6 md:auto-rows-[20rem] md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({ className, title, description, header, icon }) => {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/10",
        className
      )}
    >
      {header}
      <div className="transition-all duration-300 group-hover/bento:translate-x-2">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <div className="font-sans font-bold text-white text-lg">
            {title}
          </div>
        </div>
        <div className="font-sans text-sm text-gray-300 leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
