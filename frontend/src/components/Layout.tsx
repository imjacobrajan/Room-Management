import React, { useState } from "react";
import {
  Layout as AntLayout,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Drawer,
  Space,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Bed } from "lucide-react";

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => console.log("Profile clicked"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => console.log("Settings clicked"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: () => console.log("Logout clicked"),
    },
  ];

  return (
    <AntLayout className="min-h-screen">
      <Header className="!bg-white !shadow-lg border-b border-gray-200  sm:px-6 !h-16">
        <div className="flex justify-between items-center h-full px-10">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-primary rounded-lg">
              <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Room Master
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Badge count={3} size="small">
              <Button
                icon={<BellOutlined />}
                className="flex items-center justify-center border border-gray-300 hover:border-primary"
                size="middle"
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size="default"
                  icon={<UserOutlined />}
                  shape="square"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                />
              </div>
            </Dropdown>
          </div>

          <div className="md:hidden">
            <Button
              icon={<MenuOutlined />}
              type="text"
              size="large"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-100"
            />
          </div>
        </div>
      </Header>

      <Drawer
        title={null}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={320}
        className="md:hidden"
        closeIcon={<CloseOutlined className="text-gray-600" />}
        headerStyle={{ padding: 16 }}
        bodyStyle={{ padding: 0 }}
      >
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar
              size="large"
              icon={<UserOutlined />}
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
            />
            <div>
              <div className="text-base font-semibold text-gray-900">
                John Doe
              </div>
              <div className="text-sm text-gray-500">Administrator</div>
            </div>
          </div>
        </div>

        <div className="py-4">
          <div className="px-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BellOutlined className="text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Notifications
                </span>
              </div>
              <Badge count={3} size="small" />
            </div>
          </div>

          <div className="px-6 pt-4 space-y-1">
            {userMenuItems.map((item) => {
              if (item.type === "divider") {
                return (
                  <div
                    key="divider"
                    className="border-b border-gray-100 my-3"
                  />
                );
              }
              return (
                <Button
                  key={item.key}
                  icon={item.icon}
                  type="text"
                  danger={item.danger}
                  onClick={() => {
                    item.onClick?.();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full justify-start h-12 text-left ${
                    item.danger
                      ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                      : "text-gray-700 hover:text-primary hover:bg-gray-50"
                  }`}
                  size="large"
                >
                  <span className="ml-2">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Room Master v1.0.0
          </div>
        </div>
      </Drawer>

      <Content className="bg-gray-50">{children}</Content>
    </AntLayout>
  );
};

export default Layout;
