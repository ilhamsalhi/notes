const loginRouter = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("../utils/config")

loginRouter.post("/", async (req, res) => {
    const { username, password } = req.body

    console.log(req.body)
    const user = await User.findOne({username})
    const correctPassword = user !== null ? await bcrypt.compare(password, user.passwordHash) : false

    if (!user || !correctPassword)
        return (res.status(401)
        .send({error: "invalid user or password"}))

    // generating authN token for stateless authN using json web token
    const userForToken = {
        username,
        id: user.id
    }
    const token = jwt.sign(userForToken, config.SECRET)
    res.status(200)
        .json({
            token,
            username: user.username,
            name: user.name
        })
})


module.exports = loginRouter