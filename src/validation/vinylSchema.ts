import { z } from 'zod';

const vinylConditionEnum = z.enum([
  'Mint (M)',
  'Near Mint (NM)',
  'Very Good Plus (VG+)',
  'Very Good (VG)',
  'Good Plus (G+)',
  'Good (G)',
  'Fair (F)',
  'Poor (P)',
]);

const artistSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Artist name is required'),
  role: z.string().optional(),
});

export const vinylSchema = z.object({
  // Identifiers
  id: z.string(),
  discogsReleaseId: z.number().positive().optional(),
  discogsMasterId: z.number().positive().optional(),

  // Basic information
  artist: z.string().min(1, 'Artist is required').max(200, 'Artist must be less than 200 characters'),
  artists: z.array(artistSchema).min(1, 'At least one artist is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  label: z.string().max(100, 'Label must be less than 100 characters'),
  catalogNumber: z.string().max(50, 'Catalog number must be less than 50 characters'),
  releaseYear: z.number()
    .int('Release year must be a whole number')
    .min(1900, 'Release year must be 1900 or later')
    .max(new Date().getFullYear() + 1, 'Release year cannot be in the future'),
  country: z.string().max(50, 'Country must be less than 50 characters'),
  format: z.array(z.string()).min(1, 'At least one format is required'),
  genres: z.array(z.string()).max(10, 'Maximum 10 genres allowed'),
  styles: z.array(z.string()).max(10, 'Maximum 10 styles allowed'),

  // Physical details
  coverImageUrl: z.string().url('Cover image URL must be valid').or(z.literal('')),
  sleeveCondition: vinylConditionEnum,
  mediaCondition: vinylConditionEnum,
  pressNumber: z.string().max(50, 'Press number must be less than 50 characters').optional(),
  colorVariant: z.string().max(100, 'Color variant must be less than 100 characters').optional(),
  weight: z.string().max(20, 'Weight must be less than 20 characters').optional(),

  // Collection metadata
  purchasePrice: z.number().min(0, 'Purchase price must be non-negative').optional(),
  purchaseDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Purchase date must be a valid date'),
  purchaseCurrency: z.string().length(3, 'Currency must be 3-letter code (e.g., USD)').default('USD'),
  storageLocation: z.string().max(100, 'Storage location must be less than 100 characters'),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters'),

  // Market data
  currentLowestPrice: z.number().min(0, 'Price must be non-negative').optional(),
  currentMedianPrice: z.number().min(0, 'Price must be non-negative').optional(),
  currentHighestPrice: z.number().min(0, 'Price must be non-negative').optional(),
  suggestedPrice: z.number().min(0, 'Price must be non-negative').optional(),
  lastPriceUpdate: z.string().datetime().optional(),

  // Performance tracking
  estimatedValue: z.number().min(0, 'Estimated value must be non-negative').optional(),
  gainLoss: z.number().optional(),
  gainLossPercentage: z.number().optional(),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastSyncedWithDiscogs: z.string().datetime().optional(),
});

export const vinylInputSchema = vinylSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  gainLoss: true,
  gainLossPercentage: true,
});

export const vinylUpdateSchema = vinylSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type VinylInput = z.infer<typeof vinylInputSchema>;
export type VinylUpdate = z.infer<typeof vinylUpdateSchema>;

// Validation functions
export const validateVinyl = (data: unknown) => {
  return vinylSchema.safeParse(data);
};

export const validateVinylInput = (data: unknown) => {
  return vinylInputSchema.safeParse(data);
};

export const validateVinylUpdate = (data: unknown) => {
  return vinylUpdateSchema.safeParse(data);
};

// Helper function to get validation errors
export const getValidationErrors = (result: z.SafeParseError<any>) => {
  return result.error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};
