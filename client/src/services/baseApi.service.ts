import axios from "axios";


const baseURL = `${import.meta.env.BASE_REACT_API_URL}/api`

if (!baseURL) {
  throw new Error("Backend url not found");
}

const baseUrl = axios.create({
  baseURL,
  withCredentials: true
})


export default baseUrl;