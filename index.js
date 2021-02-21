/*
    Ez Blog System

    Made by: Jonanek <3
*/

//balíčky
const express = require("express");
const cookieSession = require("cookie-session");
const bodyParse = require("body-parser");
const ejs = require("ejs");
require("dotenv").config();

const db = require("./mysql");
const email = require("./email");

//Import routů
const admin = require("./admin");

const app = express();

//Middlewary
app.use(cookieSession({
    name: "sessiony",
    secret: "NejvetsiSecretEver"
}))
app.use(bodyParse.urlencoded({ extended: true }));
app.set("view engine", "ejs");

/*
        email.sendMail({
        from: '"Jonáš.eu" <jonas@pinktube.eu>',
        to: "jonasscipak@gmail.com",
        subject: "Ahojdá",
        html: "<h1>Hello</h1>"
    })
*/

function UnLogin(req, res) {
    req.session = null;
    res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Chybka", DescStranka: "Ejhle! Nastala chyba!"}, ContentFile: "./content/error.ejs", errory: "Byl jste odhlášen, protože na váš účet se přihlásil někdo další nebo proběhla změna údajů!"});
}

app.use("/public", express.static(__dirname + "/public"));

//Kontrola přihlášený (Jestli se uživateli nezměnilo náhodou heslo pokud ano zrůší sessiony (odhlásí))
app.get("/*", (req, res, next) => {
    if(req.session.Logined == 1){
        console.log(req.session);
        db.query(`SELECT * FROM Users WHERE Username LIKE '${req.session.Username}' AND Password LIKE '${req.session.MD5Password}' LIMIT 1`, (err, result) => {
            if(result.length < 1){
                UnLogin(req, res);
            }else if(result[0].LastIP !== req.ip){
                UnLogin(req, res);
            }else if(result[0].LastDate !== req.session.LastLoginDate){
                UnLogin(req, res);
            }else{
                next();
            }
        })
    }else{
        next();
    }
})

//Nastavení routů
app.use("/admin", admin);

app.get("/", async (req, res) => {
    if(!req.query.strana){
        res.redirect("/?strana=0");
        return;
    }
    const KonecnePozice = (10 * Number(req.query.strana) + 10);
    const ZacatecniPozice = KonecnePozice-10;
    db.query(`SELECT * FROM Clanky ORDER BY ID DESC LIMIT ${ZacatecniPozice},${KonecnePozice}`, (err, result) => {
        
    })
})

//poslouchání na portu
app.listen(process.env.WEB_PORT, () => console.log(`Web běží na portu ${process.env.WEB_PORT}`))