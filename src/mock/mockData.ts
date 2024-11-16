const generateMockDeviceData = () => {
  const deviceTypes = [
    { type: 'Ar Condicionado', minWatts: 1000, maxWatts: 3000, usageHours: [1, 8] as [number, number] },
    { type: 'Fogão', minWatts: 800, maxWatts: 1500, usageHours: [0.5, 2] as [number, number] },
    { type: 'Micro-ondas', minWatts: 600, maxWatts: 1200, usageHours: [0.1, 0.5] as [number, number] },
    { type: 'Forno elétrico', minWatts: 1000, maxWatts: 2500, usageHours: [0.5, 2] as [number, number] },
    { type: 'Lâmpada', minWatts: 5, maxWatts: 100, usageHours: [2, 12] as [number, number] },
    { type: 'Lavador de roupa', minWatts: 500, maxWatts: 1500, usageHours: [0.5, 1.5] as [number, number] },
    { type: 'Refrigerador', minWatts: 100, maxWatts: 400, usageHours: [24, 24] as [number, number] },
    { type: 'Televisor', minWatts: 50, maxWatts: 400, usageHours: [1, 8] as [number, number] },
    { type: 'Ventilador', minWatts: 20, maxWatts: 100, usageHours: [2, 12] as [number, number] },
  ];

  const getRandomValue = (min: number, max: number): number => Math.random() * (max - min) + min;

  const generateDevice = (deviceType: { type: string; minWatts: number; maxWatts: number; usageHours: [number, number]; }) => {
    const watts = Math.round(getRandomValue(deviceType.minWatts, deviceType.maxWatts));
    const usageHours = parseFloat(getRandomValue(deviceType.usageHours[0], deviceType.usageHours[1]).toFixed(2));

    return {
      device_name: `${deviceType.type} ${Math.floor(Math.random() * 100)}`,
      device_type: deviceType.type,
      energy_consumption_watts: watts,
      usage_hours: usageHours,
    };
  };

  let mockData: { device_name: string; device_type: string; energy_consumption_watts: number; usage_hours: number; }[] = [];
  deviceTypes.forEach(deviceType => {
    const instances = Math.floor(getRandomValue(1, 3));
    for (let i = 0; i < instances; i++) {
      mockData.push(generateDevice(deviceType));
    }
  });

  return mockData;
};

export default generateMockDeviceData;
