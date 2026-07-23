const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
.then(async () => {

    const user = await User.create({
        name: "Admin",
        email: "admin@example.com",
        password: "123456",
        role: "ADMIN"
    });

    console.log("Admin created:", user.email);

    mongoose.connection.close();

})
.catch(err => {
    console.log(err);
});
