const express = require("express");
const router = express.Router();
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const multer = require("multer");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Welcome@123456",
  database: "simpleangular",
});
/* GET users listing. */
router.post("/register", async function (req, res, next) {
  try {
    let { username, name, email, password } = req.body;
    const hashed_password = md5(password.toString());
    const checkUsername = `Select username FROM users WHERE username = ?`;
    con.query(checkUsername, [username], (err, result, fields) => {
      if (err) {
        res.send({ status: 4, data: "Server Error" });
      } else if (result?.length) {
        res.send({ status: 5, data: "Username Already Exist" });
      } else if (!result?.length) {
        const sql = `Insert Into users (username, name, email, password) VALUES ( ?, ?, ?, ? )`;
        con.query(
          sql,
          [username, name, email, hashed_password],
          (err, result, fields) => {
            if (err) {
              res.send({ status: 0, data: err });
            } else {
              let token = jwt.sign({ data: result }, "secret");
              res.send({ status: 1, data: result, token: token });
            }
          }
        );
      }
    });
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    const hashed_password = md5(password.toString());
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    con.query(sql, [username, hashed_password], function (err, result, fields) {
      if (err) {
        res.send({ status: 0, data: err });
      } else if (result.length === 0) {
        res.send({ status: 3, data: "Incorrect Username or Password" });
      } else {
        let token = jwt.sign({ data: result }, "secret");
        res.send({ status: 1, data: result, token: token });
      }
    });
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });
router.post("/multifiles/:userid", upload.array("files"), (req, res) => {
  try {
    const files = req.files;
    if (Array.isArray(files) && files.length > 0) {
      files.forEach((ele) => {
        const sql = `Insert Into users_file (image, user_id) VALUES ( ?, ?)`;
        let fileName = ele.filename;
        con.query(
          sql,
          [fileName, req.params.userid],
          (err, result, fields) => {
          }
        );
      });
      res.json(files);
    } else {
      throw new Error("File upload unsuccessful");
    }
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

router.post("/profileimage/:userid", upload.array("files"), (req, res) => {
  try {
    const files = req.files;
    if (Array.isArray(files) && files.length > 0) {
      files.forEach((ele) => {
        const sql = `UPDATE users SET avatar = ? WHERE id = ?`;
        let fileName = ele.filename;
        con.query(
          sql,
          [fileName, req.params.userid],
          (err, result, fields) => {
          }
        );
      });
      res.json(files);
    } else {
      throw new Error("File upload unsuccessful");
    }
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

router.post("/images/:userid", (req, res) => {
  try {
    const sql = `SELECT * FROM users_file WHERE user_id = ?`;
    con.query(sql, [req.params.userid], function (err, result, fields) {
      res.send({ data: result });
    });
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

router.post("/image/:userid", (req, res) => {
  try {
    const sql = `SELECT avatar FROM users WHERE id = ?`;
    con.query(sql, [req.params.userid], function (err, result, fields) {
      res.send({ data: result });
    });
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

router.delete("/deletemedia/:id/:userid", (req, res) => {
  try {
    const sql = `DELETE FROM users_file WHERE id = ? && user_id = ?`;
    con.query(sql, [req.params.id, req.params.userid], function (err, result, fields) {
      res.send({ data: result });
    });
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

// reset password
router.post("/resetpassword", async function (req, res, next) {
  try {
    let { id, oldpassword, newpassword } = req.body;
    const hashed_oldpassword = md5(oldpassword.toString());
    const hashed_newpassword = md5(newpassword.toString());
    const checkUsername = `Select password FROM users WHERE id = ?`;
    con.query(checkUsername, [id], (err, result, fields) => {
      if (err) {
        res.send({ status: 4, data: "Server Error" });
      } else if(JSON.parse(JSON.stringify(result))[0].password === hashed_oldpassword){
        const sql = `UPDATE users SET password = ? WHERE id = ?`;
        con.query(
          sql,
          [hashed_newpassword, id],
          (err, result, fields) => {
            if (err) {
              res.send({ status: 0, data: err });
            } else {
              res.send({ status: 9, data: result});
            }
          }
        );
      } else {
        res.send({status: 8, data: 'Incorrect old password'})
      }
    });
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

module.exports = router;
