// Karbon Hesaplama Servisi (Business Logic Layer - Service Layer)
const EMISSION_FACTORS = {
    car: 0.21,
    bus: 0.089,
    train: 0.014,
    plane: 0.255,
    electricityHourlyConsumption: 1.2,
    electricityEmissionFactor: 0.5,
    gasHourlyConsumption: 0.3,
    gasEmissionFactor: 1.96,
    meatMeal: 3.5,
    vegetarianMeal: 1.0,
    shopping: 0.5
};

class CarbonCalculationService {
    // Ulaşım karbon hesaplama
    static calculateTransportCarbon(transportData) {
        let total = 0;
        
        if (transportData.carKm) {
            total += transportData.carKm * EMISSION_FACTORS.car;
        }
        if (transportData.busKm) {
            total += transportData.busKm * EMISSION_FACTORS.bus;
        }
        if (transportData.trainKm) {
            total += transportData.trainKm * EMISSION_FACTORS.train;
        }
        if (transportData.planeKm) {
            total += transportData.planeKm * EMISSION_FACTORS.plane;
        }
        
        return parseFloat(total.toFixed(2));
    }

    // Enerji karbon hesaplama
    static calculateEnergyCarbon(energyData) {
        let total = 0;
        
        if (energyData.electricityHours) {
            const kwh = energyData.electricityHours * EMISSION_FACTORS.electricityHourlyConsumption;
            total += kwh * EMISSION_FACTORS.electricityEmissionFactor;
        }
        
        if (energyData.gasHours) {
            const m3 = energyData.gasHours * EMISSION_FACTORS.gasHourlyConsumption;
            total += m3 * EMISSION_FACTORS.gasEmissionFactor;
        }
        
        return parseFloat(total.toFixed(2));
    }

    // Beslenme karbon hesaplama
    static calculateFoodCarbon(foodData) {
        let total = 0;
        
        if (foodData.meatMeals) {
            total += foodData.meatMeals * EMISSION_FACTORS.meatMeal;
        }
        
        if (foodData.vegetarianMeals) {
            total += foodData.vegetarianMeals * EMISSION_FACTORS.vegetarianMeal;
        }
        
        return parseFloat(total.toFixed(2));
    }

    // Tüketim karbon hesaplama
    static calculateShoppingCarbon(shoppingData) {
        if (!shoppingData.amount) return 0;
        
        const total = (shoppingData.amount / 100) * EMISSION_FACTORS.shopping;
        return parseFloat(total.toFixed(2));
    }

    // Toplam karbon hesaplama
    static calculateTotalCarbon(calculationData) {
        const transportCarbon = this.calculateTransportCarbon(calculationData.transport || {});
        const energyCarbon = this.calculateEnergyCarbon(calculationData.energy || {});
        const foodCarbon = this.calculateFoodCarbon(calculationData.food || {});
        const shoppingCarbon = this.calculateShoppingCarbon(calculationData.shopping || {});

        const total = transportCarbon + energyCarbon + foodCarbon + shoppingCarbon;
        
        return {
            total: parseFloat(total.toFixed(2)),
            transport: transportCarbon,
            energy: energyCarbon,
            food: foodCarbon,
            shopping: shoppingCarbon
        };
    }
}

module.exports = CarbonCalculationService;

