import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Tag, Badge, Image, Row, Col, Spin, message, Card } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Layout from "../components/Layout";
import RoomFormModal from "../components/RoomFormModal";
import { roomService } from "../services/api";
import type { Room } from "../types/room";
import { Heart } from "lucide-react";

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadRoomDetails(id);
    }
  }, [id]);

  const loadRoomDetails = async (roomId: string) => {
    setLoading(true);
    try {
      const response = await roomService.getRoomById(roomId);
      setRoom(response.data.data);
    } catch (error) {
      message.error("Failed to load room details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!room?._id) return;

    setLoading(true);
    try {
      await roomService.deleteRoom(room?._id);
      navigate("/");
    } catch (error) {
      message.error("Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    if (id) {
      loadRoomDetails(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Occupied":
        return "red";
      case "Maintenance":
        return "orange";
      case "Cleaning":
        return "blue";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Room not found</h2>
            <Button
              type="primary"
              onClick={() => navigate("/")}
              className="mt-4"
            >
              Go Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            className="mb-4"
          >
            Back
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card className="h-max">
              <div className="relative mb-6">
                {room.images && room.images.length > 0 ? (
                  <Image
                    src={room.images[0]}
                    alt={room.roomName}
                    height={300}
                    width="100%"
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] bg-gray-100 rounded-lg">
                    <HomeOutlined className="text-6xl text-gray-400" />
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  <div className="bg-white px-3 py-1 rounded-full shadow-lg text-sm font-medium">
                    <Badge status={getStatusColor(room.status) as any} />
                    <span className="ms-2">{room.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="text-left mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {room.roomName}
                  </h2>
                  <div className="flex items-center justify-start space-x-2 text-gray-600 mb-4">
                    <HomeOutlined />
                    <span>{room.roomNumber}</span>
                    <span>•</span>
                    <span>{room.floorName}</span>
                  </div>
                  <Tag color="blue" className="text-sm px-3 py-1">
                    {room.roomId}
                  </Tag>
                </div>

                <div className="">
                  <Heart size={24} className="text-gray-400 me-5" />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3  ">
                  <div className="p-1 px-2 bg-gray-100 rounded-md">
                    <HomeOutlined />
                  </div>

                  <div>
                    <div className="font-medium">{room.hospitalBranch}</div>
                    <div className="text-sm text-gray-600">Branch</div>
                  </div>

                  <div className="p-1 px-2 bg-gray-100 rounded-md ms-4">
                    <TeamOutlined />
                  </div>

                  <div>
                    <div className="font-medium">{room.roomCategory}</div>
                    <div className="text-sm text-gray-600">Category</div>
                  </div>
                </div>
              </div>

              <div className="space-x-5 flex">
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Edit Room
                </Button>
                <Button
                  danger
                  block
                  size="large"
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Delete Room
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <div className="!space-y-2">
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Room Overview
                </h3>
                <Row gutter={[24, 16]}>
                  <Col xs={12} sm={8}>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {room.capacity.totalBeds}
                      </div>
                      <div className="text-sm text-gray-600">Total Beds</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={8}>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {room.capacity.availableBeds}
                      </div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={8}>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {room.capacity.patientCapacity}
                      </div>
                      <div className="text-sm text-gray-600">Max Capacity</div>
                    </div>
                  </Col>
                </Row>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Location & Category
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-gray-600">Room Number:</span>
                      <span className="font-medium">{room.roomNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium">{room.floorName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Wing/Building:</span>
                      <span className="font-medium">{room.wingBuilding}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-gray-600">Branch:</span>
                      <span className="font-medium">{room.hospitalBranch}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-gray-600">Category:</span>
                      <Tag color="purple">{room.roomCategory}</Tag>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Status:</span>
                      <Badge
                        status={getStatusColor(room.status) as any}
                        text={room.status}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Rates & Charges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Base Charges
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1 ">
                        <span className="text-gray-600">Daily Rent:</span>
                        <span className=" font-bold ">
                          ₹{room.rentAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Additional Charges
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Nursing:</span>
                        <span className="text-sm font-medium">
                          ₹
                          {room.additionalCharges?.nursingCharges?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Cleaning:</span>
                        <span className="text-sm font-medium">
                          ₹
                          {room.additionalCharges?.cleaningCharges?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">
                          Equipment:
                        </span>
                        <span className="text-sm font-medium">
                          ₹
                          {room.additionalCharges?.equipmentCharges?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {room.packageRates && room.packageRates.length > 0 && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Package Rates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.packageRates.map((pkg, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="font-medium text-gray-900 mb-1">
                          {pkg.packageName}
                        </div>
                        <div className="text-lg font-bold text-primary mb-1">
                          ₹{pkg.rate.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pkg.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {room.facilities && room.facilities.length > 0 && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Room Facilities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircleOutlined className="text-green-600 text-sm" />
                        <span className="text-sm font-medium">{facility}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </div>

      <RoomFormModal
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        editRoom={room}
      />
    </Layout>
  );
};

export default RoomDetails;
