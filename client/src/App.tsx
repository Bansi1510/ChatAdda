
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./pages/auth/Login"

function App() {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Login />
    }
  ])
  return (
    <>
      <RouterProvider router={appRouter}></RouterProvider>
    </>
  )
}

export default App
