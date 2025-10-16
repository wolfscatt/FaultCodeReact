/**
 * Brand Repository Tests
 */

import {searchBrands, getBrandById, getAllBrands} from '../brandRepo';

describe('brandRepo', () => {
  describe('getAllBrands', () => {
    it('should return all brands', async () => {
      const brands = await getAllBrands();
      expect(brands).toBeDefined();
      expect(brands.length).toBeGreaterThan(0);
      expect(brands[0]).toHaveProperty('id');
      expect(brands[0]).toHaveProperty('name');
    });
  });

  describe('searchBrands', () => {
    it('should return all brands when query is empty', async () => {
      const brands = await searchBrands('');
      expect(brands.length).toBeGreaterThan(0);
    });

    it('should filter brands by name (case-insensitive)', async () => {
      const brands = await searchBrands('vaillant');
      expect(brands.length).toBeGreaterThan(0);
      expect(brands[0].name.toLowerCase()).toContain('vaillant');
    });

    it('should filter brands by alias', async () => {
      const brands = await searchBrands('worcester');
      expect(brands.length).toBeGreaterThan(0);
      const brand = brands.find(b => b.name === 'Worcester Bosch');
      expect(brand).toBeDefined();
    });

    it('should return empty array for non-existent brand', async () => {
      const brands = await searchBrands('NonExistentBrand12345');
      expect(brands).toEqual([]);
    });
  });

  describe('getBrandById', () => {
    it('should return brand by id', async () => {
      const brand = await getBrandById('brand_001');
      expect(brand).toBeDefined();
      expect(brand?.id).toBe('brand_001');
      expect(brand?.name).toBe('Vaillant');
    });

    it('should return null for non-existent id', async () => {
      const brand = await getBrandById('non_existent_id');
      expect(brand).toBeNull();
    });
  });
});

