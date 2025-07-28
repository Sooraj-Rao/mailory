import { Schema, model, models, Document } from "mongoose";

interface IDNSRecord {
  name: string;
  type: string;
  value: string;
  priority?: number;
}

interface IDomain extends Document {
  userId: Schema.Types.ObjectId;
  domain: string;
  mailFromDomain?: string;
  dnsRecords: IDNSRecord[];
  verified: boolean;
  dkimStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const dnsRecordSchema = new Schema<IDNSRecord>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  priority: { type: Number, required: false },
});

const domainSchema = new Schema<IDomain>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    domain: { type: String, required: true, unique: true, trim: true },
    mailFromDomain: { type: String, required: false, trim: true },
    dnsRecords: [dnsRecordSchema],
    verified: { type: Boolean, default: false },
    dkimStatus: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export const Domain = models.Domain || model<IDomain>("Domain", domainSchema);
