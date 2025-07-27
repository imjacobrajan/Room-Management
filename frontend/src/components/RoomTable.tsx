import React from "react";
import { Table, Tag, Image } from "antd";
import { useNavigate } from "react-router-dom";
import type { Room } from "../types/room";

interface RoomTableProps {
  rooms: Room[];
  loading: boolean;
  pagination: any;
  onPaginationChange: (page: number, pageSize?: number) => void;
}

const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  loading,
  pagination,
  onPaginationChange,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (record: Room) => {
    navigate(`/room/${record._id}`);
  };

  const columns = [
    {
      title: "Room Details",
      key: "roomDetails",
      render: (record: Room) => (
        <div className="flex items-center space-x-3 ps-5">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {record.images && record.images.length > 0 ? (
              <Image
                src={record.images[0]}
                alt={record.roomName}
                width={48}
                height={48}
                className="object-cover"
                preview={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{record.roomName}</div>
            <div className="text-sm text-gray-500">{record.roomId}</div>
            <div className="text-xs text-gray-400">{record.roomNumber}</div>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: "Location",
      key: "location",
      render: (record: Room) => (
        <div>
          <div className="font-medium">{record.hospitalBranch}</div>
          <div className="text-sm text-gray-500">{record.floorName}</div>
          <div className="text-xs text-gray-400">{record.wingBuilding}</div>
        </div>
      ),
      width: 180,
    },
    {
      title: "Category & Packages",
      key: "category",
      render: (record: Room) => (
        <div>
          <Tag className="mb-1 !bg-primary !text-white">
            {record.roomCategory}
          </Tag>
          {record.packageRates && record.packageRates.length > 0 && (
            <div className="text-xs text-gray-500">
              {record.packageRates.length} package(s)
            </div>
          )}
        </div>
      ),
      width: 150,
    },
    {
      title: "Capacity",
      key: "capacity",
      render: (record: Room) => (
        <div className="">
          <div className="font-semibold">
            {record.capacity.availableBeds}/{record.capacity.totalBeds}
          </div>
          <div className="text-xs text-gray-500">Available/Total</div>
          <div className="text-xs text-gray-400">
            Max: {record.capacity.patientCapacity}
          </div>
        </div>
      ),
      width: 100,
    },
    {
      title: "Package Rates",
      key: "rates",
      render: (record: Room) => (
        <div>
          <div className="font-semibold text-blue-600">
            ₹{record.rentAmount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Base rent</div>
          {record.packageRates && record.packageRates.length > 0 && (
            <div className="text-xs text-gray-400">
              +{record.packageRates.length} packages
            </div>
          )}
        </div>
      ),
      width: 120,
    },
    {
      title: "Status",
      key: "status",
      render: (record: Room) => {
        const getStatusStyles = (status: string) => {
          switch (status) {
            case "Available":
              return {
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                border: "1px solid #16a34a",
              };
            case "Occupied":
              return {
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #dc2626",
              };
            case "Maintenance":
              return {
                backgroundColor: "#fed7aa",
                color: "#ea580c",
                border: "1px solid #ea580c",
              };
            case "Cleaning":
              return {
                backgroundColor: "#dbeafe",
                color: "#2563eb",
                border: "1px solid #2563eb",
              };
            default:
              return {
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                border: "1px solid #d1d5db",
              };
          }
        };

        return (
          <div className="py-1 rounded text-sm text-center">
            <Tag className="mb-1" style={getStatusStyles(record.status)}>
              {record.status}
            </Tag>
          </div>
        );
      },
      width: 100,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rooms}
      loading={loading}
      rowKey="_id"
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        className: "cursor-pointer hover:bg-gray-50",
      })}
      pagination={{
        current: pagination.current,
        total: pagination.total,
        pageSize: pagination.limit || 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} rooms`,
        onChange: onPaginationChange,
        onShowSizeChange: onPaginationChange,
      }}
      scroll={{ x: 1200 }}
      size="middle"
    />
  );
};

export default RoomTable;
