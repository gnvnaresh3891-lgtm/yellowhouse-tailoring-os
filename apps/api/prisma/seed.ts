import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    garmentName: "Men's Bespoke 3-Piece Suit",
    gender: 'Men',
    category: 'Western',
    pomSchema: [
      { id: 'm-su-01', code: 'M-SU-01', name: 'Jacket Chest Circumference', category: 'girth', baseMeasurement: 40.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: 'hs-mens-chest', unit: 'in', validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
      { id: 'm-su-02', code: 'M-SU-02', name: 'Buttoning Waist Point', category: 'girth', baseMeasurement: 34.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: 'hs-mens-waist', unit: 'in', validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
      { id: 'm-su-03', code: 'M-SU-03', name: 'Hip / Seat Circumference', category: 'girth', baseMeasurement: 41.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: 'hs-mens-hip', unit: 'in', validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
      { id: 'm-su-04', code: 'M-SU-04', name: 'Shoulder Width (Acromion to Acromion)', category: 'width', baseMeasurement: 18.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-mens-shoulder', unit: 'in', validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
      { id: 'm-su-05', code: 'M-SU-05', name: 'Center Back Jacket Length', category: 'length', baseMeasurement: 30.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-mens-jacket-len', unit: 'in', validationRange: { min: 24.0, max: 38.0, step: 0.25 } },
      { id: 'm-su-06', code: 'M-SU-06', name: 'Sleeve Length (Crown to Wrist)', category: 'sleeve', baseMeasurement: 25.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-sleeve', unit: 'in', validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
      { id: 'm-su-07', code: 'M-SU-07', name: 'Armscye / Armhole Depth', category: 'width', baseMeasurement: 10.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: 'hs-mens-armscye', unit: 'in', validationRange: { min: 7.0, max: 14.0, step: 0.25 } },
      { id: 'm-su-08', code: 'M-SU-08', name: 'Bicep Circumference', category: 'girth', baseMeasurement: 14.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: 'hs-mens-bicep', unit: 'in', validationRange: { min: 10.0, max: 22.0, step: 0.25 } },
    ],
  },
  {
    garmentName: "Men's Royal Sherwani",
    gender: 'Men',
    category: 'Ethnic',
    pomSchema: [
      { id: 'm-sh-01', code: 'M-SH-01', name: 'Chest Circumference', category: 'girth', baseMeasurement: 40.0, defaultEase: 5.0, tolerance: 0.25, landmarkId: 'hs-mens-chest', unit: 'in', validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
      { id: 'm-sh-02', code: 'M-SH-02', name: 'Natural Waist', category: 'girth', baseMeasurement: 34.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: 'hs-mens-waist', unit: 'in', validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
      { id: 'm-sh-03', code: 'M-SH-03', name: 'Hip / Seat Circumference', category: 'girth', baseMeasurement: 41.0, defaultEase: 4.5, tolerance: 0.25, landmarkId: 'hs-mens-hip', unit: 'in', validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
      { id: 'm-sh-04', code: 'M-SH-04', name: 'Shoulder Width (Acromion to Acromion)', category: 'width', baseMeasurement: 18.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-mens-shoulder', unit: 'in', validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
      { id: 'm-sh-05', code: 'M-SH-05', name: 'Band Collar Height & Circumference', category: 'girth', baseMeasurement: 15.5, defaultEase: 0.85, tolerance: 0.125, landmarkId: 'hs-mens-neck', unit: 'in', validationRange: { min: 12.0, max: 22.0, step: 0.25 } },
      { id: 'm-sh-06', code: 'M-SH-06', name: 'Sherwani Full Length (C7 to Knee/Calf)', category: 'length', baseMeasurement: 42.0, defaultEase: 0.0, tolerance: 0.5, landmarkId: 'hs-mens-sherwani-len', unit: 'in', validationRange: { min: 34.0, max: 52.0, step: 0.5 } },
      { id: 'm-sh-07', code: 'M-SH-07', name: 'Sleeve Length (Crown to Wrist)', category: 'sleeve', baseMeasurement: 25.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-sleeve', unit: 'in', validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
      { id: 'm-sh-08', code: 'M-SH-08', name: 'Across Chest Width', category: 'width', baseMeasurement: 16.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-across-chest', unit: 'in', validationRange: { min: 13.0, max: 22.0, step: 0.25 } },
    ],
  },
  {
    garmentName: "Men's Custom Dress Shirt",
    gender: 'Men',
    category: 'Western',
    pomSchema: [
      { id: 'm-st-01', code: 'M-ST-01', name: 'Collar / Neck Band', category: 'girth', baseMeasurement: 15.5, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-mens-neck', unit: 'in', validationRange: { min: 12.0, max: 22.0, step: 0.25 } },
      { id: 'm-st-02', code: 'M-ST-02', name: 'Chest Circumference', category: 'girth', baseMeasurement: 40.0, defaultEase: 4.0, tolerance: 0.25, landmarkId: 'hs-mens-chest', unit: 'in', validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
      { id: 'm-st-03', code: 'M-ST-03', name: 'Waist Circumference', category: 'girth', baseMeasurement: 34.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: 'hs-mens-waist', unit: 'in', validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
      { id: 'm-st-04', code: 'M-ST-04', name: 'Shoulder Yoke Width', category: 'width', baseMeasurement: 18.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: 'hs-mens-shoulder', unit: 'in', validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
      { id: 'm-st-05', code: 'M-ST-05', name: 'Shirt Length (Back)', category: 'length', baseMeasurement: 30.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-mens-shirt-len', unit: 'in', validationRange: { min: 24.0, max: 38.0, step: 0.25 } },
      { id: 'm-st-06', code: 'M-ST-06', name: 'Sleeve Length', category: 'sleeve', baseMeasurement: 25.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-sleeve', unit: 'in', validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
      { id: 'm-st-07', code: 'M-ST-07', name: 'Cuff Circumference', category: 'girth', baseMeasurement: 8.5, defaultEase: 1.5, tolerance: 0.25, landmarkId: 'hs-mens-cuff', unit: 'in', validationRange: { min: 6.0, max: 13.0, step: 0.25 } },
    ],
  },
  {
    garmentName: "Men's Tailored Trouser",
    gender: 'Men',
    category: 'Western',
    pomSchema: [
      { id: 'm-tr-01', code: 'M-TR-01', name: 'Waistband Circumference', category: 'trouser', baseMeasurement: 34.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: 'hs-mens-trouser-waist', unit: 'in', validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
      { id: 'm-tr-02', code: 'M-TR-02', name: 'Seat / Hip Circumference', category: 'trouser', baseMeasurement: 41.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: 'hs-mens-hip', unit: 'in', validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
      { id: 'm-tr-03', code: 'M-TR-03', name: 'Outseam Length', category: 'trouser', baseMeasurement: 41.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-mens-outseam', unit: 'in', validationRange: { min: 32.0, max: 52.0, step: 0.25 } },
      { id: 'm-tr-04', code: 'M-TR-04', name: 'Inseam Length', category: 'trouser', baseMeasurement: 31.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-mens-inseam', unit: 'in', validationRange: { min: 24.0, max: 40.0, step: 0.25 } },
      { id: 'm-tr-05', code: 'M-TR-05', name: 'Thigh Circumference', category: 'trouser', baseMeasurement: 24.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: 'hs-mens-thigh', unit: 'in', validationRange: { min: 18.0, max: 34.0, step: 0.25 } },
      { id: 'm-tr-06', code: 'M-TR-06', name: 'Knee Circumference', category: 'trouser', baseMeasurement: 18.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: 'hs-mens-knee', unit: 'in', validationRange: { min: 13.0, max: 26.0, step: 0.25 } },
      { id: 'm-tr-07', code: 'M-TR-07', name: 'Leg Opening / Hem', category: 'trouser', baseMeasurement: 15.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: 'hs-mens-ankle', unit: 'in', validationRange: { min: 10.0, max: 22.0, step: 0.25 } },
      { id: 'm-tr-08', code: 'M-TR-08', name: 'Crotch Rise Depth', category: 'trouser', baseMeasurement: 10.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-crotch', unit: 'in', validationRange: { min: 8.0, max: 16.0, step: 0.25 } },
    ],
  },
  {
    garmentName: "Women's Sari Blouse",
    gender: 'Women',
    category: 'Ethnic',
    pomSchema: [
      { id: 'w-sb-01', code: 'W-SB-01', name: 'Upper Bust Circumference', category: 'girth', baseMeasurement: 34.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-womens-upperbust', unit: 'in', validationRange: { min: 26.0, max: 52.0, step: 0.25 } },
      { id: 'w-sb-02', code: 'W-SB-02', name: 'Full Bust Peak', category: 'girth', baseMeasurement: 36.0, defaultEase: 1.25, tolerance: 0.125, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: 'w-sb-03', code: 'W-SB-03', name: 'Underbust / Band', category: 'girth', baseMeasurement: 30.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: 'hs-womens-underbust', unit: 'in', validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
      { id: 'w-sb-04', code: 'W-SB-04', name: 'Apex Distance (Nipple to Nipple)', category: 'width', baseMeasurement: 7.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-apex-dist', unit: 'in', validationRange: { min: 5.5, max: 11.0, step: 0.25 } },
      { id: 'w-sb-05', code: 'W-SB-05', name: 'Apex Height (Shoulder to Apex)', category: 'length', baseMeasurement: 10.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-apex-height', unit: 'in', validationRange: { min: 7.5, max: 14.0, step: 0.25 } },
      { id: 'w-sb-06', code: 'W-SB-06', name: 'Front Neck Drop', category: 'length', baseMeasurement: 7.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-front-neck', unit: 'in', validationRange: { min: 4.0, max: 11.0, step: 0.25 } },
      { id: 'w-sb-07', code: 'W-SB-07', name: 'Back Neck Drop', category: 'length', baseMeasurement: 9.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-back-neck', unit: 'in', validationRange: { min: 4.0, max: 15.0, step: 0.25 } },
      { id: 'w-sb-08', code: 'W-SB-08', name: 'Armhole / Armscye Depth', category: 'width', baseMeasurement: 15.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: 'hs-womens-armscye', unit: 'in', validationRange: { min: 11.0, max: 22.0, step: 0.25 } },
      { id: 'w-sb-09', code: 'W-SB-09', name: 'Blouse Total Length', category: 'length', baseMeasurement: 14.5, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-womens-blouse-len', unit: 'in', validationRange: { min: 11.0, max: 19.0, step: 0.25 } },
    ],
  },
  {
    garmentName: "Women's Lehenga Choli",
    gender: 'Women',
    category: 'Ethnic',
    pomSchema: [
      { id: 'w-lc-01', code: 'W-LC-01', name: 'Lehenga Waistline (Navel)', category: 'girth', baseMeasurement: 28.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-womens-waist', unit: 'in', validationRange: { min: 22.0, max: 48.0, step: 0.25 } },
      { id: 'w-lc-02', code: 'W-LC-02', name: 'High Hip / Seat Circumference', category: 'girth', baseMeasurement: 38.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: 'hs-womens-hip', unit: 'in', validationRange: { min: 30.0, max: 58.0, step: 0.25 } },
      { id: 'w-lc-03', code: 'W-LC-03', name: 'Lehenga Length (Waist to Floor)', category: 'length', baseMeasurement: 42.0, defaultEase: 0.5, tolerance: 0.375, landmarkId: 'hs-womens-lehenga-len', unit: 'in', validationRange: { min: 34.0, max: 50.0, step: 0.25 } },
      { id: 'w-lc-04', code: 'W-LC-04', name: 'Choli Bust Circumference', category: 'girth', baseMeasurement: 36.0, defaultEase: 1.5, tolerance: 0.125, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: 'w-lc-05', code: 'W-LC-05', name: 'Choli Underbust Band', category: 'girth', baseMeasurement: 30.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-womens-underbust', unit: 'in', validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
      { id: 'w-lc-06', code: 'W-LC-06', name: 'Choli Back Length', category: 'length', baseMeasurement: 15.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-womens-choli-len', unit: 'in', validationRange: { min: 12.0, max: 20.0, step: 0.25 } },
    ],
  },
  {
    garmentName: "Women's Anarkali Suit",
    gender: 'Women',
    category: 'Ethnic',
    pomSchema: [
      { id: 'w-an-01', code: 'W-AN-01', name: 'Full Bust Circumference', category: 'girth', baseMeasurement: 36.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: 'w-an-02', code: 'W-AN-02', name: 'Empire Waist Band', category: 'girth', baseMeasurement: 30.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: 'hs-womens-underbust', unit: 'in', validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
      { id: 'w-an-03', code: 'W-AN-03', name: 'Yoke / Empire Height', category: 'length', baseMeasurement: 14.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-yoke-len', unit: 'in', validationRange: { min: 11.0, max: 19.0, step: 0.25 } },
      { id: 'w-an-04', code: 'W-AN-04', name: 'Anarkali Total Length', category: 'length', baseMeasurement: 54.0, defaultEase: 0.5, tolerance: 0.5, landmarkId: 'hs-womens-gown-len', unit: 'in', validationRange: { min: 42.0, max: 64.0, step: 0.5 } },
      { id: 'w-an-05', code: 'W-AN-05', name: 'Flare Hem Circumference', category: 'girth', baseMeasurement: 120.0, defaultEase: 12.0, tolerance: 1.0, landmarkId: 'hs-womens-flare', unit: 'in', validationRange: { min: 80.0, max: 240.0, step: 1.0 } },
      { id: 'w-an-06', code: 'W-AN-06', name: 'Sleeve Length', category: 'sleeve', baseMeasurement: 22.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-womens-sleeve', unit: 'in', validationRange: { min: 14.0, max: 26.0, step: 0.25 } },
    ],
  },
  {
    garmentName: "Women's Structured Corset",
    gender: 'Women',
    category: 'Couture',
    pomSchema: [
      { id: 'w-co-01', code: 'W-CO-01', name: 'Overbust Circumference', category: 'girth', baseMeasurement: 34.0, defaultEase: -1.0, tolerance: 0.125, landmarkId: 'hs-womens-upperbust', unit: 'in', validationRange: { min: 26.0, max: 52.0, step: 0.25 } },
      { id: 'w-co-02', code: 'W-CO-02', name: 'Full Bust Peak', category: 'girth', baseMeasurement: 36.0, defaultEase: -1.5, tolerance: 0.125, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: 'w-co-03', code: 'W-CO-03', name: 'Underbust Line', category: 'girth', baseMeasurement: 30.0, defaultEase: -1.5, tolerance: 0.125, landmarkId: 'hs-womens-underbust', unit: 'in', validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
      { id: 'w-co-04', code: 'W-CO-04', name: 'Waist Cinch Target', category: 'girth', baseMeasurement: 28.0, defaultEase: -3.0, tolerance: 0.125, landmarkId: 'hs-womens-waist', unit: 'in', validationRange: { min: 20.0, max: 44.0, step: 0.25 } },
      { id: 'w-co-05', code: 'W-CO-05', name: 'High Hip Curve', category: 'girth', baseMeasurement: 35.0, defaultEase: -0.5, tolerance: 0.125, landmarkId: 'hs-womens-highhip', unit: 'in', validationRange: { min: 28.0, max: 52.0, step: 0.25 } },
      { id: 'w-co-06', code: 'W-CO-06', name: 'Busk Front Length', category: 'length', baseMeasurement: 13.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-busk-len', unit: 'in', validationRange: { min: 10.0, max: 18.0, step: 0.25 } },
    ],
  },
  {
    garmentName: "Women's Evening Gown",
    gender: 'Women',
    category: 'Couture',
    pomSchema: [
      { id: 'w-go-01', code: 'W-GO-01', name: 'Full Bust Circumference', category: 'girth', baseMeasurement: 36.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: 'w-go-02', code: 'W-GO-02', name: 'Natural Waist Circumference', category: 'girth', baseMeasurement: 28.0, defaultEase: 1.5, tolerance: 0.25, landmarkId: 'hs-womens-waist', unit: 'in', validationRange: { min: 22.0, max: 48.0, step: 0.25 } },
      { id: 'w-go-03', code: 'W-GO-03', name: 'High Hip / Seat', category: 'girth', baseMeasurement: 38.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: 'hs-womens-hip', unit: 'in', validationRange: { min: 30.0, max: 58.0, step: 0.25 } },
      { id: 'w-go-04', code: 'W-GO-04', name: 'Hollow to Hem Length', category: 'length', baseMeasurement: 58.0, defaultEase: 0.5, tolerance: 0.5, landmarkId: 'hs-womens-hollow-hem', unit: 'in', validationRange: { min: 46.0, max: 66.0, step: 0.5 } },
      { id: 'w-go-05', code: 'W-GO-05', name: 'Train Sweep Extra Length', category: 'length', baseMeasurement: 18.0, defaultEase: 0.0, tolerance: 0.5, landmarkId: 'hs-womens-train', unit: 'in', validationRange: { min: 0.0, max: 60.0, step: 0.5 } },
      { id: 'w-go-06', code: 'W-GO-06', name: 'Shoulder to Waist Length', category: 'length', baseMeasurement: 16.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-womens-sh-waist', unit: 'in', validationRange: { min: 13.0, max: 20.0, step: 0.25 } },
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seeding for YellowHouse Tailoring OS...');

  // Delete existing global templates to ensure script idempotency
  await prisma.measurementTemplate.deleteMany({
    where: { tenantId: null },
  });

  // Seed default measurement templates
  for (const template of defaultTemplates) {
    const created = await prisma.measurementTemplate.create({
      data: {
        tenantId: null,
        garmentName: template.garmentName,
        gender: template.gender,
        category: template.category,
        pomSchema: template.pomSchema as any,
      },
    });
    console.log(`  ✓ Seeded Global Template: [${created.gender}] ${created.garmentName}`);
  }

  console.log(`✨ Database seeding completed successfully! (${defaultTemplates.length} templates created)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
