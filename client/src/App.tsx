
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./pages/auth/Login"
import { ToastContainer } from "react-toastify"
import useThemeStore from "./store/useThemeStore";
import { useMemo } from "react";
import Home from "./pages/Home";

function App() {
  const { theme } = useThemeStore();

  const isDark = theme === "dark";
  const appRouter = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/login",
          element: <Login />,
        },

      ]),
    []
  );

  return (

    <div className={isDark ? "dark" : ""}>
      {/* ROUTER */}
      <RouterProvider router={appRouter} />

      {/* TOAST */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        pauseOnFocusLoss
        draggable
        limit={3}
        theme={isDark ? "dark" : "light"}
      />
    </div>

  )
}

export default App
