const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ishitsathe02:ishitsathe02@smartnoter.43fxx.mongodb.net/?retryWrites=true&w=majority&appName=Smartnoter').then(async () => {
    const db = mongoose.connection.db;
    const history = await db.collection('historics').find({}).sort({createdAt: -1}).limit(5).toArray();
    console.log(JSON.stringify(history.map(h => ({ modelName: h.modelName, id: h._id }))));
    process.exit(0);
});
