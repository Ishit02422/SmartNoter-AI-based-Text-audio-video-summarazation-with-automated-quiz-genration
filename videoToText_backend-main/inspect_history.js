const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VideoToText').then(async () => {
    const db = mongoose.connection.db;
    const history = await db.collection('histories').find({}).sort({createdAt: -1}).limit(10).toArray();
    for(const h of history) {
        console.log("ModelName:", h.modelName, "ModelId:", h.modelId);
        // Try to fetch data
        const coll = await db.collection(h.modelName).find({_id: {$in: h.modelId}}).toArray();
        console.log("Data sample:", coll[0]?.title || coll[0]?.topic || coll[0]?.text?.substring(0, 20));
    }
    process.exit(0);
});
