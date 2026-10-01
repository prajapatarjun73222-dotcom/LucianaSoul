import { Schema, model } from 'mongoose';
export const HOMEPAGE_SLOTS = [
    'hero',
    'featuredCollection',
    'instagram',
    'sustainability',
    'bespoke',
    'footerGallery',
];
const mediaRefs = [{ type: Schema.Types.ObjectId, ref: 'Media' }];
const settingsSchema = new Schema({
    key: { type: String, default: 'site', unique: true },
    homepage: {
        hero: mediaRefs,
        featuredCollection: mediaRefs,
        instagram: mediaRefs,
        sustainability: mediaRefs,
        bespoke: mediaRefs,
        footerGallery: mediaRefs,
    },
    about: {
        designer: { type: String, default: '' },
        philosophy: { type: String, default: '' },
        upcycling: { type: String, default: '' },
        bespoke: { type: String, default: '' },
        london: { type: String, default: '' },
        designerMedia: { type: Schema.Types.ObjectId, ref: 'Media' },
    },
    sustainabilityText: { type: String, default: '' },
    contact: {
        phone: { type: String, default: '+44 7454 720895' },
        whatsapp: { type: String, default: '447454720895' },
        email: { type: String, default: 'pulciniluciana@gmail.com' },
        addressLines: { type: [String], default: ['210/212 Southwark Park Road', 'London', 'SE16 3RX'] },
        instagram: { type: String, default: 'luciana_soul' },
        googleMapsUrl: { type: String, default: '' },
    },
    seo: {
        title: { type: String, default: 'LucianaSoul | Bespoke & Up-Cycled Fashion Designer in London' },
        description: {
            type: String,
            default: 'LucianaSoul creates unique and bespoke clothing in London, combining creative design with up-cycled textiles and individual craftsmanship.',
        },
        ogImage: { type: String, default: '' },
    },
    collectionCategories: {
        type: [{ _id: false, key: String, label: String, visible: { type: Boolean, default: true } }],
        default: [
            { key: 'upcycled', label: 'Up-cycled', visible: true },
            { key: 'bespoke', label: 'Bespoke', visible: true },
            { key: 'dresses', label: 'Dresses', visible: true },
            { key: 'womenswear', label: 'Womenswear', visible: true },
            { key: 'menswear', label: 'Menswear', visible: true },
            { key: 'accessories', label: 'Accessories', visible: true },
            { key: 'textiles', label: 'Textiles', visible: true },
            { key: 'archive', label: 'Archive', visible: true },
        ],
    },
    smtp: {
        host: { type: String, default: '' },
        port: { type: Number, default: 587 },
        secure: { type: Boolean, default: false },
        user: { type: String, default: '' },
        pass: { type: String, default: '' },
        from: { type: String, default: '' },
        notifyTo: { type: String, default: 'pulciniluciana@gmail.com' },
    },
}, { timestamps: true });
export const Settings = model('Settings', settingsSchema);
export async function getSettings() {
    const existing = await Settings.findOne({ key: 'site' });
    if (existing)
        return existing;
    return Settings.create({ key: 'site' });
}
