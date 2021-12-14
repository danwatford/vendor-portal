import {
  CraftFairApplication,
  ElectricalOption,
  PitchType,
} from "../interfaces/Applications";

export const pitchBaseCost: Readonly<Record<PitchType, number>> = {
  standardNoShelter: 460,
  extraLargeNoShelter: 560,
  standardInMarquee: 480,
  doubleInMarquee: 940,
};

export const pitchAdditionalWidthCost: Readonly<Record<PitchType, number>> = {
  standardNoShelter: 140,
  extraLargeNoShelter: 150,
  standardInMarquee: 0,
  doubleInMarquee: 0,
};

export const pitchEletricalOptionCost: Readonly<
  Record<ElectricalOption, number>
> = {
  none: 0,
  "1 x 13amp socket": 60,
  "1 x 16amp socket": 60,
  "2 x 13amp socket": 70,
  "1 x 32amp supply": 90,
};

export const getTablesCost = (application: CraftFairApplication) => {
  return 12 * application.tables;
};

export const getTotalCraftFairApplicationCost = (
  application: CraftFairApplication
): number => {
  const baseCost = pitchBaseCost[application.pitchType];
  const addionalWidthCost =
    pitchAdditionalWidthCost[application.pitchType] *
    application.pitchAdditionalWidth;
  const electricalCost =
    pitchEletricalOptionCost[application.pitchElectricalOptions];

  const campingCost = application.campingRequired ? 60 : 0;

  const tablesCost = getTablesCost(application);

  return (
    baseCost + addionalWidthCost + electricalCost + campingCost + tablesCost
  );
};
