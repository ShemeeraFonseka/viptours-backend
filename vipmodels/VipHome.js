import mongoose from 'mongoose';
const VipHomeSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  line: { type: String, required: true },
  welcometopic: { type: String, required: true },
  welcomepara1: { type: String, required: true },
  welcomepara2: { type: String, required: true },
  servicetopic1: { type: String, required: true },
  servicepara1: { type: String, required: true },
  servicetopic2: { type: String, required: true },
  servicepara2: { type: String, required: true },
  servicetopic3: { type: String, required: true },
  servicepara3 :{ type: String, required: true },
  servicetopic4: { type: String, required: true },
  servicepara4: { type: String, required: true },
  
}, { timestamps: true });

export default mongoose.model('VipHome', VipHomeSchema);