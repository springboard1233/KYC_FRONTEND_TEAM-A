const mongoose= require("mongoose");
const bycrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: [true,"Name is required"],
    },
    email: {
        type: String,
        required: [true,"Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    photo: {
        type: String,
        // required: [true, "Photo is required"],
        default: "",
        },
},
{timestamps: true,}
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) {
        return next();
    }
    // Hash the password before saving the user
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
})

const User = mongoose.model("User", userSchema);
module.exports = User;