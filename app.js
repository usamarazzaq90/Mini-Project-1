const express=require('express')
const app=express();
const userModel=require('./models/user')
const postModel=require('./models/post')
const cookieParser=require('cookie-parser')
const bcryptjs=require('bcryptjs')
const jwt=require("jsonwebtoken")

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.render("index")
})

app.get('/login',(req,res)=>{
    res.render("login")
})

app.get('/profile',isLoggedIn,(req,res)=>{
    console.log(req.user);
    res.render("login")
})

app.post('/register',async(req,res)=>{
    let {email,password,username,name,age}=req.body;
    let user=await userModel.findOne({email});
    if(user) return res.status(500).send("User already registered")

    bcryptjs.genSalt(10,(err,salt)=>{
        bcryptjs.hash(password,salt, async(err,hash)=>{
            let user= await userModel.create({
                name,
                username,
                email,
                password:hash,
                age
            });
            let token=jwt.sign({email: email, id:user._id},"shh")
            res.cookie("token",token)
            res.send("Registered")
        })
    })
})

app.post('/login',async(req,res)=>{
    let {email,password}=req.body;
    let user=await userModel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong!")

    bcryptjs.compare(password, user.password, function(err,result){
        if(result){
            let token=jwt.sign({email: email, id:user._id},"shh")
            res.cookie("token",token)
            res.status(200).send("You can login!")
        }
        else res.redirect('/login')
    })
})

app.get('/logout',(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})

//Protected Routes
function isLoggedIn(req,res,next){
    if(req.cookies.token==="") res.send("You must be logged in");
    else{
        let data=jwt.verify(req.cookies.token,"shh",)
        req.user=data;
        next();
    }
}


// app.listen('3000')
//or
app.listen(3000)