const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ishitsathe02:ishitsathe02@smartnoter.43fxx.mongodb.net/?retryWrites=true&w=majority&appName=Smartnoter').then(async () => {
    const db = mongoose.connection.db;
    const history = await db.collection('histories').find({}).sort({createdAt: -1}).limit(10).toArray();
    for(const h of history) {
        console.log("History ID:", h._id, "Model:", h.modelName, "ModelId:", h.modelId);
        if (h.modelName === 'generatedsummaryfromwebs') {
             const data = await db.collection('generatedsummaryfromwebs').findOne({_id: h.modelId[0]});
             console.log("  Web Data:", data ? "Found" : "Not Found", "Title:", data?.title, "Summarization length:", data?.summarization?.length);
        }
        if (h.modelName === 'generatedsummaryfromtexts') {
             const data = await db.collection('generatedsummaryfromtexts').findOne({_id: h.modelId[0]});
             console.log("  Text Data:", data ? "Found" : "Not Found", "Title:", data?.title, "Summarization length:", data?.summarization?.length);
        }
    }
    process.exit(0);
});
