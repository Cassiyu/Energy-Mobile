const classifyDeviceEfficiency = (deviceType: string, monthlyUsage: number): string => {
  switch (deviceType) {
    case 'Ar Condicionado':
      if (monthlyUsage <= 100) return 'A';
      if (monthlyUsage <= 200) return 'B';
      if (monthlyUsage <= 300) return 'C';
      return 'D';
    case 'Fogão':
      if (monthlyUsage <= 20) return 'A';
      if (monthlyUsage <= 40) return 'B';
      if (monthlyUsage <= 60) return 'C';
      return 'D';
    case 'Micro-ondas':
      if (monthlyUsage <= 30) return 'A';
      if (monthlyUsage <= 60) return 'B';
      if (monthlyUsage <= 90) return 'C';
      return 'D';
    case 'Forno elétrico':
      if (monthlyUsage <= 50) return 'A';
      if (monthlyUsage <= 100) return 'B';
      if (monthlyUsage <= 150) return 'C';
      return 'D';
    case 'Lâmpada':
      if (monthlyUsage <= 5) return 'A';
      if (monthlyUsage <= 10) return 'B';
      if (monthlyUsage <= 15) return 'C';
      return 'D';
    case 'Lavador de roupa':
      if (monthlyUsage <= 80) return 'A';
      if (monthlyUsage <= 150) return 'B';
      if (monthlyUsage <= 200) return 'C';
      return 'D';
    case 'Refrigerador':
      if (monthlyUsage <= 50) return 'A';
      if (monthlyUsage <= 100) return 'B';
      if (monthlyUsage <= 150) return 'C';
      return 'D';
    case 'Televisor':
      if (monthlyUsage <= 30) return 'A';
      if (monthlyUsage <= 60) return 'B';
      if (monthlyUsage <= 90) return 'C';
      return 'D';
    case 'Ventilador':
      if (monthlyUsage <= 15) return 'A';
      if (monthlyUsage <= 30) return 'B';
      if (monthlyUsage <= 50) return 'C';
      return 'D';
    default:
      if (monthlyUsage <= 50) return 'A';
      if (monthlyUsage <= 100) return 'B';
      if (monthlyUsage <= 200) return 'C';
      return 'D';
  }
};

export default classifyDeviceEfficiency;

