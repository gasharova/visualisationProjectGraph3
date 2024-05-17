import Papa from 'papaparse';
import { writable } from 'svelte/store';

let localUrl = 'http://localhost:5173/';

export const load = async () => {
  try {
    // Fetch and parse the CSV file for plants
    const responsePlants = await fetch(localUrl + 'data/Plants.csv');
    const csvTextPlants = await responsePlants.text();
    const parsedDataPlants = Papa.parse(csvTextPlants, {
      header: true,
      dynamicTyping: true
    });
    parsedDataPlants.data.pop(); // remove empty line from CSV (last JSON obj item)
    const plants = parsedDataPlants.data;
    const productionPlants = plants.filter(plant => plant.PlantType === "Production");
    const distributionCenters = plants.filter(plant => plant.PlantType === "Distribution Center");

    // Fetch and parse the CSV file for orders
    const responsePurchases = await fetch(localUrl + 'data/Purchases.csv');
    const csvTextPurchases = await responsePurchases.text();
    const parsedDataPurchases = Papa.parse(csvTextPurchases, {
      header: true,
      dynamicTyping: true
    });
    parsedDataPurchases.data.pop(); // remove empty line from CSV (last JSON obj item)
    const purchases = parsedDataPurchases.data;
    const purchases2024 = purchases.filter(purchases => purchases.PlannedGoodsReceiptDate.startsWith('2024'));
    const purchases2023 = purchases.filter(purchases => purchases.PlannedGoodsReceiptDate.startsWith('2023'));
    const purchases2022 = purchases.filter(purchases => purchases.PlannedGoodsReceiptDate.startsWith('2022'));

    // Function to calculate the difference in days between two dates
    /**
       * @param {string | number | Date} startDate
       * @param {string | number | Date} endDate
       */
    function calculateDaysDifference(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // @ts-ignore
        let difference = end - start;
        difference = difference / (1000 * 60 * 60 * 24); // Convert from milliseconds to days
        difference = Math.abs(difference);
        return difference; // Convert from milliseconds to days
    }

    let averageDaysLate = []

    for(let plant of distributionCenters){
        console.log(plant.PlantKey)
        const purchases2024ForThisPlant = purchases2024.filter(purchases2024 => purchases2024.PlantKey == plant.PlantKey);
        const diffReceiptDate2024 = purchases2024ForThisPlant.map(item => calculateDaysDifference(item.PlannedGoodsReceiptDate, item.ActualGoodsReceiptDate));
        const avgDiffReceiptDate2024 = Math.round(diffReceiptDate2024.reduce((sum, diff) => sum + diff, 0) / diffReceiptDate2024.length);
        const diffDateYard2024 = purchases2024ForThisPlant.map(item => calculateDaysDifference(item.PlannedArrivalDateYard, item.ActualArrivalDateYard));
        const avgDiffDateYard2024 = Math.round(diffDateYard2024.reduce((sum, diff) => sum + diff, 0) / diffDateYard2024.length);
        const diffVendorShipment2024 = purchases2024ForThisPlant.map(item => calculateDaysDifference(item.PlannedVendorShipmentDate, item.ActualVendorShipmentDate));
        const avgDiffVendorShipment2024 = Math.round(diffVendorShipment2024.reduce((sum, diff) => sum + diff, 0) / diffVendorShipment2024.length);

        const purchases2023ForThisPlant = purchases2023.filter(purchases2023 => purchases2023.PlantKey == plant.PlantKey);
        const diffReceiptDate2023 = purchases2023ForThisPlant.map(item => calculateDaysDifference(item.PlannedGoodsReceiptDate, item.ActualGoodsReceiptDate));
        const avgDiffReceiptDate2023 = Math.round(diffReceiptDate2023.reduce((sum, diff) => sum + diff, 0) / diffReceiptDate2023.length);
        const diffDateYard2023 = purchases2023ForThisPlant.map(item => calculateDaysDifference(item.PlannedArrivalDateYard, item.ActualArrivalDateYard));
        const avgDiffDateYard2023 = Math.round(diffDateYard2023.reduce((sum, diff) => sum + diff, 0) / diffDateYard2023.length);
        const diffVendorShipment2023 = purchases2023ForThisPlant.map(item => calculateDaysDifference(item.PlannedVendorShipmentDate, item.ActualVendorShipmentDate));
        const avgDiffVendorShipment2023 = Math.round(diffVendorShipment2023.reduce((sum, diff) => sum + diff, 0) / diffVendorShipment2023.length);

        const purchases2022ForThisPlant = purchases2022.filter(purchases2022 => purchases2022.PlantKey == plant.PlantKey);
        const diffReceiptDate2022 = purchases2022ForThisPlant.map(item => calculateDaysDifference(item.PlannedGoodsReceiptDate, item.ActualGoodsReceiptDate));
        const avgDiffReceiptDate2022 = Math.round(diffReceiptDate2022.reduce((sum, diff) => sum + diff, 0) / diffReceiptDate2022.length);
        const diffDateYard2022 = purchases2022ForThisPlant.map(item => calculateDaysDifference(item.PlannedArrivalDateYard, item.ActualArrivalDateYard));
        const avgDiffDateYard2022 = Math.round(diffDateYard2022.reduce((sum, diff) => sum + diff, 0) / diffDateYard2022.length);
        const diffVendorShipment2022 = purchases2022ForThisPlant.map(item => calculateDaysDifference(item.PlannedVendorShipmentDate, item.ActualVendorShipmentDate));
        const avgDiffVendorShipment2022 = Math.round(diffVendorShipment2022.reduce((sum, diff) => sum + diff, 0) / diffVendorShipment2022.length);
        let averageDaysLateForThisPlant = {
            2024: {
                avgDiffReceiptDate: avgDiffReceiptDate2024,
                avgDiffDateYard: avgDiffDateYard2024,
                avgDiffVendorShipment: avgDiffVendorShipment2024
            },
            2023: {
                avgDiffReceiptDate: avgDiffReceiptDate2023,
                avgDiffDateYard: avgDiffDateYard2023,
                avgDiffVendorShipment: avgDiffVendorShipment2023
            },
            2022: {
                avgDiffReceiptDate: avgDiffReceiptDate2022,
                avgDiffDateYard: avgDiffDateYard2022,
                avgDiffVendorShipment: avgDiffVendorShipment2022
            }
        };
        let finalVariable = {
            'plantKey': plant.PlantKey,
            'averageDaysLateForThisPlant': averageDaysLateForThisPlant
        }
        averageDaysLate.push(finalVariable)
    }

    return {
      someValues: [1, 2, 3, "a string"],
      productionPlants: productionPlants,
      distributionCenters: distributionCenters,
      averageDaysLate: averageDaysLate
    };
  } catch (error) {
    console.error('Error loading CSV:', error);
    return {
      data: []
    };
  }
};