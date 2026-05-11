import { Schema, model } from 'mongoose';

const FamilySchema = new Schema(
  { name: { type: String, required: true, unique: true } },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

FamilySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => { delete ret._id; delete ret.__v; },
});

export const Family = model('Family', FamilySchema);
