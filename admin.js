const express = require("express");
const admin = express.Router();
const db = require("./mysql");
const email = require("./email");
const md5 = require("md5");
require("dotenv").config();

function Login(req, Username, MD5Password, LastLoginDate) {
    req.session.Logined = 1;
    req.session.Username = Username;
    req.session.MD5Password = MD5Password;
    req.session.LastLoginDate = LastLoginDate;
}

admin.get("/registrace", (req, res) => {
    if(req.session.Logined == 1){
        res.redirect("./panel");
        return;
    }
    res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Registrace", DescStranka: "Registruj se na nejlepším CZ/SK blogu"}, ContentFile: "./content/registrace.ejs", errory: []});
})

admin.post("/registrace", (req, res) => {
    if(req.session.Logined == 1){
        res.redirect("./panel");
        return;
    }
    const errory = [];
    if(!req.body.username || !req.body.password || !req.body.repassword || !req.body.email || !req.body.bornday){
        errory.push("Nevyplnili jste nějaké povinné pole!");
    }
    if(req.body.username.length < 4 || req.body.username.length > 32){
        errory.push("Zadaná přezdívka je příliš dlouhá nebo krátká!");
    }
    if(req.body.username.includes(" ")){
        errory.push("Zadané jméno obsahuje mezery a to nesmí!")
    }
    if(req.body.password !== req.body.repassword){
        errory.push("Zadaná hesla se neshodují!")
    }
    if(req.body.password < 6 || req.body.password > 32 || !req.body.password.match(/[a-z]/g) || !req.body.password.match(/[A-Z]/g) || !req.body.password.match(/[0-9]/g) || req.body.password.includes(" ")){
        errory.push("Zadané heslo nesplňuje požadované požadavky! Musí obsahovat více jak 6 znaků, méně jak 32. Heslo musí obsahovat minimálně jedno malé písmeno, jedno velké písmeno a minimálně jedno číslo! Heslo nesmí obsahovat mezery.")
    }
    if(!/\S+@\S+\.\S+/.test(req.body.email)){
        errory.push("Zadal jste neplatný email!");
    }
    if((new Date() - new Date(req.body.bornday)) < (process.env.MINIMAL_AGE * 31556952000)){
        errory.push("Pro registraci na tomto webu musíš být starší " + process.env.MINIMAL_AGE + " let!")
    }
    if(req.body.podminky !== "on"){
        errory.push("Musíš souhlasit s podmínkami!")
    }
    if(errory.length > 0){
        res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Registrace", DescStranka: "Registruj se na nejlepším CZ/SK blogu"}, ContentFile: "./content/registrace.ejs", errory: errory});
    }else{
        db.query(`SELECT ID FROM Users WHERE Username LIKE '${req.body.username}' OR Email LIKE '${req.body.email}'`, (err, result) => {
            if(result.length > 0){
                res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Registrace", DescStranka: "Registruj se na nejlepším CZ/SK blogu"}, ContentFile: "./content/registrace.ejs", errory: ["Uživatel s takovým emailem nebo přezdívkou již existuje!"]});
            }else{
                let news;
                if(req.body.Newsletter == "on"){
                    news = 1;
                }else{
                    news = 0;
                }
                db.query(`INSERT INTO Users (Username, Password, Email, BornDay, RegIP, LastIP, RegDate, LastDate, Newsletter) VALUES ('${req.body.username}', '${md5(req.body.password)}', '${req.body.email}', '${req.body.bornday}', '${req.ip}', '${req.ip}', '${Date.now()}', '${Date.now()}', '${news}')`, (error, result2) => {
                    console.log(result2);
                    if(error){
                        res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Registrace", DescStranka: "Registruj se na nejlepším CZ/SK blogu"}, ContentFile: "./content/registrace.ejs", errory: ["Omlouváme se, ale vypadá to, tak že při zpracovávání požadavku došlo k chybě!"]});
                    }else{
                        const RandomKod = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        db.query(`INSERT INTO EmailyCodes (ID_User, Code) VALUES ('${result2.insertId}', '${RandomKod}')`);

                        email.sendMail({
                            from: `"${process.env.WEB_TITLE}" <${process.env.SMTP_USER}>`,
                            to: req.body.email,
                            subject: "Registrace na " + process.env.WEB_TITLE,
                            html: `<h2>Dobrý den ${req.body.username},</h2>na webu <strong>${process.env.WEB_TITLE}</strong> proběhla registrace s vaším jménem. Pokud jste akci provedli vy <a href="${process.env.MAIN_LINK}admin/email-verify/${RandomKod}">Klikni zde</a>. Pokud jste akci neprovedli vy, email můžete ignorovat. <br><br>----------<br>Email byl odeslán automaticky systémem webu. Systém vytvořil Jonáš Š. (Discord: Jonanek#1598)"`
                        })
                        res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Registrace", DescStranka: "Registruj se na nejlepším CZ/SK blogu"}, ContentFile: "./content/registrace.ejs", errory: ["Registrace proběhla úspěšně! Zkontroluj si emailovou schránku! Bez ověření emailu se na účet nepřihlásíš."]});
                    }
                })
            }
        })
    }
})

