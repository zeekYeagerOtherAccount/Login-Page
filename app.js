import 'dotenv/config';
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import pg from "pg";
import bcryptjs from "bcryptjs";

const app = express();
const port = 3000;

console.log(process.env.API_KEY);

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "userLogin",
    password: "12345",
    port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let userschema = [
    {id: 1, email: "", password: ""}
];



app.get("/", (req,res) => {
    
    res.render("home.ejs");
});

app.get("/register", async(req,res) => {

    try{
        const result = await db.query("SELECT * FROM userschema");
        userschema = result.rows;
        //checking if there are any error present
        console.log(userschema);
    
       res.render("register.ejs");
    }catch(err){
      console.log("err");
    } 
});

app.get("/login", (req,res) => {
    
    res.render("login.ejs");
});

// Inserting Email and Password in the SQL dataBase 
// & Rendering Sectets page to user After Registering

app.post("/register", async (req,res) => {
    try{  
        const newemail = req.body.username;
        const newpass = req.body.password;

        //hashing newpass in Inserting it into Database
        const hash = await bcryptjs.hash(newpass, 10);

        const result = await db.query("INSERT INTO userschema (email, password) VALUES ($1,$2)", [newemail, hash]);
        res.render("secrets.ejs");

    }catch(err){
        console.log(error);
    }

});

// Login Requires to Input the correct Email & Password to Render to Secrets page
// The Inputed data is compared to SQL table content .....

app.post("/login", async (req, res) => {
        
       
   try { 
       const username = req.body.username;
        const password = req.body.password;
       //Checking the user email and password for loging in!!
       const user = await db('userschema').first('*').where({email: username});
        
       if (user) {
        const validpass = await bcryptjs.compare(password, user.hash);
        if(validpass) {
             res.render("secrets.ejs");
             console.log("Login Sucessfully");
        } else {
            console.log("Wrong Pass!");
        }
       }else {
        console.log("User not found!");
       }
    console.log("Welcome!");
    
   } catch (err) {

    console.log ("Register man!");
   }

   

})


app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})