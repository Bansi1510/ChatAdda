
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import useThemeStore from "./store/useThemeStore";
import { useEffect, useMemo } from "react";
import Home from "./pages/Home";
import ProtectedRoute, { PublicRoute } from "./protectedRoute";
import Login from "./pages/Login";
import User from "./pages/User";
import Status from "./components/status/Status";
import Settings from "./components/setting/Settings";
import useUserStore from "./store/useUserStore";
import { disconnetSocket, initializeSocket } from "./services/chat.service";

function App() {
  const { theme } = useThemeStore();
  const user = useUserStore.getState().user as { _id: string } | null;

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
            },
            {
              path: "/profile",
              element: <User />
            },
            {
              path: "/status",
              element: <Status />
            },
            {
              path: "/settings",
              element: <Settings />
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
  useEffect(() => {
    if (user?._id) {
      const socket = initializeSocket();


    }

    return () => {
      disconnetSocket();
    }
  }, [user]);
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
