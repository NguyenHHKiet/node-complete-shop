const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
    },
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity,
        });
    }

    const updatedCart = {
        items: updatedCartItems,
    };

    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const mongodb = require("mongodb");
// const getDB = require("../utils/database").getDb;
// const ObjectId = mongodb.ObjectId;

// class User {
//     constructor({ username, email, cart = { items: [] }, id }) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart; // {items:[]}
//         this._id = id;
//     }

//     save() {
//         const db = getDB();
//         return db.collection("users").insertOne(this);
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex((cp) => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({
//                 productId: new ObjectId(product._id),
//                 quantity: newQuantity,
//             });
//         }

//         const updatedCart = {
//             items: updatedCartItems,
//         };

//         const db = getDB();
//         return db
//             .collection("users")
//             .updateOne(
//                 { _id: new ObjectId(this._id) },
//                 { $set: { cart: updatedCart } }
//             );
//     }

//     getCart() {
//         const db = getDB();
//         const productIds = this.cart.items.map((i) => i.productId);

//         return db
//             .collection("products")
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then((products) => {
//                 return products.map((p) => {
//                     return {
//                         ...p,
//                         quantity: this.cart.items.find((i) => {
//                             return i.productId.toString() === p._id.toString();
//                         }).quantity,
//                     };
//                 });
//             })
//             .catch((err) => console.log(err));
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter((item) => {
//             return item.productId.toString() !== productId.toString();
//         });

//         const db = getDB();
//         return db
//             .collection("users")
//             .updateOne(
//                 { _id: new ObjectId(this._id) },
//                 { $set: { cart: { items: updatedCartItems } } }
//             );
//     }

//     addOrder() {
//         const db = getDB();
//         return this.getCart()
//             .then((products) => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new ObjectId(this._id),
//                         username: this.username,
//                     },
//                 };
//                 return db.collection("orders").insertOne(order);
//             })
//             .then(() => {
//                 this.cart = { items: [] };
//                 return db
//                     .collection("users")
//                     .updateOne(
//                         { _id: new ObjectId(this._id) },
//                         { $set: { cart: { items: [] } } }
//                     );
//             })
//             .catch((err) => console.log(err));
//     }

//     getOrders() {
//         const db = getDB();
//         return db
//             .collection("orders")
//             .find({ "users._id": new ObjectId(this._id) })
//             .toArray();
//     }

//     static findById(id) {
//         const db = getDB();
//         return db
//             .collection("users")
//             .findOne({ _id: new ObjectId(id) })
//             .then((user) => {
//                 console.log(user);
//                 return user;
//             })
//             .catch((err) => console.log(err));
//     }
// }

// module.exports = User;
