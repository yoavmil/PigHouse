import { Schema, model } from 'mongoose';

const SubtaskSchema = new Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
});

SubtaskSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => { delete ret._id; delete ret.__v; },
});

const CardSchema = new Schema(
  {
    familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
    title:    { type: String, required: true },
    subtasks: { type: [SubtaskSchema], default: [] },
    price:    { type: Number, required: true },
    state:    {
      type:    String,
      enum:    ['suspended', 'available', 'taken', 'pending'],
      default: 'available',
    },
    takenBy:  { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

CardSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => { delete ret._id; delete ret.__v; },
});

export const Card = model('Card', CardSchema);
