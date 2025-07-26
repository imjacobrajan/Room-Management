import { Request, Response } from "express";
import axios from "axios";

export const getBranches = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      "https://configurations.dev-hmis.yanthralabs.com/api/v1/entity/values/active/public?entityCategory=2&tenantKey=bcfdb3c7-ff4f-11ef-891d-028579933a83"
    );

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch branches",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getFloors = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      "https://configurations.dev-hmis.yanthralabs.com/api/v1/entity/values/active/public?entityCategory=31&tenantKey=bcfdb3c7-ff4f-11ef-891d-028579933a8"
    );

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch floors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getConfigurableOptions = async (req: Request, res: Response) => {
  try {
    const options = {
      roomCategories: [
        "General Ward",
        "Private Room",
        "Semi-Private",
        "ICU",
        "Daycare",
        "Isolation",
        "Maternity",
      ],
      wingBuildings: [
        "Block 1 - South Wing",
        "Block 1 - North Wing",
        "Block 2 - East Wing",
        "Block 2 - West Wing",
      ],
      facilities: [
        "AC",
        "WiFi",
        "TV",
        "Bathroom",
        "Balcony",
        "Refrigerator",
        "Cupboard",
        "Telephone",
        "Intercom",
        "Emergency Bell",
      ],
      packageTypes: [
        "Daily",
        "Weekly",
        "Monthly",
        "Per Visit",
        "Per Procedure",
      ],
    };

    res.json({
      success: true,
      data: options,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch configurable options",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
