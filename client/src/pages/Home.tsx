import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import ChatLists from '../components/chat/ChatLists'

import { toast } from 'react-toastify'
import { getAllUsersAPI } from '../services/user.service'



const Home: React.FC = () => {



  const [allUsers, setAllUser] = useState([]);

  const getAllUsers = async () => {
    try {
      const res = await getAllUsersAPI();
      console.log(res.data)
      if (res.status === 'success') setAllUser(res.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      getAllUsers();

    }
    fetchData();
  }, [])
  return (
    <Layout><ChatLists contacts={allUsers} /></Layout>
  )
}

export default Home