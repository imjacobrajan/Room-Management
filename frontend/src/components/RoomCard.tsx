import React from "react";
import { Card, Tag, Image } from "antd";
import { UserOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Room } from "../types/room";
import { MapPin, Plus } from "lucide-react";

const { Meta } = Card;

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/room/${room._id}`);
  };

  return (
    <Card
      hoverable
      className="w-full cursor-pointer"
      onClick={handleCardClick}
      cover={
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {room.images && room.images.length > 0 ? (
            <Image
              alt={room.roomName}
              src={room.images[0]}
              className="w-full h-full object-cover"
              preview={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <HomeOutlined className="text-4xl text-gray-400" />
            </div>
          )}
        </div>
      }
    >
      <Meta
        title={
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {room.roomName}
              </h3>
              <p className="text-sm text-gray-500 font-normal">
                {room.roomNumber} • {room.floorName}
              </p>
            </div>
          </div>
        }
        description={
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-normal">
              <div className="flex items-center space-x-2">
                <MapPin className="text-primary" size={16} />
                <span className="">{room.hospitalBranch}</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserOutlined className="!text-primary" size={16} />
                <span>
                  {room.capacity.availableBeds}/{room.capacity.totalBeds} beds
                </span>
              </div>
            </div>

            {room.facilities && room.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {room.facilities.slice(0, 3).map((facility) => (
                  <Tag
                    key={facility}
                    className="!bg-primary/30 !text-primary font-semibold"
                  >
                    {facility}
                  </Tag>
                ))}
                {room.facilities.length > 3 && (
                  <Tag>+{room.facilities.length - 3} more</Tag>
                )}
              </div>
            )}

            <div className="border-b border-gray-200"></div>
            <div className="flex justify-between items-center text-gray-900">
              <div>
                <p className="text-xl font-bold text-primary">
                  ₹{room.rentAmount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">per day</p>
              </div>
              <div className="bg-[#323250] text-white rounded-full p-1 shadow-xs">
                <Plus size={22} />
              </div>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default RoomCard;
