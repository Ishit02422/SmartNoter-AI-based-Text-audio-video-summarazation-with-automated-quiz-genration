const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VideoToText').then(async () => {
    const db = mongoose.connection.db;
    const history = await db.collection('histories').find({}).sort({createdAt: -1}).limit(20).toArray();
    for(const h of history) {
        if (h.modelName === 'generatedsummaryfromwebs') {
             const data = await db.collection('generatedsummaryfromwebs').findOne({_id: h.modelId[0]});
             console.log("Web Data keyPoints type:", typeof data?.keyPoints, Array.isArray(data?.keyPoints));
        }
        if (h.modelName === 'generatedsummaryfromtexts') {
             const data = await db.collection('generatedsummaryfromtexts').findOne({_id: h.modelId[0]});
             console.log("Text Data keyPoints type:", typeof data?.keyPoints, Array.isArray(data?.keyPoints));
        }
    }
    process.exit(0);
});
