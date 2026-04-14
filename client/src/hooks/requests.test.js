import { httpGetLaunches, httpGetPlanets } from './requests';

describe('requests', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('httpGetPlanets returns parsed JSON', async () => {
    const planets = [{ keplerName: 'Kepler-62 f' }];
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(planets),
    });

    const result = await httpGetPlanets();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/v1/planets');
    expect(result).toEqual(planets);
  });

  test('httpGetLaunches returns launches sorted by flight number', async () => {
    const launches = [
      { flightNumber: 2, mission: 'B' },
      { flightNumber: 1, mission: 'A' },
    ];
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(launches),
    });

    const result = await httpGetLaunches();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/v1/launches');
    expect(result.map((l) => l.flightNumber)).toEqual([1, 2]);
  });
});
