const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname+ "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const day= date.getDate();
const app = express();

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-himanshu:lediledi@cluster0.uf6lm.mongodb.net/practicetodolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const itemSchema = new mongoose.Schema({
    name: String
})

const customListSchema = new mongoose.Schema({
    name: String,
    customListItems: [itemSchema]
})

const Item = mongoose.model("Item", itemSchema);

const customItem = mongoose.model("CustomItem", customListSchema);


const item1 = new Item({
    name: "Welcome to your todolist!"
})

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})



defaultItems = [item1, item2, item3];


app.get("/", function (req, res) {



    Item.find(function (err, foundList) {
        if (foundList.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (!err) {
                    console.log("Successfully saved default items to DB.");
                }
            })
            res.redirect("/");
        }
        else {
            res.render("list", {
                itemNames: foundList,
                todoTitle: day
            });
        }
    })
});

app.get("/:customList", function (req, res) {
    const customListName = _.capitalize(req.params.customList)

    customItem.findOne({
        name: customListName
    }, function (err, foundItem) {
        if (!err) {
            if (!foundItem) {
                const custom_item = new customItem({
                    name: customListName,
                    items: defaultItems
                  });
                  custom_item.save();
                  res.redirect("/" + customListName);
            }
            else {
            res.render("list", {
                todoTitle: foundItem.name,
                itemNames: foundItem.customListItems
        })}
        }
    })

})


app.post("/", function (req, res) {
    var item_name = req.body.todoItems
    var btnValue = req.body.btn;
    const item = new Item({
        name: item_name
    })
    if (btnValue === day) {
        item.save();
        res.redirect("/");
    } else {
        customItem.findOne({name: btnValue}, function (err, foundItem) {
            foundItem.customListItems.push(item);
            foundItem.save();
            res.redirect("/"+ btnValue)
        })
        }
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const checkedItemList= req.body.listName
    if (checkedItemList=== day) {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("Successfully deleted item")
                res.redirect("/")
            }
        })

    } else {
        customItem.findOneAndUpdate({name: checkedItemList}, {$pull: {customListItems: {_id: checkedItemId}}}, function(err) {
            if (!err) {
                res.redirect("/"+ checkedItemList)
            }
        })
    }

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
    console.log("Server has started successfully");
})