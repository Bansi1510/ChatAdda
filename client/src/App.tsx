
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
import { disconnectSocket, initializeSocket } from "./services/chat.service";
import { useChatStore } from "./store/useChatStore";

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

  const user = useUserStore(
    (state) => state.user
  );
  const initializeSocketListener =
    useChatStore(
      (state) =>
        state.initializeSocketListener
    );


  useEffect(() => {
    if (!user?._id) return;

    const socket = initializeSocket(user._id);

    if (socket) {
      initializeSocketListener();
    }

    return () => {
      disconnectSocket();
    };
  }, [user?._id]);



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
