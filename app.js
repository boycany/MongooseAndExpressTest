const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const Student = require("./models/student");

const methodOverride = require("method-override");

//serving static file
app.use(express.static("public"));

//middleware，內建 body-parser
//若 extended 設定成 false 只能傳送 value 是 string 或 array 的物件
//設定成 true 的話，value 就可以是任何型別，就可傳送類似 JSON 格式的東西
app.use(express.urlencoded({ extended: true }));

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("successfully connected to MongoDB");
  })
  .catch((err) => {
    console.log("connection failed");
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("This is Homepage.");
});

app.get("/students", (req, res) => {
  try {
    Student.find({}).then((data) => {
      res.render("student.ejs", { data });
    });
  } catch {
    res.send("Error with finding data");
  }
});

app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs");
});

app.get("/students/:id", async (req, res) => {
  //   console.log(req.params);
  //   res.send("ID: " + req.params.id);
  try {
    let { id } = req.params;
    let data = await Student.findOne({ id });
    // console.log("data:", data);
    if (data === null) {
      res.send("Can't find this student. Please enter a valid id.");
    } else {
      res.render("studentPage.ejs", { data });
    }
  } catch (err) {
    res.send("something wrong...");
    console.log(err);
  }
});

app.get("/students/edit/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let data = await Student.findOne({ id });
    if (!data) {
      res.send("Can't find this student. Please enter a valid id.");
    } else {
      res.render("edit.ejs", { data });
    }
  } catch (e) {
    console.log("Error");
    console.log(e);
  }
});

app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((message) => {
      console.log(message);
      res.send("Deleted successfully.");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put("/students/edit/:id", (req, res) => {
  //   console.log(req.body);
  //   res.send("PUT method work");
  let { id, name, age, merit, other } = req.body;
  try {
    Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      {
        new: true,
        runValidators: true,
      }
    ).then((message) => {
      console.log(message);
      res.redirect(`/students/${id}`);
    });
  } catch (err) {
    res.render("reject.ejs");
    console.log(err);
  }
});

app.post("/students/insert", (req, res) => {
  //   console.log(req.body);
  //   res.send("Thanks for posting!");
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student Accepted");
      res.render("accept.ejs");
    })
    .catch((err) => {
      console.log("Student Not Accepted");
      console.log(err);
      res.render("reject.ejs");
    });
});

/** 防止輸入以上設定之外的網址 */
app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not Allowed");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});

/**
 * Route
 *
 * 1. /students
 * ----> 顯示所有的學生
 *
 * 2. /students/insert
 * GET  ----> 顯示 HTML Form
 * POST ----> 將資料傳送到 MongoDB
 *
 * 3. /students/:id
 * 顯示 student 個人頁面
 *
 * 4. /students/edit/:id
 * GET ----> 一個 HTML Form 可以修改個人資料
 * PUT ----> 更新資料，並且重新導向回學生的個人頁面
 *
 */
