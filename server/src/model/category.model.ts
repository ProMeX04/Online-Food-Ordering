import  { Document, Schema, model } from "mongoose"
import slugify from "slugify"

export interface ICategory {
    name: string
    slug: string
    description: string
    imageUrl: string
}


export interface ICategoryDocument extends ICategory, Document { }


const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    imageUrl: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false,
})

CategorySchema.pre('save', function (this: any, next) {
    if (this.isModified && this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

CategorySchema.pre<any>('findOneAndUpdate', function (next) {
    const update = this.getUpdate() as Partial<ICategory>
    if (update.name) {
        this.set({ slug: slugify(update.name, { lower: true, strict: true }) })
    }
    next()
})

const CategoryModel = model<ICategory>("Category", CategorySchema)

export default CategoryModel
