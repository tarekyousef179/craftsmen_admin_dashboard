import { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllUsers = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    try {
      const { data } = await axios.get("/admin/users?page=1&limit=1000");
      setUsers(data.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const getUserById = (id) => users.find((user) => user._id === id) || null;

  return (
    <UserContext.Provider value={{ users, getUserById, loading, setUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => useContext(UserContext);
