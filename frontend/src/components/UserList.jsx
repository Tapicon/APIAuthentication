import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000"
function UserList() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [editingUser, setEditingUser] = useState(null);

  // 🔹 Carrega os usuários da API ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get(`${API_URL}/usuarios`);
    setUsers(res.data);
  };

  // 🔹 Adicionar usuário
  const addUser = async () => {
    if (!newUser.username || !newUser.password) return alert("Preencha todos os campos!");
    await axios.post(`${API_URL}/register`, newUser);
    setNewUser({ username: "", password: "" });
    fetchUsers();
  };

  // 🔹 Deletar usuário
  const deleteUser = async (username) => {
    if (!window.confirm(`Deletar ${username}?`)) return;
    await axios.delete(`${API_URL}/usuarios/${username}`);
    fetchUsers();
  };

  // 🔹 Atualizar usuário
  const updateUser = async () => {
    if (!editingUser.username || !editingUser.password) return alert("Preencha todos os campos!");
    try{
      await axios.post(`${API_URL}/login`, {
        username: editingUser.username,
        password: editingUser.password,
      });
      await axios.put(`${API_URL}/usuarios/${editingUser.original}`, {
        username: editingUser.username,
        password: editingUser.password,
      });
      setEditingUser(null);
    } catch(err){
      return alert("Preencha os campos direito otario!")
    };
    fetchUsers();
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>CRUD de Usuários</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nickname"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <input
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <button onClick={addUser}>Adicionar</button>
      </div>

      <h2>Usuários:</h2>
      {users.map((u) => (
        <div
          key={u.username}
          style={{
            border: "1px solid #ccc",
            marginBottom: 10,
            padding: 10,
            borderRadius: 8,
          }}
        >
          {editingUser?.original === u.username ? (
            <>
              <input
                value={editingUser.username}
                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
              />
              <button onClick={updateUser}>Salvar</button>
              <button onClick={() => setEditingUser(null)}>Cancelar</button>
            </>
          ) : (
            <>
              <h3>{u.username}</h3>
              <p>{u.password}</p>
              <button onClick={() => setEditingUser({ ...u, original: u.username })}>
                Editar
              </button>
              <button onClick={() => deleteUser(u.username)}>Excluir</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default UserList;