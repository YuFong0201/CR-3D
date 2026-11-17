export interface FractionResult {
  numerator: number;
  denominator: number;
  improper: string;       // e.g. "7/3"
  mixed: string;          // e.g. "2 又 1/3" 或 "2" 或 "1/3"
  decimal: number;        // e.g. 2.333...
  wholePart: number;
  remainder: number;
  isWhole: boolean;
}

/**
 * 計算長度相對於基準單位的假分數與帶分數表達式
 * @param rodLength 當前方塊長度
 * @param unitLength 基準方塊長度（預設為 1）
 */
export function calculateFraction(rodLength: number, unitLength: number): FractionResult {
  if (unitLength <= 0) {
    unitLength = 1;
  }

  const numerator = rodLength;
  const denominator = unitLength;
  const improper = `${numerator}/${denominator}`;
  const wholePart = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;
  const isWhole = remainder === 0;

  let mixed: string;
  if (denominator === 1) {
    mixed = `${numerator}`;
  } else if (wholePart === 0) {
    mixed = `${remainder}/${denominator}`;
  } else if (isWhole) {
    mixed = `${wholePart}`;
  } else {
    mixed = `${wholePart} 又 ${remainder}/${denominator}`;
  }

  const decimal = Number((numerator / denominator).toFixed(2));

  return {
    numerator,
    denominator,
    improper,
    mixed,
    decimal,
    wholePart,
    remainder,
    isWhole,
  };
}