admin.get("/email-verify/:Kod", (req, res) => {
    db.query(`SELECT * FROM EmailyCodes WHERE Code like '${req.params.Kod}'`, (err, result) => {
        if(result.length < 1){
            res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Chybka", DescStranka: "Ejhle! Nastala chyba!"}, ContentFile: "./content/error.ejs", errory: "Váš kód na ověření emailu buďto vypršel nebo není platný!"});
        }else{
            db.query(`UPDATE Users SET EmailVerify='1' WHERE ID LIKE '${result[0].ID_User}'`);
            db.query(`DELETE FROM EmailyCodes WHERE ID LIKE '${result[0].ID}'`);
            res.redirect("../panel");
        }
    })
})

admin.get("/logout", (req, res) => {
    if(req.session.Logined !== 1){
        res.redirect("./login");
        return;
    }
    req.session = null;
    res.redirect("./login");
})

admin.get("/login", (req, res) => {
    if(req.session.Logined == 1){
        res.redirect("./panel");
        return;
    }
    res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Login", DescStranka: "Přihlaš se na nejlepším CZ/SK blogu"}, ContentFile: "./content/login.ejs", errory: []});
})

admin.post("/login", (req, res) => {
    if(req.session.Logined == 1){
        res.redirect("./panel");
        return;
    }
    db.query(`SELECT * FROM Users WHERE Username LIKE '${req.body.username}' AND Password LIKE '${md5(req.body.password)}' LIMIT 1`, (err, result) => {
        if(result.length < 1){
            res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Login", DescStranka: "Přihlaš se na nejlepším CZ/SK blogu"}, ContentFile: "./content/login.ejs", errory: ["Zadal jsi špatné jméno nebo heslo!"]});
        }else{
            if(result[0].EmailVerify !== 1){
                res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Login", DescStranka: "Přihlaš se na nejlepším CZ/SK blogu"}, ContentFile: "./content/login.ejs", errory: ["Účet nemá ověřenou emailovou adresu! Ověření nalezneš v emailové schránce!"]});
                return;
            }
            const Cas = Date.now();
            db.query(`UPDATE Users SET LastIP='${req.ip}', LastDate='${Cas}' WHERE ID LIKE '${result[0].ID}'`);
            Login(req, result[0].Username, result[0].Password, Cas);
            res.redirect("./panel");
        }
    })
})

admin.get("/zapomenute-heslo", (req, res) => {
    if(req.session.Logined == 1){
        res.redirect("./panel");
        return;
    }
    res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Zapomenuté heslo", DescStranka: "Resetuj si heslo na nejlepším CZ/SK blogu"}, ContentFile: "./content/zapomenuteheslo.ejs", errory: []});
})

