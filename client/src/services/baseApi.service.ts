import axios from "axios";


const baseURL = `${import.meta.env.VITE_API_URL}/api`
console.log(baseURL)
if (!baseURL) {
  throw new Error("Backend url not found");
}

const baseUrl = axios.create({
  baseURL,
  withCredentials: true
})


export default baseUrl;