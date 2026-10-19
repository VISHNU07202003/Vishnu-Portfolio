import characterPng from './assets/manu-approved.png';
export type ApprovedManuAsset = { src: string; width: number; height: number; approved: true };
// User approved the refined Adobe cutout on 2026-10-17, including retained VFX.
export const approvedManuAsset: ApprovedManuAsset = { src: characterPng, width: 382, height: 512, approved: true };
