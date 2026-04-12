import React, { useEffect } from "react";
import AppRoutes from "../src/routes";

const App = () => {
  // 🌙 Load saved theme on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return <AppRoutes />;
};

export default App;
