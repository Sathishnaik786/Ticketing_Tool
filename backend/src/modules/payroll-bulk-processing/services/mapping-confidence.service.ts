import { MappingStatus, MatchedBy } from '../types/bulk-upload.types';

export class MappingConfidenceService {
  /**
   * Calculates weighted confidence score and status for a mapping.
   */
  static calculateConfidence(params: {
    codeMatch: boolean;
    nameMatch: boolean;
    departmentMatch: boolean;
    positionMatch?: boolean;
    identityDocMatch?: boolean; // PAN/UAN
  }): { score: number; status: MappingStatus; matchedBy?: MatchedBy } {
    let score = 0;
    let matchedBy: MatchedBy | undefined;

    // 1. Weighted Scoring
    if (params.codeMatch) {
      score += 70;
      matchedBy = MatchedBy.EMPLOYEE_CODE;
    }
    
    if (params.nameMatch) {
      score += 20;
      if (!matchedBy) matchedBy = MatchedBy.EMPLOYEE_NAME;
    }
    
    if (params.departmentMatch) score += 5;
    if (params.positionMatch) score += 5;
    if (params.identityDocMatch) score += 15;

    // Cap at 100
    score = Math.min(score, 100);

    // 2. Status Thresholds
    let status: MappingStatus;
    
    if (score >= 90) {
      status = MappingStatus.MATCHED;
    } else if (score >= 70) {
      // 70-89: Technically a partial match, requires review
      status = MappingStatus.PARTIAL_MATCH;
    } else if (score >= 40) {
      status = MappingStatus.AMBIGUOUS;
    } else {
      status = MappingStatus.NOT_FOUND;
    }

    // 3. Safety Check: Name-only or Partial Fuzzy matches must NOT be MATCHED
    if (!params.codeMatch && !params.identityDocMatch && status === MappingStatus.MATCHED) {
       status = MappingStatus.PARTIAL_MATCH;
    }

    return { score, status, matchedBy };
  }
}
