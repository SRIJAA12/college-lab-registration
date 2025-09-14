import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  rollNo: string;
  labNo: string;
  systemNo: string;
  timestamp: Date;
  machineId: string;
  systemInfo: {
    platform: string;
    hostname: string;
    arch?: string;
    version?: string;
    memory?: string;
    cpuModel?: string;
  };
  ipAddress?: string;
  sessionDuration?: number;
  status: 'active' | 'completed' | 'interrupted';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true,
    uppercase: true,
    index: true,
    validate: {
      validator: function(value: string) {
        return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{3,4}$/.test(value);
      },
      message: 'Invalid roll number format'
    }
  },
  labNo: {
    type: String,
    required: [true, 'Lab number is required'],
    trim: true,
    enum: {
      values: ['Lab-1', 'Lab-2', 'Lab-3', 'Lab-4', 'Lab-5'],
      message: 'Invalid lab number'
    },
    index: true
  },
  systemNo: {
    type: String,
    required: [true, 'System number is required'],
    trim: true,
    maxlength: [20, 'System number cannot exceed 20 characters'],
    validate: {
      validator: function(value: string) {
        // Allow formats like: PC-01, SYS-15, COMP-001
        return /^[A-Z]{2,4}-\d{1,3}$/.test(value.toUpperCase());
      },
      message: 'System number should be in format like PC-01 or SYS-15'
    }
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required'],
    index: true,
    validate: {
      validator: function(value: Date) {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
        return value >= oneHourAgo && value <= now;
      },
      message: 'Timestamp must be within the last hour'
    }
  },
  machineId: {
    type: String,
    required: [true, 'Machine ID is required'],
    trim: true,
    index: true,
    minlength: [10, 'Machine ID seems too short'],
    validate: {
      validator: function(value: string) {
        // Validate that it's a proper machine ID format
        return /^[a-f0-9\-]+$/i.test(value);
      },
      message: 'Invalid machine ID format'
    }
  },
  systemInfo: {
    platform: {
      type: String,
      required: [true, 'Platform information is required'],
      trim: true,
      enum: ['win32', 'darwin', 'linux', 'web']
    },
    hostname: {
      type: String,
      required: [true, 'Hostname is required'],
      trim: true,
      maxlength: [255, 'Hostname too long']
    },
    arch: {
      type: String,
      trim: true,
      enum: ['x64', 'x32', 'arm64', 'arm']
    },
    version: {
      type: String,
      trim: true,
      maxlength: [100, 'Version string too long']
    },
    memory: {
      type: String,
      trim: true,
      maxlength: [50, 'Memory info too long']
    },
    cpuModel: {
      type: String,
      trim: true,
      maxlength: [200, 'CPU model info too long']
    }
  },
  ipAddress: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        if (!value) return true;
        // IPv4 or IPv6 validation
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(value) || ipv6Regex.test(value);
      },
      message: 'Invalid IP address format'
    }
  },
  sessionDuration: {
    type: Number,
    min: [0, 'Session duration cannot be negative'],
    max: [28800, 'Session duration cannot exceed 8 hours'], // 8 hours in seconds
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'interrupted'],
      message: 'Invalid status'
    },
    default: 'active',
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
RegistrationSchema.index({ labNo: 1, timestamp: -1 });
RegistrationSchema.index({ rollNo: 1, timestamp: -1 });
RegistrationSchema.index({ machineId: 1, timestamp: -1 });
RegistrationSchema.index({ timestamp: -1, status: 1 });
RegistrationSchema.index({ userId: 1, timestamp: -1 });

// Ensure unique registration per student per system per day
RegistrationSchema.index(
  { rollNo: 1, labNo: 1, systemNo: 1, timestamp: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'active' }
  }
);

// Virtual for formatted timestamp
RegistrationSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
});

// Virtual for session duration in human readable format
RegistrationSchema.virtual('formattedDuration').get(function() {
  const duration = this.sessionDuration || 0;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
});

// Instance methods
RegistrationSchema.methods.updateSessionDuration = function() {
  const now = new Date();
  this.sessionDuration = Math.floor((now.getTime() - this.timestamp.getTime()) / 1000);
  return this.sessionDuration;
};

RegistrationSchema.methods.endSession = async function(notes?: string) {
  this.status = 'completed';
  this.updateSessionDuration();
  if (notes) {
    this.notes = notes;
  }
  return await this.save();
};

// Static methods
RegistrationSchema.statics.getByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('userId', 'name email department').sort({ timestamp: -1 });
};

RegistrationSchema.statics.getActiveRegistrations = function() {
  return this.find({ status: 'active' })
    .populate('userId', 'name email department')
    .sort({ timestamp: -1 });
};

RegistrationSchema.statics.getLabStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$labNo',
        totalRegistrations: { $sum: 1 },
        uniqueStudents: { $addToSet: '$rollNo' },
        activeRegistrations: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        lastUsed: { $max: '$timestamp' }
      }
    },
    {
      $project: {
        labNo: '$_id',
        totalRegistrations: 1,
        uniqueStudents: { $size: '$uniqueStudents' },
        activeRegistrations: 1,
        lastUsed: 1,
        _id: 0
      }
    },
    {
      $sort: { labNo: 1 }
    }
  ]);
};

RegistrationSchema.statics.getSystemUtilization = function(labNo: string) {
  return this.aggregate([
    { $match: { labNo } },
    {
      $group: {
        _id: '$systemNo',
        totalUsage: { $sum: 1 },
        totalDuration: { $sum: '$sessionDuration' },
        lastUsed: { $max: '$timestamp' },
        uniqueUsers: { $addToSet: '$rollNo' }
      }
    },
    {
      $project: {
        systemNo: '$_id',
        totalUsage: 1,
        totalDuration: 1,
        averageDuration: { $divide: ['$totalDuration', '$totalUsage'] },
        uniqueUsers: { $size: '$uniqueUsers' },
        lastUsed: 1,
        _id: 0
      }
    },
    {
      $sort: { totalUsage: -1 }
    }
  ]);
};

export default mongoose.model<IRegistration>('Registration', RegistrationSchema);
