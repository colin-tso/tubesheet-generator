import { TubeSheet } from '../src/modules.js'

const closeTo = (expected, precision = 2) => ({
  asymmetricMatch: actual =>
    Math.abs(expected - actual) < Math.pow(10, -precision) / 2,
})

describe('Validating TubeSheet objects', () => {
  test('Testing creating new TubeSheet objects', async () => {
    const testArgs: [
      number,
      number,
      number,
      number | string,
      number?,
      number?,
    ][] = [
      [40, 95.3, 1.21, 30],
      [40, 95.3, 1.21, 60, 50],
      [40, 95.3, 1.21, 45, 50, null],
      [40, 95.3, 1.21, 'radial', null, 60],
      [40, 95.3, 1.21, 30, null, null],
    ]

    await Promise.all(
      testArgs.map(async args => {
        expect(async () => {
          const fooTubeSheet = new TubeSheet(...args)
        }).not.toThrow()
      }),
    )
  })

  test('Validation of derived TubeSheet class properties when minTubes and shellID are null', () => {
    const fooTubeSheet = new TubeSheet(40, 95.3, 1.21, 30)
    expect(fooTubeSheet.tubeField).toBe(null)
    expect(fooTubeSheet.minID).toBe(null)
    expect(fooTubeSheet.numTubes).toBe(0)
  })

  describe('Validation of 30° layout', () => {
    const args_base: [number, number, number, number | string] = [
      40,
      95.3,
      (95.3 + 20) / 95.3,
      30,
    ]

    const args_shellIDnull: [number, number, number, number | string, number] =
      [...args_base, 12]

    const args_minTubesnull: [number, number, number, number | string, null] = [
      ...args_base,
      null,
    ]

    const expectedTubeField = [
      {
        x: 0,
        y: closeTo(-199.70545811269156, 6),
      },
      {
        x: closeTo(-172.95, 6),
        y: closeTo(-99.85272905634578, 6),
      },
      {
        x: closeTo(-57.65, 6),
        y: closeTo(-99.85272905634578, 6),
      },
      {
        x: closeTo(57.65, 6),
        y: closeTo(-99.85272905634578, 6),
      },
      {
        x: closeTo(172.95, 6),
        y: closeTo(-99.85272905634578, 6),
      },
      {
        x: closeTo(-115.3, 6),
        y: 0,
      },
      {
        x: 0,
        y: 0,
      },
      {
        x: closeTo(115.3, 6),
        y: 0,
      },
      {
        x: closeTo(-172.95, 6),
        y: closeTo(99.85272905634578, 6),
      },
      {
        x: closeTo(-57.65, 6),
        y: closeTo(99.85272905634578, 6),
      },
      {
        x: closeTo(57.65, 6),
        y: closeTo(99.85272905634578, 6),
      },
      {
        x: closeTo(172.95, 6),
        y: closeTo(99.85272905634578, 6),
      },
      {
        x: 0,
        y: closeTo(199.70545811269156, 6),
      },
    ]

    const expectedNumTubes = 13
    const expectedMinID = 534.71091622539
    const fooTubeSheet = new TubeSheet(...args_shellIDnull)
    const fooTubeSheet_noMinTubes = new TubeSheet(
      ...args_minTubesnull,
      fooTubeSheet.minID,
    )

    test('Validation of tubeField property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.tubeField).toMatchObject(expectedTubeField)
    })

    test('Validation of minID property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.minID).toBeCloseTo(expectedMinID, 6)
    })

    test('Validation of numTubes property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.numTubes).toBe(expectedNumTubes)
    })

    test('Validation of tubeField property with minTubes = null and shellID defined', () => {
      expect(fooTubeSheet_noMinTubes.tubeField).toMatchObject(expectedTubeField)
    })

    test('Validation of minID property with 30° layout with minTubes = null and shellID defined', () => {
      expect(fooTubeSheet_noMinTubes.minID).toBeCloseTo(expectedMinID, 6)
    })

    test('Validation of numTubes property with 30° layout', () => {
      expect(fooTubeSheet_noMinTubes.numTubes).toBe(expectedNumTubes)
    })
  })

  describe('Validation of 60° layout', () => {
    const args_base: [number, number, number, number | string] = [
      40,
      95.3,
      (95.3 + 20) / 95.3,
      60,
    ]

    const args_shellIDnull: [number, number, number, number | string, number] =
      [...args_base, 5]

    const args_minTubesnull: [number, number, number, number | string, null] = [
      ...args_base,
      null,
    ]

    const expectedTubeField = [
      {
        x: closeTo(0, 6),
        y: closeTo(-115.3, 6),
      },
      {
        x: closeTo(-99.85272905634578, 6),
        y: closeTo(-57.65, 6),
      },
      {
        x: closeTo(99.85272905634578, 6),
        y: closeTo(-57.65, 6),
      },
      {
        x: closeTo(0, 6),
        y: closeTo(0, 6),
      },
      {
        x: closeTo(-99.85272905634578, 6),
        y: closeTo(57.65, 6),
      },
      {
        x: closeTo(99.85272905634578, 6),
        y: closeTo(57.65, 6),
      },
      {
        x: closeTo(0, 6),
        y: closeTo(115.3, 6),
      },
    ]

    const expectedNumTubes = 7
    const expectedMinID = 365.90000000001
    const fooTubeSheet = new TubeSheet(...args_shellIDnull)
    const fooTubeSheet_noMinTubes = new TubeSheet(
      ...args_minTubesnull,
      fooTubeSheet.minID,
    )

    test('Validation of tubeField property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.tubeField).toMatchObject(expectedTubeField)
    })

    test('Validation of minID property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.minID).toBeCloseTo(expectedMinID, 6)
    })

    test('Validation of numTubes property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.numTubes).toBe(expectedNumTubes)
    })

    test('Validation of tubeField property with minTubes = null and shellID defined', () => {
      const fooTubeSheet_noMinTubes = new TubeSheet(
        ...args_minTubesnull,
        fooTubeSheet.minID,
      )
      expect(fooTubeSheet_noMinTubes.tubeField).toMatchObject(expectedTubeField)
    })

    test('Validation of minID property with 30° layout with minTubes = null and shellID defined', () => {
      expect(fooTubeSheet_noMinTubes.minID).toBeCloseTo(expectedMinID, 6)
    })

    test('Validation of numTubes property with 60° layout', () => {
      expect(fooTubeSheet_noMinTubes.numTubes).toBe(expectedNumTubes)
    })
  })

  describe('Validation of 45° layout', () => {
    const args_base: [number, number, number, number | string] = [
      40,
      95.3,
      (95.3 + 20) / 95.3,
      45,
    ]

    const args_shellIDnull: [number, number, number, number | string, number] =
      [...args_base, 10]

    const args_minTubesnull: [number, number, number, number | string, null] = [
      ...args_base,
      null,
    ]

    const expectedTubeField = [
      {
        x: closeTo(-81.52941187080894, 6),
        y: closeTo(-163.05882374161789, 6),
      },
      {
        x: closeTo(81.52941187080894, 6),
        y: closeTo(-163.05882374161789, 6),
      },
      {
        x: closeTo(-163.0588237416179, 6),
        y: closeTo(-81.52941187080894, 6),
      },
      {
        x: closeTo(0, 6),
        y: closeTo(-81.52941187080894, 6),
      },
      {
        x: closeTo(163.0588237416179, 6),
        y: closeTo(-81.52941187080894, 6),
      },
      {
        x: closeTo(-81.52941187080894, 6),
        y: closeTo(0, 6),
      },
      {
        x: closeTo(81.52941187080894, 6),
        y: closeTo(0, 6),
      },
      {
        x: closeTo(-163.0588237416179, 6),
        y: closeTo(81.52941187080894, 6),
      },
      {
        x: closeTo(0, 6),
        y: closeTo(81.52941187080894, 6),
      },
      {
        x: closeTo(163.0588237416179, 6),
        y: closeTo(81.52941187080894, 6),
      },
      {
        x: closeTo(-81.52941187080894, 6),
        y: closeTo(163.05882374161789, 6),
      },
      {
        x: closeTo(81.52941187080894, 6),
        y: closeTo(163.05882374161789, 6),
      },
    ]

    const expectedNumTubes = 12
    const expectedMinID = 499.91061421742
    const fooTubeSheet = new TubeSheet(...args_shellIDnull)
    const fooTubeSheet_noMinTubes = new TubeSheet(
      ...args_minTubesnull,
      fooTubeSheet.minID,
    )

    test('Validation of tubeField property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.tubeField).toMatchObject(expectedTubeField)
    })

    test('Validation of minID property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.minID).toBeCloseTo(expectedMinID, 6)
    })

    test('Validation of numTubes property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.numTubes).toBe(expectedNumTubes)
    })

    test('Validation of tubeField property with minTubes = null and shellID defined', () => {
      const fooTubeSheet_noMinTubes = new TubeSheet(
        ...args_minTubesnull,
        fooTubeSheet.minID,
      )
      expect(fooTubeSheet_noMinTubes.tubeField).toMatchObject(expectedTubeField)
    })

    test('Validation of minID property with 30° layout with minTubes = null and shellID defined', () => {
      expect(fooTubeSheet_noMinTubes.minID).toBeCloseTo(expectedMinID, 6)
    })

    test('Validation of numTubes property with 45° layout', () => {
      expect(fooTubeSheet_noMinTubes.numTubes).toBe(expectedNumTubes)
    })
  })

  describe('Validation of radial layout', () => {
    const args_base: [number, number, number, number | string] = [
      40,
      95.3,
      (95.3 + 20) / 95.3,
      'radial',
    ]

    const args_shellIDnull: [number, number, number, number | string, number] =
      [...args_base, 15]

    const args_minTubesnull: [number, number, number, number | string, null] = [
      ...args_base,
      null,
    ]

    const expectedTubeField = [
      {
        x: closeTo(0, 6),
        y: closeTo(277.2811849744992, 6),
      },
      {
        x: closeTo(1.697857578214028e-14, 6),
        y: closeTo(277.2811849744992, 6),
      },
      {
        x: closeTo(112.78041836460781, 6),
        y: closeTo(253.30896702321152, 6),
      },
      {
        x: closeTo(206.06007781603927, 6),
        y: closeTo(185.53732743388937, 6),
      },
      {
        x: closeTo(263.71007781603925, 6),
        y: closeTo(85.68459837754357, 6),
      },
      {
        x: closeTo(275.7622096307997, 6),
        y: closeTo(-28.983776158418344, 6),
      },
      {
        x: closeTo(240.13255017936828, 6),
        y: closeTo(-138.64059248724953, 6),
      },
      {
        x: closeTo(162.98179126619192, 6),
        y: closeTo(-224.32519086479317, 6),
      },
      {
        x: closeTo(57.650000000000105, 6),
        y: closeTo(-271.2219258114329, 6),
      },
      {
        x: closeTo(-57.64999999999995, 6),
        y: closeTo(-271.2219258114329, 6),
      },
      {
        x: closeTo(-162.9817912661919, 6),
        y: closeTo(-224.32519086479317, 6),
      },
      {
        x: closeTo(-240.13255017936822, 6),
        y: closeTo(-138.64059248724968, 6),
      },
      {
        x: closeTo(-275.7622096307997, 6),
        y: closeTo(-28.98377615841856, 6),
      },
      {
        x: closeTo(-263.7100778160393, 6),
        y: closeTo(85.68459837754354, 6),
      },
      {
        x: closeTo(-206.06007781603932, 6),
        y: closeTo(185.5373274338893, 6),
      },
    ]

    const expectedNumTubes = 15
    const expectedMinID = 689.862369949
    const fooTubeSheet = new TubeSheet(...args_shellIDnull)
    const fooTubeSheet_noMinTubes = new TubeSheet(
      ...args_minTubesnull,
      fooTubeSheet.minID,
    )

    test('Validation of tubeField property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.tubeField).toMatchObject(expectedTubeField)
    })

    test('Validation of minID property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.minID).toBeCloseTo(expectedMinID, 6)
    })

    test('Validation of numTubes property with minTubes defined and shellID = null', () => {
      expect(fooTubeSheet.numTubes).toBe(expectedNumTubes)
    })

    test('Validation of tubeField property with minTubes = null and shellID defined', () => {
      const fooTubeSheet_noMinTubes = new TubeSheet(
        ...args_minTubesnull,
        fooTubeSheet.minID,
      )
      expect(fooTubeSheet_noMinTubes.tubeField).toMatchObject(expectedTubeField)
    })

    test('Validation of minID property with 30° layout with minTubes = null and shellID defined', () => {
      expect(fooTubeSheet_noMinTubes.minID).toBeCloseTo(expectedMinID, 6)
    })

    test('Validation of numTubes property with radial layout', () => {
      expect(fooTubeSheet_noMinTubes.numTubes).toBe(expectedNumTubes)
    })
  })
})
