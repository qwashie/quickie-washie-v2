import { View, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform } from "expo-modules-core";

import { CustomerDashboardParamKeys } from "../pages/dashboard/customer/types";

import { HomeIcon } from "./icon/home-icon";
import { VehicleIcon } from "./icon/vehicle-icon";
import { CalendarIcon } from "./icon/calendar-icon";
import { NotificationIcon } from "./icon/notification-icon";
import { UserIcon } from "./icon/user-icon";

const GetIcon = ({
  name,
  active = false,
}: {
  name: CustomerDashboardParamKeys;
  active: boolean;
}) => {
  switch (name) {
    case CustomerDashboardParamKeys.Home:
      return (
        <HomeIcon
          filled={active}
          styleName={`${active ? "text-green-500" : "text-gray-400"}`}
        />
      );
    case CustomerDashboardParamKeys.Vehicles:
      return (
        <VehicleIcon
          filled={active}
          styleName={`${active ? "text-green-500" : "text-gray-400"}`}
        />
      );
    case CustomerDashboardParamKeys.Appointments:
      return (
        <CalendarIcon
          filled={active}
          styleName={`${active ? "text-green-500" : "text-gray-400"}`}
        />
      );
    case CustomerDashboardParamKeys.Notifications:
      return (
        <NotificationIcon
          filled={active}
          styleName={`${active ? "text-green-500" : "text-gray-400"}`}
        />
      );
    case CustomerDashboardParamKeys.Profile:
      return (
        <UserIcon
          filled={active}
          styleName={`${active ? "text-green-500" : "text-gray-400"}`}
        />
      );
  }
};

export const CustomerTabBar = ({
  insets,
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    <View
      className="flex flex-row items-center justify-evenly rounded-t-3xl bg-gray-800"
      style={{
        paddingBottom: Platform.OS === "android" ? 25 : insets.bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            disabled={isFocused}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            className="pt-6"
          >
            <GetIcon
              name={route.name as CustomerDashboardParamKeys}
              active={isFocused}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
