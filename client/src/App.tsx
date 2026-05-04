
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import useThemeStore from "./store/useThemeStore";
import { useMemo } from "react";
import Home from "./pages/Home";
import ProtectedRoute, { PublicRoute } from "./protectedRoute";
import Login from "./pages/Login";

function App() {
  const { theme } = useThemeStore();

  const isDark = theme === "dark";
  const appRouter = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <ProtectedRoute />,
          children: [
            {
              path: "/",
              element: <Home />
            }
          ]

        },
        {
          element: <PublicRoute />,
          children: [
            {
              path: "/login",
              element: <Login />
            }
          ]
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
