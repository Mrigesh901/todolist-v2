const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require("mongoose")
const app = express();
const _ = require("lodash");

mongoose.connect("mongodb+srv://mrigesh:Q123w456e789@cluster0.ehrrtxz.mongodb.net/todolistDB",{useNewUrlParser:true});

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const itemSchema = {
    name: String
}

const listSchema = {
    name:String,
    items:[itemSchema]
}

const List = mongoose.model("List", listSchema)

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to the list"
});

const item2 = new Item({
    name: "Click on + to add an item to the list"
});

const item3 = new Item({
    name: "<-- Click on checkbox to delete an item"
});

const defaultItemlist=[item1,item2,item3];

const options = {weekday : 'long', year: 'numeric', month:'long'}
let today = new Date().toLocaleDateString('en-us',options)

app.get('/', function(req, res){
   
    Item.find({},function(err,foundItems){
        if (foundItems.length===0){
            Item.insertMany(defaultItemlist, function(err){
                if (err){
                    console.log(err);
                } else { 
                    console.log("successfully added");
                }
            });
            res.redirect("/");
        }

        else{
            res.render('tempelate',{listTitle:today, itemlist:foundItems})
            }
    })
   
});


app.get('/:customlistName', function(req, res){
    const listName = _.capitalize(req.params.customlistName);
    List.findOne({name:listName}, function(err,found){
        if(!err){
            if (!found){
                const list = new List({
                    name: listName,
                    items:defaultItemlist
                });
            
                list.save();
                res.redirect("/"+listName)
            }

            else{
                res.render("tempelate", {listTitle:found.name, itemlist:found.items});
            }
        }
    })
    


});

app.get("/about", function(req, res){
    res.render("about")
})


app.post('/', function(req, res){
    const itemName = req.body.additem
    const listName = req.body.listtype
    const item = new Item({
        name: itemName
    })

    if (listName===today){
        item.save();
        res.redirect('/');
    } else {
        List.findOne({name:listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
   
    }
)

app.post("/delete",function(req,res){
    const itemid = req.body.checkbox;
    const listName = req.body.listName;

    if (listName===today){
        Item.findByIdAndRemove({_id:itemid}, function(err){
            if (err){
                console.log(err);
            } else {
                console.log("Successfully removed item")
            }
        })
        res.redirect("/")
    } else {
        List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:itemid}}}, function(err,foundList){
            if (!err){
                res.redirect("/"+listName)
            }
        });
    }
    
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("server is running");
})

