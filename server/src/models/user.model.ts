import { Schema, model } from 'mongoose';

const CompletedCardSchema = new Schema(
  {
    cardId:      { type: Schema.Types.ObjectId, ref: 'Card', required: true },
    cardTitle:   { type: String, required: true },
    amount:      { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    familyId:       { type: Schema.Types.ObjectId, ref: 'Family', required: true },
    name:           { type: String, required: true },
    role:           { type: String, enum: ['parent', 'kid'], required: true },
    balance:        { type: Number, default: 0 },
    completedCards: { type: [CompletedCardSchema], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

UserSchema.index({ familyId: 1, name: 1 }, { unique: true });

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => { delete ret._id; delete ret.__v; },
});

export const User = model('User', UserSchema);
