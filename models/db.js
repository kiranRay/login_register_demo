const{ Pool }= require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "demo",
    password: "blogbing",
    port: "5432"
});
pool.connect().then(()=>console.log("conected to db"));

module.exports ={ pool }