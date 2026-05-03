import { model, Schema } from "mongoose";
import { IMindMap, ISubTopic, ITopic } from "../types";
const SubTopicSchema = new Schema<ISubTopic>({
  subTopic: {
    type: String,
    default: "",
  },
  detail: {
    type: String,
    default: "",
  },
});

const TopicSchema = new Schema<ITopic>({
  topic: {
    type: String,
    default: "",
  },
  subtopics: [SubTopicSchema],
});

const MindMap = new Schema<IMindMap>(
  {
    summaryId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    source: {
      type: String,
      enum: ["pdf", "audio", "video", "web", "text"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    title: {
      type: String,
      default: "",
    },
    topics: [TopicSchema],
  },
  { timestamps: true }
);
export const MindMapModel = model<IMindMap>("MindMap", MindMap);
