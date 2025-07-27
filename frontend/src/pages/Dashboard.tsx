import React, { useState, useEffect } from "react";
import {
  Button,
  Switch,
  Input,
  Select,
  Space,
  message,
  Row,
  Col,
  Empty,
  Spin,
  Card,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  TableOutlined,
  AppstoreOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Layout from "../components/Layout";
import RoomCard from "../components/RoomCard";
import RoomTable from "../components/RoomTable";
import RoomFormModal from "../components/RoomFormModal";
import { roomService, configService } from "../services/api";
import type { Room } from "../types/room";

const { Search } = Input;
const { Option } = Select;

const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pages: 0,
    limit: 10,
  });

  useEffect(() => {
    loadRooms();
    loadBranches();
  }, [searchTerm, statusFilter, branchFilter, pagination.current]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(branchFilter && { branch: branchFilter }),
      };

      const response = await roomService.getAllRooms(params);
      setRooms(response.data.data);
      setPagination((prev) => ({
        ...prev,
        ...response.data.pagination,
      }));
    } catch (error: any) {
      message.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await configService.getBranches();
      setBranches(response.data.data || []);
    } catch (error) {
      console.error("Failed to load branches");
    }
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    loadRooms();
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setBranchFilter("");
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      limit: pageSize || prev.limit,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleBranchChange = (value: string) => {
    setBranchFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center justify-end">
                <div className="bg-gray-100 rounded-lg p-1 hidden lg:flex">
                  <button
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "cards"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setViewMode("cards")}
                  >
                    <AppstoreOutlined className="w-4 h-4 mr-2" />
                    Card View
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "table"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setViewMode("table")}
                  >
                    <TableOutlined className="w-4 h-4 mr-2" />
                    Table View
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadRooms}
                loading={loading}
                size="large"
              ></Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRoom}
                size="large"
                className="!bg-primary"
              >
                Add New Room
              </Button>
            </div>
          </div>
        </div>

        {stats && (
          <div className="mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Rooms"
                    value={stats.totalRooms}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Available Rooms"
                    value={stats.availableRooms}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Occupied Rooms"
                    value={stats.occupiedRooms}
                    valueStyle={{ color: "#f5222d" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Average Rent"
                    value={stats.averageRent}
                    precision={0}
                    prefix="₹"
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={10}>
              <Search
                placeholder="Search rooms, ID, or number..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>

            <Col xs={24} sm={6} md={5}>
              <Select
                placeholder="All Status"
                allowClear
                value={statusFilter || undefined}
                onChange={handleStatusChange}
                className="w-full"
              >
                <Option value="Available">Available</Option>
                <Option value="Occupied">Occupied</Option>
                <Option value="Maintenance">Maintenance</Option>
                <Option value="Cleaning">Cleaning</Option>
              </Select>
            </Col>

            <Col xs={24} sm={6} md={5}>
              <Select
                placeholder="All Branches"
                allowClear
                value={branchFilter || undefined}
                onChange={handleBranchChange}
                className="w-full"
              >
                {branches.map((branch: any) => (
                  <Option key={branch.id || branch.name} value={branch.name}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Button onClick={handleReset} className="w-full">
                Reset Filters
              </Button>
            </Col>
          </Row>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <Empty
                description="No rooms found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddRoom}
                >
                  Add First Room
                </Button>
              </Empty>
            </div>
          ) : viewMode === "cards" ? (
            <div className="p-6">
              <Row gutter={[24, 24]}>
                {rooms.map((room) => (
                  <Col key={room._id} xs={24} sm={12} lg={8} xl={6}>
                    <RoomCard room={room} />
                  </Col>
                ))}
              </Row>

              {pagination.total > pagination.limit && (
                <div className="mt-6 text-center">
                  <Space>
                    <Button
                      disabled={pagination.current === 1}
                      onClick={() =>
                        handlePaginationChange(pagination.current - 1)
                      }
                    >
                      Previous
                    </Button>
                    <span>
                      Page {pagination.current} of {pagination.pages}
                    </span>
                    <Button
                      disabled={pagination.current === pagination.pages}
                      onClick={() =>
                        handlePaginationChange(pagination.current + 1)
                      }
                    >
                      Next
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          ) : (
            <RoomTable
              rooms={rooms}
              loading={loading}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
            />
          )}
        </div>
      </div>

      <RoomFormModal
        visible={showFormModal}
        onCancel={() => setShowFormModal(false)}
        onSuccess={handleFormSuccess}
        editRoom={editingRoom}
      />
    </Layout>
  );
};

export default Dashboard;