admin.post("/zapomenute-heslo", (req, res) => {
    if(req.session.Logined == 1){
        res.redirect("./panel");
        return;
    }
    db.query(`SELECT * FROM Users WHERE Username LIKE '${req.body.username}' AND Email LIKE '${req.body.email}' LIMIT 1`, (err, result) => {
        if(result.length < 1){
            res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Zapomenuté heslo", DescStranka: "Resetuj si heslo na nejlepším CZ/SK blogu"}, ContentFile: "./content/zapomenuteheslo.ejs", errory: ["Zadal jsi špatné jméno nebo heslo!"]});
            return;
        }else if(result[0].EmailVerify == 0){
            res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Zapomenuté heslo", DescStranka: "Resetuj si heslo na nejlepším CZ/SK blogu"}, ContentFile: "./content/zapomenuteheslo.ejs", errory: ["účet nemá ještě ověřený email, tudíž nelze resetovat heslo!"]});
            return;
        }
        const RandomKod = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        db.query(`INSERT INTO PasswordReset (User_ID, Code) VALUES ('${result[0].ID}', '${RandomKod}')`);
        email.sendMail({
            from: `"${process.env.WEB_TITLE}" <${process.env.SMTP_USER}>`,
            to: result[0].Email,
            subject: "Resetování hesla na " + process.env.WEB_TITLE,
            html: `<h2>Dobrý den ${req.body.username},</h2>na webu <strong>${process.env.WEB_TITLE}</strong> proběhla žádost o resetování hesla na váš účet. Pokud jste akci provedli vy <a href="${process.env.MAIN_LINK}admin/heslo-reset/${RandomKod}">klikněte zde</a>. Pokud jste akci neprovedli vy, email můžete ignorovat. <br><br>----------<br>Email byl odeslán automaticky systémem webu. Systém vytvořil Jonáš Š. (Discord: Jonanek#1598)"`
        })
        res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Zapomenuté heslo", DescStranka: "Resetuj si heslo na nejlepším CZ/SK blogu"}, ContentFile: "./content/zapomenuteheslo.ejs", errory: ["Žádost o resetováni byla poslána na váš email!"]});
    })

})

admin.get("/heslo-reset/:Kod", (req, res) => {
    if(req.session.Logined == 1){
        res.redirect("./panel");
        return;
    }
    db.query(`SELECT * FROM PasswordReset WHERE Code like '${req.params.Kod}'`, (err, result) => {
        if(result.length < 1){
            res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Chybka", DescStranka: "Ejhle! Nastala chyba!"}, ContentFile: "./content/error.ejs", errory: "Váš kód na resetování hesla buďto vypršel nebo není platný!"});
        }else{
            req.session.RESETOVANI_HESLA_USER_ID = result[0].User_ID;
            db.query(`DELETE FROM PasswordReset WHERE ID LIKE '${result[0].ID}'`);
            res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Nastvené hesla", DescStranka: ""}, ContentFile: "./content/nastavenihesla.ejs", errory:[]});
        }
    })
})

admin.post("/heslo-reset", (req, res) => {
    if(req.session.Logined == 1){
        res.redirect("./panel");
        return;
    }else if(!req.session.RESETOVANI_HESLA_USER_ID){
        res.redirect("./login");
        return;
    }
    if(req.body.password < 6 || req.body.password > 32 || !req.body.password.match(/[a-z]/g) || !req.body.password.match(/[A-Z]/g) || !req.body.password.match(/[0-9]/g) || req.body.password.includes(" ")){
        res.render("zakladni.ejs", {info: {HlavniTitle: process.env.WEB_TITLE, TitleStranky: "Nastvené hesla", DescStranka: ""}, ContentFile: "./content/nastavenihesla.ejs", errory:["Zadané heslo nesplňuje požadované požadavky! Musí obsahovat více jak 6 znaků, méně jak 32. Heslo musí obsahovat minimálně jedno malé písmeno, jedno velké písmeno a minimálně jedno číslo! Heslo nesmí obsahovat mezery."]}); 
    }else{
        db.query(`UPDATE Users SET Password='${md5(req.body.password)}' WHERE ID LIKE '${req.session.RESETOVANI_HESLA_USER_ID}'`);
        res.redirect("./login");
    }

})

admin.get("/panel", (req, res) => {
    if(req.session.Logined !== 1){
        res.redirect("./login");
        return;
    }
})

module.exports = admin;