import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { subscribeToPendingRequests } from "../services/api/client.js";

export default function GlobalLoadingBar() {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => subscribeToPendingRequests(setActiveCount), []);

  return (
    <motion.div
      animate={{
        opacity: activeCount > 0 ? 1 : 0,
        scaleX: activeCount > 0 ? 1 : 0.4,
      }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 origin-left bg-gradient-to-r from-brand-300 via-brand-500 to-cyan-300 shadow-[0_0_18px_rgba(24,149,255,0.55)]"
      initial={false}
      transition={{ duration: 0.22, ease: "easeOut" }}
    />
  );
}
