/**
 * Resort Information Service.
 * Serves verified resort knowledge for guest exploration and search.
 */

class ResortInfoService {
  constructor(resortInfoRepository) {
    this.resortInfoRepository = resortInfoRepository;
  }

  async list(filters = {}) {
    return this.resortInfoRepository.list(filters);
  }
}

module.exports = ResortInfoService;
