import React from "react";

export const LoadingSpinner = (): JSX.Element => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-16">
      <div className="relative w-[22px] h-[22px]" data-testid="loading-spinner">
        <div className="absolute inset-0 rounded-full border-2 border-slate-300" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-700 animate-spin"
          style={{
            borderTopColor: "rgb(71, 85, 105)",
          }}
        />
      </div>
      <p className="mt-4 text-sm text-slate-600" data-testid="loading-text">
        Loading...
      </p>
    </div>
  );
};
