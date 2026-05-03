const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VideoToText').then(async () => {
    const db = mongoose.connection.db;
    const history = await db.collection('histories').find({modelName: 'mindmaps'}).sort({createdAt: -1}).limit(1).toArray();
    if(history.length > 0) {
        const h = history[0];
        console.log("ModelName:", h.modelName);
        const coll = await db.collection(h.modelName).find({_id: {$in: h.modelId}}).toArray();
        console.log("Data keys:", Object.keys(coll[0] || {}));
        console.log("Data sample summaryId:", coll[0]?.summaryId, "source:", coll[0]?.source);
    }
    process.exit(0);
});
