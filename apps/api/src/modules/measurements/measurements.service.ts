import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateEaseDto } from './dto/calculate-ease.dto';
import { CalculateYieldDto } from './dto/calculate-yield.dto';

export interface PomSchemaItemApi {
  id: string;
  code: string;
  name: string;
  category: 'length' | 'girth' | 'width' | 'sleeve' | 'trouser';
  baseMeasurement: number;
  defaultEase: number;
  tolerance: number;
  landmarkId: string;
  unit: 'in' | 'cm';
  validationRange: { min: number; max: number; step?: number };
  description?: string;
}

export interface GarmentTemplateApi {
  id: string;
  name: string;
  gender: 'Men' | 'Women';
  category: 'Western' | 'Ethnic' | 'Couture';
  poms: PomSchemaItemApi[];
}

@Injectable()
export class MeasurementsService {
  constructor(private prisma: PrismaService) {}

  private readonly templates: GarmentTemplateApi[] = [
    {
      id: 'mens-suit',
      name: "Men's Bespoke 3-Piece Suit",
      gender: 'Men',
      category: 'Western',
      poms: [
        { id: 'm-su-01', code: 'M-SU-01', name: 'Jacket Chest Circumference', category: 'girth', baseMeasurement: 40.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: 'hs-mens-chest', unit: 'in', validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
        { id: 'm-su-02', code: 'M-SU-02', name: 'Buttoning Waist Point', category: 'girth', baseMeasurement: 34.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: 'hs-mens-waist', unit: 'in', validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
        { id: 'm-su-03', code: 'M-SU-03', name: 'Hip / Seat Circumference', category: 'girth', baseMeasurement: 41.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: 'hs-mens-hip', unit: 'in', validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
        { id: 'm-su-04', code: 'M-SU-04', name: 'Shoulder Width (Acromion to Acromion)', category: 'width', baseMeasurement: 18.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-mens-shoulder', unit: 'in', validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
        { id: 'm-su-05', code: 'M-SU-05', name: 'Center Back Jacket Length', category: 'length', baseMeasurement: 30.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-mens-jacket-len', unit: 'in', validationRange: { min: 24.0, max: 38.0, step: 0.25 } },
        { id: 'm-su-06', code: 'M-SU-06', name: 'Sleeve Length (Crown to Wrist)', category: 'sleeve', baseMeasurement: 25.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-sleeve', unit: 'in', validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
        { id: 'm-su-07', code: 'M-SU-07', name: 'Armscye / Armhole Depth', category: 'width', baseMeasurement: 10.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: 'hs-mens-armscye', unit: 'in', validationRange: { min: 7.0, max: 14.0, step: 0.25 } },
        { id: 'm-su-08', code: 'M-SU-08', name: 'Bicep Circumference', category: 'girth', baseMeasurement: 14.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: 'hs-mens-bicep', unit: 'in', validationRange: { min: 10.0, max: 22.0, step: 0.25 } }
      ]
    },
    {
      id: 'mens-sherwani',
      name: "Men's Royal Sherwani",
      gender: 'Men',
      category: 'Ethnic',
      poms: [
        { id: 'm-sh-01', code: 'M-SH-01', name: 'Chest Circumference', category: 'girth', baseMeasurement: 40.0, defaultEase: 5.0, tolerance: 0.25, landmarkId: 'hs-mens-chest', unit: 'in', validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
        { id: 'm-sh-02', code: 'M-SH-02', name: 'Natural Waist', category: 'girth', baseMeasurement: 34.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: 'hs-mens-waist', unit: 'in', validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
        { id: 'm-sh-03', code: 'M-SH-03', name: 'Hip / Seat Circumference', category: 'girth', baseMeasurement: 41.0, defaultEase: 4.5, tolerance: 0.25, landmarkId: 'hs-mens-hip', unit: 'in', validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
        { id: 'm-sh-04', code: 'M-SH-04', name: 'Shoulder Width (Acromion to Acromion)', category: 'width', baseMeasurement: 18.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-mens-shoulder', unit: 'in', validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
        { id: 'm-sh-05', code: 'M-SH-05', name: 'Band Collar Height & Circumference', category: 'girth', baseMeasurement: 15.5, defaultEase: 0.85, tolerance: 0.125, landmarkId: 'hs-mens-neck', unit: 'in', validationRange: { min: 12.0, max: 22.0, step: 0.25 } },
        { id: 'm-sh-06', code: 'M-SH-06', name: 'Sherwani Full Length (C7 to Knee/Calf)', category: 'length', baseMeasurement: 42.0, defaultEase: 0.0, tolerance: 0.5, landmarkId: 'hs-mens-sherwani-len', unit: 'in', validationRange: { min: 34.0, max: 52.0, step: 0.5 } },
        { id: 'm-sh-07', code: 'M-SH-07', name: 'Sleeve Length (Crown to Wrist)', category: 'sleeve', baseMeasurement: 25.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-sleeve', unit: 'in', validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
        { id: 'm-sh-08', code: 'M-SH-08', name: 'Across Chest Width', category: 'width', baseMeasurement: 16.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-across-chest', unit: 'in', validationRange: { min: 13.0, max: 22.0, step: 0.25 } }
      ]
    },
    {
      id: 'mens-shirt',
      name: "Men's Custom Dress Shirt",
      gender: 'Men',
      category: 'Western',
      poms: [
        { id: 'm-st-01', code: 'M-ST-01', name: 'Collar / Neck Band', category: 'girth', baseMeasurement: 15.5, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-mens-neck', unit: 'in', validationRange: { min: 12.0, max: 22.0, step: 0.25 } },
        { id: 'm-st-02', code: 'M-ST-02', name: 'Chest Circumference', category: 'girth', baseMeasurement: 40.0, defaultEase: 4.0, tolerance: 0.25, landmarkId: 'hs-mens-chest', unit: 'in', validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
        { id: 'm-st-03', code: 'M-ST-03', name: 'Waist Circumference', category: 'girth', baseMeasurement: 34.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: 'hs-mens-waist', unit: 'in', validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
        { id: 'm-st-04', code: 'M-ST-04', name: 'Shoulder Yoke Width', category: 'width', baseMeasurement: 18.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: 'hs-mens-shoulder', unit: 'in', validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
        { id: 'm-st-05', code: 'M-ST-05', name: 'Shirt Length (Back)', category: 'length', baseMeasurement: 30.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-mens-shirt-len', unit: 'in', validationRange: { min: 24.0, max: 38.0, step: 0.25 } },
        { id: 'm-st-06', code: 'M-ST-06', name: 'Sleeve Length', category: 'sleeve', baseMeasurement: 25.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-sleeve', unit: 'in', validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
        { id: 'm-st-07', code: 'M-ST-07', name: 'Cuff Circumference', category: 'girth', baseMeasurement: 8.5, defaultEase: 1.5, tolerance: 0.25, landmarkId: 'hs-mens-cuff', unit: 'in', validationRange: { min: 6.0, max: 13.0, step: 0.25 } }
      ]
    },
    {
      id: 'mens-trouser',
      name: "Men's Tailored Trouser",
      gender: 'Men',
      category: 'Western',
      poms: [
        { id: 'm-tr-01', code: 'M-TR-01', name: 'Waistband Circumference', category: 'trouser', baseMeasurement: 34.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: 'hs-mens-trouser-waist', unit: 'in', validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
        { id: 'm-tr-02', code: 'M-TR-02', name: 'Seat / Hip Circumference', category: 'trouser', baseMeasurement: 41.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: 'hs-mens-hip', unit: 'in', validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
        { id: 'm-tr-03', code: 'M-TR-03', name: 'Outseam Length', category: 'trouser', baseMeasurement: 41.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-mens-outseam', unit: 'in', validationRange: { min: 32.0, max: 52.0, step: 0.25 } },
        { id: 'm-tr-04', code: 'M-TR-04', name: 'Inseam Length', category: 'trouser', baseMeasurement: 31.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-mens-inseam', unit: 'in', validationRange: { min: 24.0, max: 40.0, step: 0.25 } },
        { id: 'm-tr-05', code: 'M-TR-05', name: 'Thigh Circumference', category: 'trouser', baseMeasurement: 24.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: 'hs-mens-thigh', unit: 'in', validationRange: { min: 18.0, max: 34.0, step: 0.25 } },
        { id: 'm-tr-06', code: 'M-TR-06', name: 'Knee Circumference', category: 'trouser', baseMeasurement: 18.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: 'hs-mens-knee', unit: 'in', validationRange: { min: 13.0, max: 26.0, step: 0.25 } },
        { id: 'm-tr-07', code: 'M-TR-07', name: 'Leg Opening / Hem', category: 'trouser', baseMeasurement: 15.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: 'hs-mens-ankle', unit: 'in', validationRange: { min: 10.0, max: 22.0, step: 0.25 } },
        { id: 'm-tr-08', code: 'M-TR-08', name: 'Crotch Rise Depth', category: 'trouser', baseMeasurement: 10.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-mens-crotch', unit: 'in', validationRange: { min: 8.0, max: 16.0, step: 0.25 } }
      ]
    },
    {
      id: 'womens-blouse',
      name: "Women's Sari Blouse",
      gender: 'Women',
      category: 'Ethnic',
      poms: [
        { id: 'w-sb-01', code: 'W-SB-01', name: 'Upper Bust Circumference', category: 'girth', baseMeasurement: 34.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-womens-upperbust', unit: 'in', validationRange: { min: 26.0, max: 52.0, step: 0.25 } },
        { id: 'w-sb-02', code: 'W-SB-02', name: 'Full Bust Peak', category: 'girth', baseMeasurement: 36.0, defaultEase: 1.25, tolerance: 0.125, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
        { id: 'w-sb-03', code: 'W-SB-03', name: 'Underbust / Band', category: 'girth', baseMeasurement: 30.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: 'hs-womens-underbust', unit: 'in', validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
        { id: 'w-sb-04', code: 'W-SB-04', name: 'Apex Distance (Nipple to Nipple)', category: 'width', baseMeasurement: 7.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-apex-dist', unit: 'in', validationRange: { min: 5.5, max: 11.0, step: 0.25 } },
        { id: 'w-sb-05', code: 'W-SB-05', name: 'Apex Height (Shoulder to Apex)', category: 'length', baseMeasurement: 10.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-apex-height', unit: 'in', validationRange: { min: 7.5, max: 14.0, step: 0.25 } },
        { id: 'w-sb-06', code: 'W-SB-06', name: 'Front Neck Drop', category: 'length', baseMeasurement: 7.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-front-neck', unit: 'in', validationRange: { min: 4.0, max: 11.0, step: 0.25 } },
        { id: 'w-sb-07', code: 'W-SB-07', name: 'Back Neck Drop', category: 'length', baseMeasurement: 9.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-back-neck', unit: 'in', validationRange: { min: 4.0, max: 15.0, step: 0.25 } },
        { id: 'w-sb-08', code: 'W-SB-08', name: 'Armhole / Armscye Depth', category: 'width', baseMeasurement: 15.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: 'hs-womens-armscye', unit: 'in', validationRange: { min: 11.0, max: 22.0, step: 0.25 } },
        { id: 'w-sb-09', code: 'W-SB-09', name: 'Blouse Total Length', category: 'length', baseMeasurement: 14.5, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-womens-blouse-len', unit: 'in', validationRange: { min: 11.0, max: 19.0, step: 0.25 } }
      ]
    },
    {
      id: 'womens-lehenga',
      name: "Women's Lehenga Choli",
      gender: 'Women',
      category: 'Ethnic',
      poms: [
        { id: 'w-lc-01', code: 'W-LC-01', name: 'Lehenga Waistline (Navel)', category: 'girth', baseMeasurement: 28.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-womens-waist', unit: 'in', validationRange: { min: 22.0, max: 48.0, step: 0.25 } },
        { id: 'w-lc-02', code: 'W-LC-02', name: 'High Hip / Seat Circumference', category: 'girth', baseMeasurement: 38.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: 'hs-womens-hip', unit: 'in', validationRange: { min: 30.0, max: 58.0, step: 0.25 } },
        { id: 'w-lc-03', code: 'W-LC-03', name: 'Lehenga Length (Waist to Floor)', category: 'length', baseMeasurement: 42.0, defaultEase: 0.5, tolerance: 0.375, landmarkId: 'hs-womens-lehenga-len', unit: 'in', validationRange: { min: 34.0, max: 50.0, step: 0.25 } },
        { id: 'w-lc-04', code: 'W-LC-04', name: 'Choli Bust Circumference', category: 'girth', baseMeasurement: 36.0, defaultEase: 1.5, tolerance: 0.125, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
        { id: 'w-lc-05', code: 'W-LC-05', name: 'Choli Underbust Band', category: 'girth', baseMeasurement: 30.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: 'hs-womens-underbust', unit: 'in', validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
        { id: 'w-lc-06', code: 'W-LC-06', name: 'Choli Back Length', category: 'length', baseMeasurement: 15.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-womens-choli-len', unit: 'in', validationRange: { min: 12.0, max: 20.0, step: 0.25 } }
      ]
    },
    {
      id: 'womens-anarkali',
      name: "Women's Anarkali Suit",
      gender: 'Women',
      category: 'Ethnic',
      poms: [
        { id: 'w-an-01', code: 'W-AN-01', name: 'Full Bust Circumference', category: 'girth', baseMeasurement: 36.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
        { id: 'w-an-02', code: 'W-AN-02', name: 'Empire Waist Band', category: 'girth', baseMeasurement: 30.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: 'hs-womens-underbust', unit: 'in', validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
        { id: 'w-an-03', code: 'W-AN-03', name: 'Yoke / Empire Height', category: 'length', baseMeasurement: 14.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-yoke-len', unit: 'in', validationRange: { min: 11.0, max: 19.0, step: 0.25 } },
        { id: 'w-an-04', code: 'W-AN-04', name: 'Anarkali Total Length', category: 'length', baseMeasurement: 54.0, defaultEase: 0.5, tolerance: 0.5, landmarkId: 'hs-womens-gown-len', unit: 'in', validationRange: { min: 42.0, max: 64.0, step: 0.5 } },
        { id: 'w-an-05', code: 'W-AN-05', name: 'Flare Hem Circumference', category: 'girth', baseMeasurement: 120.0, defaultEase: 12.0, tolerance: 1.0, landmarkId: 'hs-womens-flare', unit: 'in', validationRange: { min: 80.0, max: 240.0, step: 1.0 } },
        { id: 'w-an-06', code: 'W-AN-06', name: 'Sleeve Length', category: 'sleeve', baseMeasurement: 22.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: 'hs-womens-sleeve', unit: 'in', validationRange: { min: 14.0, max: 26.0, step: 0.25 } }
      ]
    },
    {
      id: 'womens-corset',
      name: "Women's Structured Corset",
      gender: 'Women',
      category: 'Couture',
      poms: [
        { id: 'w-co-01', code: 'W-CO-01', name: 'Overbust Circumference', category: 'girth', baseMeasurement: 34.0, defaultEase: -1.0, tolerance: 0.125, landmarkId: 'hs-womens-upperbust', unit: 'in', validationRange: { min: 26.0, max: 52.0, step: 0.25 } },
        { id: 'w-co-02', code: 'W-CO-02', name: 'Full Bust Peak', category: 'girth', baseMeasurement: 36.0, defaultEase: -1.5, tolerance: 0.125, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
        { id: 'w-co-03', code: 'W-CO-03', name: 'Underbust Line', category: 'girth', baseMeasurement: 30.0, defaultEase: -1.5, tolerance: 0.125, landmarkId: 'hs-womens-underbust', unit: 'in', validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
        { id: 'w-co-04', code: 'W-CO-04', name: 'Waist Cinch Target', category: 'girth', baseMeasurement: 28.0, defaultEase: -3.0, tolerance: 0.125, landmarkId: 'hs-womens-waist', unit: 'in', validationRange: { min: 20.0, max: 44.0, step: 0.25 } },
        { id: 'w-co-05', code: 'W-CO-05', name: 'High Hip Curve', category: 'girth', baseMeasurement: 35.0, defaultEase: -0.5, tolerance: 0.125, landmarkId: 'hs-womens-highhip', unit: 'in', validationRange: { min: 28.0, max: 52.0, step: 0.25 } },
        { id: 'w-co-06', code: 'W-CO-06', name: 'Busk Front Length', category: 'length', baseMeasurement: 13.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: 'hs-womens-busk-len', unit: 'in', validationRange: { min: 10.0, max: 18.0, step: 0.25 } }
      ]
    },
    {
      id: 'womens-gown',
      name: "Women's Evening Gown",
      gender: 'Women',
      category: 'Couture',
      poms: [
        { id: 'w-go-01', code: 'W-GO-01', name: 'Full Bust Circumference', category: 'girth', baseMeasurement: 36.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: 'hs-womens-fullbust', unit: 'in', validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
        { id: 'w-go-02', code: 'W-GO-02', name: 'Natural Waist Circumference', category: 'girth', baseMeasurement: 28.0, defaultEase: 1.5, tolerance: 0.25, landmarkId: 'hs-womens-waist', unit: 'in', validationRange: { min: 22.0, max: 48.0, step: 0.25 } },
        { id: 'w-go-03', code: 'W-GO-03', name: 'High Hip / Seat', category: 'girth', baseMeasurement: 38.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: 'hs-womens-hip', unit: 'in', validationRange: { min: 30.0, max: 58.0, step: 0.25 } },
        { id: 'w-go-04', code: 'W-GO-04', name: 'Hollow to Hem Length', category: 'length', baseMeasurement: 58.0, defaultEase: 0.5, tolerance: 0.5, landmarkId: 'hs-womens-hollow-hem', unit: 'in', validationRange: { min: 46.0, max: 66.0, step: 0.5 } },
        { id: 'w-go-05', code: 'W-GO-05', name: 'Train Sweep Extra Length', category: 'length', baseMeasurement: 18.0, defaultEase: 0.0, tolerance: 0.5, landmarkId: 'hs-womens-train', unit: 'in', validationRange: { min: 0.0, max: 60.0, step: 0.5 } },
        { id: 'w-go-06', code: 'W-GO-06', name: 'Shoulder to Waist Length', category: 'length', baseMeasurement: 16.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: 'hs-womens-sh-waist', unit: 'in', validationRange: { min: 13.0, max: 20.0, step: 0.25 } }
      ]
    }
  ];

  // 1. Get standard Points of Measure (POM) schemas for Men's and Women's garments
  getGarmentTemplates(gender?: string, category?: string): GarmentTemplateApi[] {
    let result = this.templates;
    if (gender) {
      result = result.filter((t) => t.gender.toLowerCase() === gender.toLowerCase());
    }
    if (category) {
      result = result.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }
    return result;
  }

  // 2. Compute dynamic ease allowance & posture modifiers
  calculateEase(dto: CalculateEaseDto) {
    const template = this.templates.find((t) => t.id === dto.garmentCategory);
    if (!template) {
      throw new NotFoundException(`Garment template '${dto.garmentCategory}' not found.`);
    }

    const calculatedGarmentPOMs: Record<string, any> = {};

    for (const pom of template.poms) {
      const netBody = dto.measurements[pom.code] || dto.measurements[pom.id] || pom.baseMeasurement;
      const baseEase = pom.defaultEase;

      // Fit modifier
      let fitMod = 0;
      if (dto.fitPreference === 'skinny') {
        fitMod = pom.category === 'girth' || pom.category === 'trouser' ? -1.50 : pom.category === 'width' ? -0.50 : pom.category === 'sleeve' ? -0.375 : 0;
      } else if (dto.fitPreference === 'slim') {
        fitMod = pom.category === 'girth' || pom.category === 'trouser' ? -0.75 : pom.category === 'width' ? -0.25 : pom.category === 'sleeve' ? -0.25 : 0;
      } else if (dto.fitPreference === 'relaxed') {
        fitMod = pom.category === 'girth' || pom.category === 'trouser' ? 1.25 : pom.category === 'width' ? 0.50 : pom.category === 'sleeve' ? 0.375 : 0;
      }

      // Posture offset
      let postureOffset = 0;
      const code = pom.code.toUpperCase();
      const name = pom.name.toLowerCase();

      const isArmhole = code.includes('SU-07') || code.includes('SB-08') || name.includes('armscye') || name.includes('armhole');
      const isShoulder = code.includes('SU-04') || code.includes('SH-04') || code.includes('ST-04') || name.includes('shoulder') || name.includes('yoke');
      const isBackLength = code.includes('SU-05') || code.includes('SH-06') || code.includes('ST-05') || code.includes('SB-09') || code.includes('LC-06') || code.includes('AN-04') || code.includes('GO-04') || (pom.category === 'length' && (name.includes('back') || name.includes('total') || name.includes('hollow')));
      const isAcrossChestFront = code.includes('SH-08') || name.includes('across chest') || name.includes('front neck');
      const isChestBustGirth = code.includes('SU-01') || code.includes('SH-01') || code.includes('ST-02') || code.includes('SB-01') || code.includes('SB-02') || code.includes('LC-04') || code.includes('AN-01') || code.includes('CO-01') || code.includes('CO-02') || code.includes('GO-01') || (pom.category === 'girth' && (name.includes('chest') || name.includes('bust')));
      const isWaistGirth = code.includes('SU-02') || code.includes('SH-02') || code.includes('ST-03') || code.includes('TR-01') || code.includes('LC-01') || code.includes('AN-02') || code.includes('CO-04') || code.includes('GO-02') || (pom.category === 'girth' && name.includes('waist'));
      const isCrotchRise = code.includes('TR-08') || name.includes('crotch');
      const isHipGirth = code.includes('SU-03') || code.includes('SH-03') || code.includes('TR-02') || code.includes('LC-02') || code.includes('CO-05') || code.includes('GO-03') || (pom.category === 'girth' && (name.includes('hip') || name.includes('seat')));
      const isTrouserLength = code.includes('TR-03') || code.includes('TR-04') || name.includes('outseam') || name.includes('inseam');

      if (dto.postureProfile) {
        switch (dto.postureProfile.shoulderSlope) {
          case 'sloped':
            if (isArmhole) postureOffset += 0.375;
            if (isShoulder) postureOffset -= 0.25;
            break;
          case 'very_sloped':
            if (isArmhole) postureOffset += 0.625;
            if (isShoulder) postureOffset -= 0.375;
            break;
          case 'square':
            if (isArmhole) postureOffset -= 0.25;
            if (isShoulder) postureOffset += 0.25;
            break;
          case 'normal':
          default:
            break;
        }

        switch (dto.postureProfile.backCurvature) {
          case 'stooped':
            if (isBackLength) postureOffset += 0.50;
            if (isAcrossChestFront) postureOffset -= 0.25;
            if (isChestBustGirth) postureOffset += 0.375;
            break;
          case 'erect':
            if (isBackLength) postureOffset -= 0.375;
            if (isAcrossChestFront) postureOffset += 0.25;
            if (isChestBustGirth) postureOffset += 0.25;
            break;
          case 'prominent_blade':
            if (isAcrossChestFront || isShoulder) postureOffset += 0.50;
            if (isArmhole) postureOffset += 0.25;
            break;
          case 'normal':
          default:
            break;
        }

        switch (dto.postureProfile.abdomenStance) {
          case 'prominent':
            if (isWaistGirth) postureOffset += 1.00;
            if (isCrotchRise) postureOffset += 0.50;
            break;
          case 'flat':
            if (isWaistGirth) postureOffset -= 0.50;
            if (isCrotchRise) postureOffset -= 0.25;
            break;
          case 'normal':
          default:
            break;
        }

        switch (dto.postureProfile.hipSpineStance) {
          case 'high_hip':
            if (isHipGirth) postureOffset += 0.50;
            if (isTrouserLength) postureOffset += 0.25;
            break;
          case 'sway_back':
            if (isBackLength) postureOffset -= 0.625;
            if (isCrotchRise) postureOffset -= 0.375;
            break;
          case 'normal':
          default:
            break;
        }
      }

      // Stretch reduction
      let stretchFactor = 0;
      if (pom.category === 'girth' && dto.fabricStretchPercent && dto.fabricStretchPercent > 0) {
        stretchFactor = Number((netBody * (dto.fabricStretchPercent / 100) * 0.5).toFixed(2));
      }

      const targetGarmentMeasurement = Number(
        (netBody + baseEase + fitMod + postureOffset - stretchFactor).toFixed(2)
      );

      calculatedGarmentPOMs[pom.code] = {
        pomId: pom.id,
        netBody,
        categoryBaseEase: baseEase,
        fitPreferenceModifier: fitMod,
        postureOffset,
        stretchFactor,
        targetGarmentMeasurement
      };
    }

    return {
      garmentCategory: dto.garmentCategory,
      fitPreference: dto.fitPreference,
      postureProfile: dto.postureProfile,
      calculatedGarmentPOMs
    };
  }

  // 3. Size-scaled Fabric Yield Engine
  calculateFabricYield(dto: CalculateYieldDto) {
    const baseYieldMap: Record<string, number> = {
      'mens-suit': 5.00,
      'mens-sherwani': 4.50,
      'mens-shirt': 2.20,
      'mens-trouser': 1.40,
      'womens-blouse': 1.00,
      'womens-lehenga': 5.80,
      'womens-anarkali': 6.50,
      'womens-corset': 1.20,
      'womens-gown': 5.50
    };

    const refGirthMap: Record<string, number> = {
      'mens-suit': 40.0,
      'mens-sherwani': 40.0,
      'mens-shirt': 40.0,
      'mens-trouser': 40.0,
      'womens-blouse': 36.0,
      'womens-lehenga': 36.0,
      'womens-anarkali': 36.0,
      'womens-corset': 36.0,
      'womens-gown': 36.0
    };

    const refLengthMap: Record<string, number> = {
      'mens-suit': 30.0,
      'mens-sherwani': 42.0,
      'mens-shirt': 30.0,
      'mens-trouser': 41.0,
      'womens-blouse': 14.5,
      'womens-lehenga': 42.0,
      'womens-anarkali': 56.0,
      'womens-corset': 13.0,
      'womens-gown': 56.0
    };

    const styleKey = dto.garmentCategory.toLowerCase();
    const baseMeters = baseYieldMap[styleKey] || 3.00;
    const refGirth = refGirthMap[styleKey] || 40.0;
    const refLength = refLengthMap[styleKey] || 30.0;

    // Width factor relative to 44" with defensive guard for <= 0
    const effectiveWidth = dto.fabricWidthInches && dto.fabricWidthInches > 0 ? dto.fabricWidthInches : 44.0;
    const widthFactor = 44.0 / effectiveWidth;

    // Composite Size Scale Ratio (K_scale)
    const girthVal = dto.girthMeasurement ?? dto.chestOrHipSizeInches;
    const lengthVal = dto.lengthMeasurement;

    let kScale = 1.0;
    if (girthVal || lengthVal) {
      const kGirth = girthVal ? girthVal / refGirth : 1.0;
      const kLength = lengthVal ? lengthVal / refLength : 1.0;
      kScale = 0.6 * kLength + 0.4 * kGirth;
    }

    // Panel multiplier for ethnic flared garments
    let panelMultiplier = 1.0;
    if (dto.panelCount && (styleKey === 'womens-lehenga' || styleKey === 'womens-anarkali' || styleKey.includes('lehenga') || styleKey.includes('anarkali'))) {
      if (dto.panelCount >= 24) {
        panelMultiplier = 1.45;
      } else if (dto.panelCount >= 16) {
        panelMultiplier = 1.20;
      } else if (dto.panelCount > 12) {
        panelMultiplier = 1.0 + (dto.panelCount - 12) * 0.0375;
      }
    }

    const scaledMeters = baseMeters * kScale * widthFactor * panelMultiplier;

    // Pattern repeat allowance
    let patternAllowanceMeters = 0;
    if (dto.patternRepeatInches && dto.patternRepeatInches > 0) {
      const repeatFactor = Math.min(0.25, (dto.patternRepeatInches * 0.0254) / baseMeters);
      patternAllowanceMeters = scaledMeters * repeatFactor;
    }

    // Shrinkage allowance
    const shrinkagePercent = dto.shrinkagePercent ?? (dto.hasShrinkage ? 5 : 0);
    const shrinkageAllowanceMeters = (scaledMeters + patternAllowanceMeters) * (shrinkagePercent / 100);

    const estimatedMeters = Number(
      (scaledMeters + patternAllowanceMeters + shrinkageAllowanceMeters).toFixed(2)
    );
    const estimatedYards = Number((estimatedMeters * 1.09361).toFixed(2));

    return {
      garmentCategory: dto.garmentCategory,
      fabricWidthInches: dto.fabricWidthInches,
      baseYieldMeters: baseMeters,
      scaledMeters: Number(scaledMeters.toFixed(2)),
      patternAllowanceMeters: Number(patternAllowanceMeters.toFixed(2)),
      shrinkageAllowanceMeters: Number(shrinkageAllowanceMeters.toFixed(2)),
      estimatedMeters,
      estimatedYards,
      markerEfficiencyPercent: 88.5
    };
  }
}
