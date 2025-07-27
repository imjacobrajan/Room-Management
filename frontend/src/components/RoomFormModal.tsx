import React, { useState, useEffect } from "react";
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  WifiOutlined,
  BugOutlined,
  HomeOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  InboxOutlined,
  SoundOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomValidationSchema, type RoomFormData } from "../utils/validation";
import { roomService, configService } from "../services/api";
import type { Room } from "../types/room";
import { Tv } from "lucide-react";

const { Step } = Steps;
const { Option } = Select;

interface RoomFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editRoom?: Room | null;
}

const RoomFormModal: React.FC<RoomFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editRoom,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [configOptions, setConfigOptions] = useState<any>({});
  const [fileList, setFileList] = useState<any[]>([]);
  const [packageRates, setPackageRates] = useState([
    { packageName: "", rate: 0, duration: "" },
  ]);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomValidationSchema),
    mode: "onChange",
    defaultValues: {
      additionalCharges: {
        nursingCharges: 0,
        cleaningCharges: 0,
        equipmentCharges: 0,
      },
      capacity: {
        totalBeds: 1,
        availableBeds: 1,
        patientCapacity: 1,
      },
      status: "Available",
    },
  });

  const watchedCategory = watch("roomCategory");

  useEffect(() => {
    if (visible) {
      loadConfigData();
      if (editRoom) {
        populateFormData(editRoom);
      } else {
        resetForm();
      }
    }
  }, [visible, editRoom]);

  const loadConfigData = async () => {
    try {
      const [branchesRes, optionsRes] = await Promise.all([
        configService.getBranches(),
        configService.getConfigurableOptions(),
      ]);

      setBranches(branchesRes.data.data || []);
      setConfigOptions(optionsRes.data.data || {});
    } catch (error) {
      message.error("Failed to load configuration data");
    }
  };

  const populateFormData = (room: Room) => {
    reset({
      roomName: room.roomName,
      hospitalBranch: room.hospitalBranch,
      floorName: room.floorName,
      roomNumber: room.roomNumber,
      wingBuilding: room.wingBuilding,
      roomCategory: room.roomCategory,
      customCategory: room.customCategory,
      rentAmount: room.rentAmount,
      additionalCharges: room.additionalCharges || {
        nursingCharges: 0,
        cleaningCharges: 0,
        equipmentCharges: 0,
      },
      facilities: room.facilities || [],
      capacity: room.capacity,
      status: room.status,
    });

    setPackageRates(
      room.packageRates || [{ packageName: "", rate: 0, duration: "" }]
    );

    if (room.images?.length) {
      const imageFiles = room.images.map((url, index) => ({
        uid: `existing-${index}`,
        name: `image-${index}`,
        status: "done",
        url: url,
        response: { url: url },
      }));
      setFileList(imageFiles);
    }
  };

  const resetForm = () => {
    reset();
    setPackageRates([{ packageName: "", rate: 0, duration: "" }]);
    setFileList([]);
    setCurrentStep(0);
  };

  const steps = [
    { title: "Basic Details", content: "basic" },
    { title: "Charges", content: "rates" },
    { title: "Facilities", content: "facilities" },
    { title: "Capacity", content: "capacity" },
    { title: "Images", content: "images" },
    { title: "Status", content: "status" },
  ];

  const getFieldsForStep = (step: number): (keyof RoomFormData)[] => {
    switch (step) {
      case 0:
        return [
          "roomName",
          "hospitalBranch",
          "floorName",
          "roomNumber",
          "wingBuilding",
          "roomCategory",
        ];
      case 1:
        return ["rentAmount"];
      case 2:
        return [];
      case 3:
        return ["capacity"];
      case 4:
        return [];
      case 5:
        return ["status"];
      default:
        return [];
    }
  };

  const next = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: RoomFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "additionalCharges" || key === "capacity") {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "object" && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const validPackageRates = packageRates.filter(
        (p) => p.packageName && p.rate > 0
      );
      if (validPackageRates.length > 0) {
        formData.append("packageRates", JSON.stringify(validPackageRates));
      }

      fileList.forEach((file: any) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });

      if (editRoom?._id) {
        await roomService.updateRoom(editRoom._id, formData);
        message.success("Room updated successfully");
      } else {
        await roomService.createRoom(formData);
        message.success("Room created successfully");
      }

      onSuccess();
      handleCancel();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save room";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const addPackageRate = () => {
    setPackageRates([
      ...packageRates,
      { packageName: "", rate: 0, duration: "" },
    ]);
  };

  const removePackageRate = (index: number) => {
    if (packageRates.length > 1) {
      setPackageRates(packageRates.filter((_, i) => i !== index));
    }
  };

  const updatePackageRate = (index: number, field: string, value: any) => {
    const newRates = [...packageRates];
    newRates[index] = { ...newRates[index], [field]: value };
    setPackageRates(newRates);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <Controller
                  name="roomName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter room name"
                      status={errors.roomName ? "error" : ""}
                    />
                  )}
                />
                {errors.roomName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.roomName.message}
                  </p>
                )}
              </div>
            </Col>

            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Branch *
                </label>
                <Controller
                  name="hospitalBranch"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select branch"
                      status={errors.hospitalBranch ? "error" : ""}
                      className="w-full"
                    >
                      {branches.map((branch: any) => (
                        <Option
                          key={branch.id || branch.name}
                          value={branch.name}
                        >
                          {branch.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
                {errors.hospitalBranch && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.hospitalBranch.message}
                  </p>
                )}
              </div>
            </Col>

            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Name/Number *
                </label>
                <Controller
                  name="floorName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g., Ground Floor, 2nd Floor"
                      status={errors.floorName ? "error" : ""}
                    />
                  )}
                />
                {errors.floorName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.floorName.message}
                  </p>
                )}
              </div>
            </Col>

            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number/Label *
                </label>
                <Controller
                  name="roomNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g., A101, G12"
                      status={errors.roomNumber ? "error" : ""}
                    />
                  )}
                />
                {errors.roomNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.roomNumber.message}
                  </p>
                )}
              </div>
            </Col>

            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wing/Building Name *
                </label>
                <Controller
                  name="wingBuilding"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select wing/building"
                      status={errors.wingBuilding ? "error" : ""}
                      className="w-full"
                    >
                      {configOptions.wingBuildings?.map((wing: string) => (
                        <Option key={wing} value={wing}>
                          {wing}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
                {errors.wingBuilding && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.wingBuilding.message}
                  </p>
                )}
              </div>
            </Col>

            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Category *
                </label>
                <Controller
                  name="roomCategory"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select room category"
                      status={errors.roomCategory ? "error" : ""}
                      className="w-full"
                    >
                      {configOptions.roomCategories?.map((category: string) => (
                        <Option key={category} value={category}>
                          {category}
                        </Option>
                      ))}
                      <Option value="custom">Custom Category</Option>
                    </Select>
                  )}
                />
                {errors.roomCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.roomCategory.message}
                  </p>
                )}
              </div>
            </Col>

            {watchedCategory === "custom" && (
              <Col span={24}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Category
                  </label>
                  <Controller
                    name="customCategory"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Enter custom category" />
                    )}
                  />
                </div>
              </Col>
            )}
          </Row>
        );

      case 1:
        return (
          <div>
            <Row gutter={16}>
              <Col span={8}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Rent Amount (₹) *
                  </label>
                  <Controller
                    name="rentAmount"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        className="!w-full"
                        placeholder="Enter rent amount"
                        min={0}
                        formatter={(value) =>
                          `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) =>
                          Number(value!.replace(/₹\s?|(,*)/g, ""))
                        }
                        status={errors.rentAmount ? "error" : ""}
                      />
                    )}
                  />
                  {errors.rentAmount && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.rentAmount.message}
                    </p>
                  )}
                </div>
              </Col>
            </Row>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Additional Charges
              </h4>
              <Row gutter={16}>
                <Col span={8}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nursing Charges (₹)
                    </label>
                    <Controller
                      name="additionalCharges.nursingCharges"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          className="!w-full"
                          placeholder="0"
                          min={0}
                          formatter={(value) =>
                            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) =>
                            Number(value!.replace(/₹\s?|(,*)/g, ""))
                          }
                        />
                      )}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cleaning Charges (₹)
                    </label>
                    <Controller
                      name="additionalCharges.cleaningCharges"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          className="!w-full"
                          placeholder="0"
                          min={0}
                          formatter={(value) =>
                            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) =>
                            Number(value!.replace(/₹\s?|(,*)/g, ""))
                          }
                        />
                      )}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Charges (₹)
                    </label>
                    <Controller
                      name="additionalCharges.equipmentCharges"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          className="!w-full"
                          placeholder="0"
                          min={0}
                          formatter={(value) =>
                            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) =>
                            Number(value!.replace(/₹\s?|(,*)/g, ""))
                          }
                        />
                      )}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Package Rates
                </h4>
                <Button
                  type="dashed"
                  onClick={addPackageRate}
                  icon={<PlusOutlined />}
                >
                  Add Package
                </Button>
              </div>

              {packageRates.map((pkg, index) => (
                <Row key={index} gutter={16} className="mb-4">
                  <Col span={8}>
                    <Input
                      placeholder="Package name"
                      value={pkg.packageName}
                      onChange={(e) =>
                        updatePackageRate(index, "packageName", e.target.value)
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <InputNumber
                      className="!w-full"
                      placeholder="Rate"
                      min={0}
                      value={pkg.rate}
                      formatter={(value) =>
                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        Number(value!.replace(/₹\s?|(,*)/g, ""))
                      }
                      onChange={(value) =>
                        updatePackageRate(index, "rate", value || 0)
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <Select
                      className="!w-full"
                      placeholder="Duration"
                      value={pkg.duration || undefined}
                      onChange={(value) =>
                        updatePackageRate(index, "duration", value)
                      }
                    >
                      {configOptions.packageTypes?.map((type: string) => (
                        <Option key={type} value={type}>
                          {type}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={4}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removePackageRate(index)}
                      disabled={packageRates.length === 1}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          </div>
        );

      case 2:
        const facilityIcons: { [key: string]: React.ReactNode } = {
          AC: <BugOutlined />, // or use a more appropriate AC icon
          WiFi: <WifiOutlined />,
          TV: <Tv />,
          Bathroom: <HomeOutlined />,
          Balcony: <EnvironmentOutlined />,
          Refrigerator: <ShoppingOutlined />, // or use a fridge-specific icon
          Cupboard: <InboxOutlined />,
          Telephone: <PhoneOutlined />,
          Intercom: <SoundOutlined />,
          "Emergency Bell": <BellOutlined />,
        };

        const selectedFacilities = watch("facilities") || [];

        return (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Room Facilities
            </h4>
            <Controller
              name="facilities"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-4">
                  {configOptions.facilities?.map((facility: string) => {
                    const isSelected = selectedFacilities.includes(facility);
                    console.log(facility);
                    const icon = facilityIcons[facility] || <HomeOutlined />;

                    return (
                      <div
                        key={facility}
                        className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                  ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }
                `}
                        onClick={() => {
                          const currentValues = field.value || [];
                          const newValues = isSelected
                            ? currentValues.filter(
                                (f: string) => f !== facility
                              )
                            : [...currentValues, facility];
                          field.onChange(newValues);
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <div
                            className={`
                      flex h-10 w-10 items-center justify-center rounded-lg
                      ${
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                          >
                            <span className="text-lg">{icon}</span>
                          </div>

                          <div
                            className={`
                      text-sm font-medium flex-1
                      ${isSelected ? "text-blue-900" : "text-gray-900"}
                    `}
                          >
                            {facility}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            />

            {selectedFacilities.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-medium">{selectedFacilities.length}</span>{" "}
                facility(ies) selected
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <Row gutter={16}>
            <Col span={8}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Beds *
                </label>
                <Controller
                  name="capacity.totalBeds"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      className="!w-full"
                      placeholder="Total beds"
                      min={1}
                      status={errors.capacity?.totalBeds ? "error" : ""}
                    />
                  )}
                />
                {errors.capacity?.totalBeds && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.capacity.totalBeds.message}
                  </p>
                )}
              </div>
            </Col>
            <Col span={8}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Beds *
                </label>
                <Controller
                  name="capacity.availableBeds"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      className="!w-full"
                      placeholder="Available beds"
                      min={0}
                      status={errors.capacity?.availableBeds ? "error" : ""}
                    />
                  )}
                />
                {errors.capacity?.availableBeds && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.capacity.availableBeds.message}
                  </p>
                )}
              </div>
            </Col>
            <Col span={8}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Capacity *
                </label>
                <Controller
                  name="capacity.patientCapacity"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      className="!w-full"
                      placeholder="Patient capacity"
                      min={1}
                      status={errors.capacity?.patientCapacity ? "error" : ""}
                    />
                  )}
                />
                {errors.capacity?.patientCapacity && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.capacity.patientCapacity.message}
                  </p>
                )}
              </div>
            </Col>
          </Row>
        );

      case 4:
        return (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Room Images
            </h4>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              multiple
              maxCount={5}
              accept="image/*"
            >
              {fileList.length >= 5 ? null : (
                <div>
                  <PlusOutlined />
                  <div className="mt-2">Upload</div>
                </div>
              )}
            </Upload>
          </div>
        );

      case 5:
        return (
          <Row gutter={16}>
            <Col span={24}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Room Status *
                </label>

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => {
                    const statusOptions = [
                      { value: "Available", label: "Available" },
                      { value: "Occupied", label: "Occupied" },
                      { value: "Maintenance", label: "Maintenance" },
                      { value: "Reserved", label: "Reserved" },
                      { value: "Blocked", label: "Blocked" },
                    ];

                    return (
                      <div className="grid grid-cols-5 gap-4">
                        {statusOptions.map((status) => {
                          const isSelected = field.value === status.value;

                          return (
                            <div
                              key={status.value}
                              className={`
                      relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 text-center
                      ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }
                    `}
                              onClick={() => field.onChange(status.value)}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                                  <svg
                                    className="h-3 w-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}

                              <div
                                className={`
                        text-sm font-medium
                        ${isSelected ? "text-blue-900" : "text-gray-900"}
                      `}
                              >
                                {status.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />

                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={editRoom ? "Edit Room" : "Add New Room"}
      open={visible}
      onCancel={handleCancel}
      width={900}
      footer={null}
      destroyOnClose
    >
      <div className="my-10">
        <Steps current={currentStep} size="small">
          {steps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <div className="min-h-[400px]">{renderStepContent()}</div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <div>
            {currentStep > 0 && <Button onClick={prev}>Previous</Button>}
          </div>
          <div>
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit" loading={loading}>
                {editRoom ? "Update Room" : "Create Room"}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default RoomFormModal;
