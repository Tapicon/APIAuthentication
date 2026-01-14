
import express from "express"
import jwt from "jsonwebtoken"
import pool from "./db.js"

const app = express(); // Express app instance's -> The server
const port = 3000;
const SECRET = "minha_chave_secreta_super_segura" 

//middleweres
app.use((req, res, next) => {
    console.log(`Nova requisição: ${req.method} ${req.url} às ${new Date().toLocaleTimeString()}`);
    next()
});
app.use(express.json());

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    try{
        await pool.query("INSERT INTO usuarios (username, password) VALUES ($1, $2)", [username, password]);
        res.status(201).json({message: "Usuário cadastrado"});
    } catch(err){
        console.log(err)
        res.status(500).json({message: "Erro ao cadastrar"})
    }
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body

    const result = await pool.query("SELECT * FROM usuarios WHERE username = $1 AND password = $2", [username,password]);
    if(result.rows.lenght > 0){
        const token = jwt.sign({username},SECRET, {expiresIn:"1h"});
        res.json({token});
    } else{
        res.status(401).json({message: "credenciais invalidas"});
    }
    // if (username === 'Luz Viviana' && password === '12345'){
    //     const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
    //     return res.json({ token });
    // }
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