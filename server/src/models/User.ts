import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  dob?: Date;
  rollNo?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    validate: {
      validator: function(password: string) {
        // At least one letter, one number, and minimum 6 characters
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(password);
      },
      message: 'Password must contain at least one letter and one number'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['student', 'faculty'],
      message: 'Role must be either student or faculty'
    },
    required: [true, 'Role is required']
  },
  dob: {
    type: Date,
    required: function(this: IUser) {
      return this.role === 'student';
    },
    validate: {
      validator: function(this: IUser, value: Date) {
        if (this.role === 'student' && value) {
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 16 && age - 1 <= 35;
          }
          return age >= 16 && age <= 35;
        }
        return true;
      },
      message: 'Student age must be between 16 and 35 years'
    }
  },
  rollNo: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'student';
    },
    trim: true,
    uppercase: true,
    validate: {
      validator: function(this: IUser, value: string) {
        if (this.role === 'student' && value) {
          // Format: 2 letters + 2 digits + 2 letters + 4 digits (e.g., CS21A001)
          return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{3,4}$/.test(value);
        }
        return true;
      },
      message: 'Roll number format should be like CS21A001'
    },
    unique: true,
    sparse: true // Allow multiple null values but unique non-null values
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters'],
    enum: {
      values: [
        'Computer Science',
        'Information Technology', 
        'Electronics',
        'Mechanical',
        'Civil',
        'Electrical',
        'Chemical',
        'Biotechnology',
        'Mathematics',
        'Physics',
        'Chemistry'
      ],
      message: 'Invalid department'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ rollNo: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ department: 1, role: 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

UserSchema.statics.findActiveStudents = function() {
  return this.find({ role: 'student', isActive: true }).select('-password');
};

UserSchema.statics.findActiveFaculty = function() {
  return this.find({ role: 'faculty', isActive: true }).select('-password');
};

export default mongoose.model<IUser>('User', UserSchema);
