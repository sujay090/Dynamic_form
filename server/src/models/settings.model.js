import { Schema, model } from "mongoose";

const settingsSchema = new Schema(
  {
    // Header Settings
    header: {
      // Site Branding
      siteName: {
        type: String,
        default: "",
        trim: true,
      },
      tagline: {
        type: String,
        default: "",
        trim: true,
      },
      logo: {
        type: String, // URL to logo image
        default: "",
      },
      
      // Navigation Menu
      navigation: [{
        title: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
        order: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      }],
      
      // Contact Information in Header
      contactInfo: {
        phone: {
          type: String,
          default: "",
          trim: true,
        },
        email: {
          type: String,
          default: "",
          trim: true,
        },
      },
    },

    // Body/Main Content Settings
    body: {
      // Hero Section
      hero: {
        title: {
          type: String,
          default: "",
          trim: true,
        },
        subtitle: {
          type: String,
          default: "",
          trim: true,
        },
        backgroundImage: {
          type: String, // URL to hero background image
          default: "",
        },
        ctaButton: {
          text: {
            type: String,
            default: "",
            trim: true,
          },
          url: {
            type: String,
            default: "",
            trim: true,
          },
          isVisible: {
            type: Boolean,
            default: true,
          },
        },
      },

      // About Section
      about: {
        title: {
          type: String,
          default: "",
          trim: true,
        },
        description: {
          type: String,
          default: "",
          trim: true,
        },
        image: {
          type: String, // URL to about image
          default: "",
        },
        features: [{
          title: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            required: true,
            trim: true,
          },
          icon: {
            type: String,
            default: "",
          },
        }],
      },

      // Services Section
      services: {
        title: {
          type: String,
          default: "",
          trim: true,
        },
        subtitle: {
          type: String,
          default: "",
          trim: true,
        },
        servicesList: [{
          title: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            required: true,
            trim: true,
          },
          image: {
            type: String,
            default: "",
          },
          price: {
            type: String,
            default: "",
            trim: true,
          },
        }],
      },

      // Call to Action Section
      cta: {
        title: {
          type: String,
          default: "",
          trim: true,
        },
        description: {
          type: String,
          default: "",
          trim: true,
        },
        buttonText: {
          type: String,
          default: "",
          trim: true,
        },
        buttonUrl: {
          type: String,
          default: "",
          trim: true,
        },
        backgroundImage: {
          type: String,
          default: "",
        },
      },
    },

    // Footer Settings
    footer: {
      // Company Information
      companyInfo: {
        name: {
          type: String,
          default: "",
          trim: true,
        },
        description: {
          type: String,
          default: "",
          trim: true,
        },
        logo: {
          type: String,
          default: "",
        },
      },

      // Contact Details
      contact: {
        address: {
          type: String,
          default: "",
          trim: true,
        },
        phone: {
          type: String,
          default: "",
          trim: true,
        },
        email: {
          type: String,
          default: "",
          trim: true,
        },
        workingHours: {
          type: String,
          default: "",
          trim: true,
        },
      },

      // Quick Links
      quickLinks: [{
        title: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
        order: {
          type: Number,
          default: 0,
        },
      }],

      // Social Media Links
      socialMedia: {
        facebook: {
          type: String,
          default: "",
          trim: true,
        },
        twitter: {
          type: String,
          default: "",
          trim: true,
        },
        instagram: {
          type: String,
          default: "",
          trim: true,
        },
        linkedin: {
          type: String,
          default: "",
          trim: true,
        },
        youtube: {
          type: String,
          default: "",
          trim: true,
        },
      },

      // Copyright Information
      copyright: {
        text: {
          type: String,
          default: "",
          trim: true,
        },
        year: {
          type: Number,
          default: 2024,
        },
      },
    },

    // Theme Settings
    theme: {
      primaryColor: {
        type: String,
        default: "#3B82F6", // Blue
      },
      secondaryColor: {
        type: String,
        default: "#1F2937", // Dark gray
      },
      accentColor: {
        type: String,
        default: "#F59E0B", // Yellow
      },
      fontFamily: {
        type: String,
        default: "Inter",
      },
    },

    // Settings Status
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Track who last updated
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to handle copyright field migration
settingsSchema.pre('save', function(next) {
  // Handle copyright field migration from string to object
  if (this.footer && this.footer.copyright && typeof this.footer.copyright === 'string') {
    this.footer.copyright = {
      text: this.footer.copyright,
      year: new Date().getFullYear()
    };
  }
  next();
});

// Pre-findOneAndUpdate middleware to handle copyright field migration
settingsSchema.pre(['findOneAndUpdate', 'updateOne'], function(next) {
  const update = this.getUpdate();
  
  // Handle $set updates
  if (update.$set && update.$set.footer && update.$set.footer.copyright && typeof update.$set.footer.copyright === 'string') {
    update.$set.footer.copyright = {
      text: update.$set.footer.copyright,
      year: new Date().getFullYear()
    };
  }
  
  // Handle direct updates
  if (update.footer && update.footer.copyright && typeof update.footer.copyright === 'string') {
    update.footer.copyright = {
      text: update.footer.copyright,
      year: new Date().getFullYear()
    };
  }
  
  next();
});

// Post-init middleware to handle data retrieved from database
settingsSchema.post('init', function() {
  // Handle copyright field migration when data is loaded from database
  if (this.footer && this.footer.copyright && typeof this.footer.copyright === 'string') {
    this.footer.copyright = {
      text: this.footer.copyright,
      year: new Date().getFullYear()
    };
  }
});

// Index for faster queries
settingsSchema.index({ isActive: 1 });

// Ensure virtual fields are serialized
settingsSchema.set('toJSON', { virtuals: true });
settingsSchema.set('toObject', { virtuals: true });

export const Settings = model("Settings", settingsSchema);
