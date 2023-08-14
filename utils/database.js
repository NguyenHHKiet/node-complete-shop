const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const uri =
    "mongodb+srv://nhoangkiet35:2mif8aQalNaAfz0K@cluster0.yq5iral.mongodb.net/shop?retryWrites=true&w=majority";

const mongoConnect = (callback) => {
    MongoClient.connect(uri)
        .then((client) => {
            console.log("Connected!");
            _db = client.db();
            callback();
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
