import { Schema, model } from 'mongoose';

const SubtaskSchema = new Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const CompletionEntrySchema = new Schema(
  {
    kidId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    kidName:     { type: String, required: true },
    price:       { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

SubtaskSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => { delete ret._id; delete ret.__v; },
});

const CardSchema = new Schema(
  {
    familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
    title:    { type: String, default: '' },
    subtasks: { type: [SubtaskSchema], default: [] },
    price:    { type: Number, default: 10 },
    state:    {
      type:    String,
      enum:    ['suspended', 'available', 'taken', 'pending'],
      default: 'available',
    },
    takenBy:           { type: Schema.Types.ObjectId, ref: 'User', default: null },
    completionHistory: { type: [CompletionEntrySchema], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

CardSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => { delete ret._id; delete ret.__v; },
});

export const Card = model('Card', CardSchema);
