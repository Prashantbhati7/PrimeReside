import { Loader2 } from "lucide-react";
import React from "react";
import { Ripples } from 'ldrs/react'
import 'ldrs/react/Ripples.css'


const Loading = () => {
  return (
    <div className="flex gap-2 h-full w-full items-center justify-center ">
      <Ripples
        size="50"
        speed="3"
        color="#000000"
      />
    </div>
  );
};

export default Loading;
