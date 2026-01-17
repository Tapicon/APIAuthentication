
import express from "express"
import jwt from "jsonwebtoken"
import pool from "./db.js"
import bcrypt from "bcrypt"
import cors from "cors"
const app = express(); // Express app instance's -> The server
const port = 3000;
const SECRET = process.env.JWS_SECRET

//middleweres
app.use((req, res, next) => {
    console.log(`Nova requisição: ${req.method} ${req.url} às ${new Date().toLocaleTimeString()}`);
    next()
});
app.use(express.json());
app.use(cors())

app.get("/usuarios", async (req, res) =>{
    try{
        const result = await pool.query("SELECT username FROM usuarios ORDER BY id ASC");
        res.json(result.rows);
    } catch(err){
        console.error(err)
        res.status(500).json({message: "Erro de requisição usuários"})
    }
})

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    try{
        const hashedPassword = await bcrypt.hash(password, 10)
        await pool.query("INSERT INTO usuarios (username, password) VALUES ($1, $2)", [username, hashedPassword]);
        res.status(201).json({message: "Usuário cadastrado"});
    } catch(err){
        console.log(err)
        res.status(500).json({message: "Erro ao cadastrar"})
    }
})

app.post('/login', async (req, res) => {
    try{
        const {username, password} = req.body

        const result = await pool.query("SELECT * FROM usuarios WHERE username = $1", [username]);
        if (result.rows.length === 0){
            return res.status(401).json({message: "Usuario nao encontrado"})
        }
        const user = result.rows[0]
    
        const senhaCorreta = await bcrypt.compare(password, user.password)
    
        if(!senhaCorreta){
            return res.status(401).json({message:"senha incorreta"})
        }
        const token = jwt.sign({username},SECRET, {expiresIn:"1h"});
        res.json({token});
        // if (username === 'Luz Viviana' && password === '12345'){
        //     const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
        //     return res.json({ token });
        // }
        } catch(err){
            console.log(err)
        }
})

app.put("/updateUser", autenticarToken, async(req,res) => {
    const { newUsername, newPassword } = req.body
    const { username } = req.user;

    try{
        let hashedPassword = null
        if(newPassword){
            hashedPassword = await bcrypt.hash(newPassword, 10);
        }
        console.log(newUsername)
        if (newUsername && newPassword){
            await pool.query("UPDATE usuarios SET username = $1, password = $2 WHERE username = $3",[newUsername, hashedPassword, username])
            res.status(200).json({message:"deu bom"})
        }
        
    } catch(err){
        res.status(401).json({message:"erro de update"})
    }
})
function autenticarToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]; // Pega o token após "Bearer"

  if (!token) return res.status(401).json({ message: "Token não fornecido" });
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido ou expirado" });
        req.user = user; // Armazena dados do token na requisição
        next(); // Continua pro próximo middleware ou rota
  });
}

app.get('/dashboard', autenticarToken, (req, res) =>{
    res.send("BEMM VINDA")
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

export default app