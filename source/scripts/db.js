import pg from "pg"

const Pool = pg.Pool;
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "andreg5508",
    database: "authentication",
    port: 5432
});

export default pool