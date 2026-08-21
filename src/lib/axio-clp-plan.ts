export interface AxioCLPStage {
  srNo: number;
  stage: string;
  percentage: number;
  code: string;
  category: "BOOKING" | "FOUNDATION" | "LOWER_SLAB" | "UPPER_SLAB" | "FINISHING";
}

export const URBANGAON_AXIO_CLP_STAGES: AxioCLPStage[] = [
  { srNo: 1, stage: "At the time of Booking", percentage: 10, code: "MS_BOOKING", category: "BOOKING" },
  { srNo: 2, stage: "45 Days from Booking", percentage: 5, code: "MS_45DAYS", category: "BOOKING" },
  { srNo: 3, stage: "At Commencement of work", percentage: 5, code: "MS_COMMENCE", category: "FOUNDATION" },
  { srNo: 4, stage: "On Completion of Foundation work", percentage: 5, code: "MS_FOUNDATION", category: "FOUNDATION" },
  { srNo: 5, stage: "On Casting of Stilt Floor roof", percentage: 5, code: "MS_STILT", category: "LOWER_SLAB" },
  { srNo: 6, stage: "On Casting of 1st Floor roof", percentage: 5, code: "MS_SLAB_1", category: "LOWER_SLAB" },
  { srNo: 7, stage: "On Casting of 2nd Floor roof", percentage: 5, code: "MS_SLAB_2", category: "LOWER_SLAB" },
  { srNo: 8, stage: "On Casting of 3rd Floor roof", percentage: 5, code: "MS_SLAB_3", category: "LOWER_SLAB" },
  { srNo: 9, stage: "On Casting of 4th Floor roof", percentage: 5, code: "MS_SLAB_4", category: "LOWER_SLAB" },
  { srNo: 10, stage: "On Casting of 5th Floor roof", percentage: 5, code: "MS_SLAB_5", category: "LOWER_SLAB" },
  { srNo: 11, stage: "On Casting of 6th Floor roof", percentage: 5, code: "MS_SLAB_6", category: "LOWER_SLAB" },
  { srNo: 12, stage: "On Casting of 7th Floor roof", percentage: 5, code: "MS_SLAB_7", category: "LOWER_SLAB" },
  { srNo: 13, stage: "On Casting of 8th Floor roof", percentage: 5, code: "MS_SLAB_8", category: "LOWER_SLAB" },
  { srNo: 14, stage: "On Casting of 9th Floor roof", percentage: 5, code: "MS_SLAB_9", category: "LOWER_SLAB" },
  { srNo: 15, stage: "On Casting of 10th Floor roof", percentage: 2.5, code: "MS_SLAB_10", category: "UPPER_SLAB" },
  { srNo: 16, stage: "On Casting of 11th Floor roof", percentage: 2.5, code: "MS_SLAB_11", category: "UPPER_SLAB" },
  { srNo: 17, stage: "On Casting of 12th Floor roof", percentage: 2.5, code: "MS_SLAB_12", category: "UPPER_SLAB" },
  { srNo: 18, stage: "On Casting of 13th Floor roof", percentage: 2.5, code: "MS_SLAB_13", category: "UPPER_SLAB" },
  { srNo: 19, stage: "On Casting of 14th Floor roof", percentage: 2.5, code: "MS_SLAB_14", category: "UPPER_SLAB" },
  { srNo: 20, stage: "On Casting of 15th Floor roof", percentage: 2.5, code: "MS_SLAB_15", category: "UPPER_SLAB" },
  { srNo: 21, stage: "On Casting of 16th Floor roof", percentage: 2.5, code: "MS_SLAB_16", category: "UPPER_SLAB" },
  { srNo: 22, stage: "On Casting of 17th Floor roof", percentage: 2.5, code: "MS_SLAB_17", category: "UPPER_SLAB" },
  { srNo: 23, stage: "On Casting of 18th Floor roof", percentage: 2.5, code: "MS_SLAB_18", category: "UPPER_SLAB" },
  { srNo: 24, stage: "On Casting of 19th Floor roof", percentage: 2.5, code: "MS_SLAB_19", category: "UPPER_SLAB" },
];

export const TOTAL_AXIO_CLP_PERCENTAGE = URBANGAON_AXIO_CLP_STAGES.reduce((acc, s) => acc + s.percentage, 0); // 100%
