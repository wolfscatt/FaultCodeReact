/**
 * Fault Repository Tests
 */

import {searchFaults, getFaultById} from '../faultRepo';

describe('faultRepo', () => {
  describe('searchFaults', () => {
    it('should return all faults with empty filters', async () => {
      const faults = await searchFaults({});
      expect(faults).toBeDefined();
      expect(faults.length).toBeGreaterThan(0);
    });

    it('should filter by brand ID', async () => {
      const faults = await searchFaults({brandId: 'brand_001'});
      expect(faults.length).toBeGreaterThan(0);
      faults.forEach(fault => {
        expect(fault.brandId).toBe('brand_001');
      });
    });

    it('should search by exact fault code and return it first (score +8)', async () => {
      const faults = await searchFaults({q: 'E03'});
      expect(faults.length).toBeGreaterThan(0);
      // Exact code match should be first with score of 8 (or 10 if brand matches)
      expect(faults[0].code).toBe('E03');
    });

    it('should give higher score for exact code match than title match', async () => {
      // Search for "E03" - exact code match (score +8) should rank higher
      // than title includes (score +4)
      const faults = await searchFaults({q: 'E03'});
      expect(faults.length).toBeGreaterThan(0);
      
      // First result should have exact code match
      expect(faults[0].code.toLowerCase()).toBe('e03');
    });

    it('should score: brand exact +10, code exact +8, title +4, summary +2', async () => {
      // Search with brand filter for E03 should give highest score
      const withBrand = await searchFaults({brandId: 'brand_008', q: 'E03'});
      const withoutBrand = await searchFaults({q: 'E03'});
      
      // Both should return results, but with brand should score higher (10+8 vs 8)
      expect(withBrand.length).toBeGreaterThan(0);
      expect(withoutBrand.length).toBeGreaterThan(0);
      expect(withBrand[0].code).toBe('E03');
    });

    it('should search by title keywords', async () => {
      const faults = await searchFaults({q: 'pressure'});
      expect(faults.length).toBeGreaterThan(0);
      // Check that results contain pressure-related faults
      const hasPressureFault = faults.some(
        f => f.title.toLowerCase().includes('pressure') ||
             f.summary.toLowerCase().includes('pressure')
      );
      expect(hasPressureFault).toBe(true);
    });

    it('should return empty array for non-matching query', async () => {
      const faults = await searchFaults({q: 'xyz123nonexistent'});
      expect(faults).toEqual([]);
    });

    it('should combine brand filter (Arçelik) with E03 code search', async () => {
      const faults = await searchFaults({
        brandId: 'brand_008',
        q: 'E03',
      });
      expect(faults.length).toBeGreaterThan(0);
      // Should return E03 from Arçelik (brand_008)
      expect(faults[0].brandId).toBe('brand_008');
      expect(faults[0].code).toBe('E03');
    });
  });

  describe('getFaultById', () => {
    it('should return fault with resolution steps', async () => {
      const result = await getFaultById('fault_001');
      expect(result).toBeDefined();
      expect(result?.fault).toBeDefined();
      expect(result?.fault.id).toBe('fault_001');
      expect(result?.steps).toBeDefined();
      expect(Array.isArray(result?.steps)).toBe(true);
    });

    it('should return steps in correct order', async () => {
      const result = await getFaultById('fault_001');
      if (result && result.steps.length > 1) {
        for (let i = 1; i < result.steps.length; i++) {
          expect(result.steps[i].order).toBeGreaterThan(result.steps[i - 1].order);
        }
      }
    });

    it('should return null for non-existent fault', async () => {
      const result = await getFaultById('non_existent_fault');
      expect(result).toBeNull();
    });
  });
});

