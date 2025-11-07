import { useState, useEffect } from "react";
import { getTodayCost, getTotalCost } from "../lib/cost.js";

export default function CostBadge() {
  const [today, setToday] = useState("0.0000");
  const [total, setTotal] = useState("0.0000");

  useEffect(() => {
    const update = async () => {
      setToday(await getTodayCost());
      setTotal(await getTotalCost());
    };
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-xs text-pink-600 font-mono">
      <div>Today: <strong>${today}</strong></div>
      <div>Total: <strong>${total}</strong></div>
    </div>
  );
}
