// src/components/Logo.jsx
// Central RentRoam logo component (fully responsive)
// Swap the image by editing ONLY the LOGO_SRC below.

import React from "react";

// Using your uploaded logo
const LOGO_SRC = "/Logo.png";

export default function Logo({
  size = 40,            // height/width in px
  rounded = true,       // round the image
  showText = false,      // whether to show "RentRoam"
  textClass = "text-lg font-bold text-[--rr-black]"
}) {
  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src={LOGO_SRC}
        alt="RentRoam Logo"
        style={{ width: size, height: size }}
        className={`object-cover ${rounded ? "rounded-md" : ""}`}
      />
      {showText && <span className={textClass}>RentRoam</span>}
    </div>
  );
}
