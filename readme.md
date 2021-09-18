# Ez Blog Systém

- **O projektu**:
  - Jednoduchý blog
  - Registrace, přihlašování, komentáře, jednoduchá administrace
  - Jednoduchá editace stránky (Všechny stránky můžeme editovat pomocí úpravy souborů .ejs kde můžeme psát klasické HTML)
  - Využívá Mysql databázi pro ukládání článků, uživatelů atd.
- **Instalace**:

  - Stáhneme si celý projekt a extrahujeme
  - Vytvoříme a nastavíme vše důležité v .env souboru (Názvy hodnot a jaké hodnoty kde mají být naleznete níže)
  - Pokud nemáme node.js nainstalujeme [Stažení Node.js](https://nodejs.org/en/download/)
  - Otevřeme si příkazový řádek nebo terminál ve složce kde máme projekt
  - Napíšeme npm i (install) - Což nám nainstaluje všechny balíčky co aplikace využívá
  - Poté co se nám vše nainstalujeme můžeme napsat npm start
  - Poté by web měl naběhnou na portu, co jste si nastavili v .env

- **Přihlašování**:
  - **Sessiony**:
    - Logined - Hodnota 0/1 - 0 = Nepřihlášen, 1 = Přihlášen
    - Username - Hodnota username uživatele
    - MD5Password - Zahashované heslo uživatele (Kvůli ověření) (Pokud se liší od hesla v databázi, uživatel je automaticky odhlášen)
    - LastLoginDate - Poslední čas přihlášení (Pokud se liší od času v databázi, uživatel je automaticky odhlášen)
  - **Údaje o uživateli v databázi (Users)**:
    - ID - ID uživatele
    - Username - Jméno uživatele
    - Password - Zahashované heslo
    - Email - Email uživatele (Pro resetování heslo, případně kontaktování)
    - BornDay - Datum narození uživatele
    - RegIP - IP adresa uživatele při registraci
    - LastIP - IP adresa uživatele při posledním přihlášení
    - RegDate - Datum registrace uživatele (Timestamp)
    - LastDate - Datum posledního přihlášení uživatele (Timestamp)
    - PermGroup - ID Groupky uživatele
    - EmailVerify - 0, 1 - 0 = Není ověřený, 1 = Je ověřený
    - NewsLetter - 0/1 - 0 = Nechce dostávat novinky, 1 = Chce dostávat novinky
    - !TODO AVATAR, POPIS PROFILU
- **Články**:
  - **Články v databázi (Clanky)**:
    - ID - ID článku
    - Author - ID Autora článku
    - Title - Nadpis článku
    - URLTitle - Title uložený ready pro url
    - Description - Krátký popis článku (Ukazuje se v OG a ve vylistování článku
    - Clanek - Celý článek
    - Date - Datum vydání článku (Timestamp)
  - **Kategorie článků v databázi (Kategorie)**:
    - ID - ID Kategorie
    - Title - Nadpis kategorie
    - URLTitle - Nadpis do URL
    - _Zde budou všechny kategorie - Možnost přidání přes administraci další kategorie_
  - **Kategorie jednotlivých článků v databázi (ClankyKategorie)**:
    - ID
    - ID_Clanku - ID Článku
    - ID_Kategorie - ID kategorie
- **Registrace**:
  - **Údaje k vyplnění**:
    - Username - Jméno uživatele
    - Passowrd - Heslo uživatele
    - RePassowrd - Znovu heslo uživatele
    - Email - Email uživatele
    - BornDay - Datum narození uživatele (Nesmí být mladší než věk nastavený v .env)
    - News - Checkbox jestli uživatel chce dostávat novinky
    - Podmínky - Checkbox uživatel musí souhlasit s podmínkami (Lze upravit soubor podminky.ejs)
  - **Postup po vyplnění registrace**:
    - Uživatel obdrží email poslaný pomocí smtp
    - V emailu dostane odkaz na ověření účtu s náhodně vygenerovaným kódem (Bez ověření emailu se uživatel nepřihlásí)
      - **Kód pro ověření v databázi (EmailyCodes)**:
        - ID - ID Kódu
        - ID_User - ID uživatele
        - Code - Kód pro ověření
        - _Kód se po použití smaže z tabulky_
    - Poté co klikne na odkaz bude automaticky přihlášen a v dabázi upravena hodnota EmailVerify na 1
- **Nastavení v .env**:
  - WEB_PORT - Port na kterém poběží web (Např. 8080)
  - WEB_TITLE - Název stránky (Je uveden v emailech a titlu stránky)
  - MAIN_LINK - Odkaz na hlavní stránku webu (Např https://example.com/) - Kvůli odkazům v emailech
  - MYSQL_USER - Uživatel pro přihlášení do databáze
  - MYSQL_HOST - IP Mysql serveru (Po případě i port) (Např. localhost)
  - MYSQL_PASSWORD - Heslo uživatele pro přihlášení do databáze
  - MYSQL_DATABASE - Jméno databáze, kde budou vytvořené tabulky
  - SMTP_HOST - IP SMTP serveru (Např. smtp.seznam.cz)
  - SMTP_PORT - Port SMTP serveru (Např. 465)
  - SMTP_USER - SMTP uživatel (Např. example@seznam.cz)
  - SMTP_PASS - SMTP Heslo uživatele
  - MINIMAL_AGE - Minimální věk pro registraci

```
WEB_PORT=8080
WEB_TITLE=Example.com
MAIN_LINK=http://localhost:9090/
MYSQL_USER=ExampleMysqlUser
MYSQL_HOST=69.69.69.69
MYSQL_PASSWORD=BestMysqlPassword69
MYSQL_DATABASE=MyBestDatabase
SMTP_HOST=smtp.seznam.cz
SMTP_POR=465
SMTP_USER=example@seznam.cz
SMTP_PAS=MyBestEmailPassword69
MINIMAL_AGE=69
```

- **MySQL Tabulky**
- Příkazy pro vytvoření tabulek:

  - **Users tabulka**:

  ```sql
  * CREATE TABLE `Users` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Username` TEXT NOT NULL, `Password` CHAR(32) NOT NULL,
  `Email` VARCHAR(255) NOT NULL, `BornDay` DATE NOT NULL,
  `RegIP` VARCHAR(45) NOT NULL, `LastIP` VARCHAR(45) NOT NULL,
  `RegDate` BIGINT NOT NULL, `LastDate` BIGINT NOT NULL,
  `PermGroup` INT NOT NULL DEFAULT '0', `EmailVerify` INT NOT NULL DEFAULT '0',
  `NewsLetter` INT NOT NULL, PRIMARY KEY (`ID`)) ENGINE=InnoDB;
  ```

  - **Clanky tabulka**:

  ```sql
  * CREATE TABLE `Clanky` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Author` INT NOT NULL, `Title` TEXT NOT NULL,
  `URLTitle` VARCHAR(2083) NOT NULL, `Description` TEXT NOT NULL,
  `Clanek` LONGTEXT NOT NULL, `Date` BIGINT NOT NULL,
  PRIMARY KEY (`ID`)) ENGINE=InnoDB;
  ```

  - **Kategorie tabulka**:

  ```sql
  * CREATE TABLE `Kategorie` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Title` TEXT NOT NULL,
  `URLTitle` VARCHAR(2083) NOT NULL,
  PRIMARY KEY (`ID`)) ENGINE=InnoDB;
  ```

  - **ClankyKategorie**:

  ```sql
  * CREATE TABLE `ClankyKategorie` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `ID_Clanku` INT NOT NULL,
  `ID_Kategorie` INT NOT NULL,
  PRIMARY KEY (`ID`)) ENGINE=InnoDB;
  ```

  - **EmailyCodes**:

  ```sql
  * CREATE TABLE `EmailyCodes` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `ID_User` INT NOT NULL,
  `Code` TEXT NOT NULL,
  PRIMARY KEY (`ID`)) ENGINE=InnoDB;
  ```

  - **PassowrdReset**:

  ```sql
  * CREATE TABLE `PasswordReset` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `User_ID` INT NOT NULL,
  `Code` TEXT NOT NULL,
  PRIMARY KEY (`ID`)) ENGINE=InnoDB;
  ```
