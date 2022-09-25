import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { View, Image, Text, TouchableOpacity, TextInput } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { ImageInput, Layout, TextField } from "../../../../components";
import { useAuthContext } from "../../../../contexts/auth-context";
import authService from "../../../../services/auth";

import { CustomerDashboardParamList } from "../types";
import { PencilSquareIcon } from "../../../../components/icon/pencil-square-icon";
import { getImage } from "../../../../utils/helpers";
import { uploadFile } from "../../../../services/firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CustomerProfileStack, CustomerProfileStackParamList } from "./types";
import { ChangePassword } from "./change-password";

const updateSchema = z.object({
  name: z.string().min(1, { message: "Invalid name" }).max(255).trim(),
  imageUrl: z.string().url(),
  licenseUrl: z.string().url(),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Invalid phone number" })
    .max(10, { message: "Invalid phone number" }),
});

type UpdateSchema = z.infer<typeof updateSchema>;

export const Profile = ({}: BottomTabScreenProps<
  CustomerDashboardParamList,
  "Profile"
>) => {
  return (
    <CustomerProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#111827",
        },
      }}
      initialRouteName="ProfileDetail"
    >
      <CustomerProfileStack.Screen
        name="ProfileDetail"
        component={ProfileDetails}
      />
      <CustomerProfileStack.Screen
        name="ChangePassword"
        component={ChangePassword}
      />
    </CustomerProfileStack.Navigator>
  );
};

const ProfileDetails = ({
  navigation,
}: NativeStackScreenProps<CustomerProfileStackParamList, "ProfileDetail">) => {
  const { logout } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<UpdateSchema>({
    mode: "all",
    resolver: zodResolver(updateSchema),
  });

  const profile = useQuery(["profile"], authService.profile, {
    onSuccess: (data) => {
      setValue("name", data.name);
      setValue("imageUrl", data.photoUrl);
      setValue("licenseUrl", data.licenseUrl);
      setValue("phone", data.phone.replace("+63", ""));
    },
  });

  const updateProfile = useMutation(authService.updateProfile, {
    onSuccess: async () => {
      await profile.refetch();
      setIsEditing(false);
    },
  });

  const isFocused = useIsFocused();

  if (isFocused && profile.isStale) {
    profile.refetch();
  }

  const isUpdating = updateProfile.isLoading || isSubmitting;

  return (
    <Layout
      className="p-6"
      nav={{
        title: "Profile",
        actions: (
          <TouchableOpacity onPress={logout}>
            <Text className="text-red-600">Logout</Text>
          </TouchableOpacity>
        ),
      }}
      onRefresh={profile.refetch}
    >
      <Controller
        control={control}
        name="imageUrl"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            disabled={!isEditing || isUpdating}
            className={`mx-auto h-32 w-32 rounded-full bg-gray-800 border-2 items-center justify-center ${
              isEditing ? "border-gray-700" : "border-transparent"
            }`}
            onPress={async () => {
              const res = await getImage({ aspect: [1, 1] });
              if (res) onChange(res.uri);
            }}
          >
            {!value ? (
              <PencilSquareIcon styleName="text-blue-600" />
            ) : (
              <Image
                className="h-full w-full rounded-full"
                source={{ uri: value }}
              />
            )}
          </TouchableOpacity>
        )}
      />

      <TextField
        editable={false}
        keyboardType="email-address"
        label="Email"
        value={profile.data?.email}
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value, ...rest } }) => (
          <TextField
            {...rest}
            editable={isEditing || isUpdating}
            label="Full name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value, ...rest } }) => (
          <View className="mt-4">
            <Text className="text-gray-400 text-xs ml-2">Phone *</Text>
            <View
              className={`flex flex-row py-3 items-center bg-gray-800 mt-1 rounded-lg border-2 ${
                isEditing || isUpdating
                  ? "opacity-100 border-gray-700"
                  : "opacity-60 border-transparent"
              }`}
            >
              <Text className="text-gray-300 pl-4">+63</Text>
              <TextInput
                {...rest}
                editable={isEditing || isUpdating}
                maxLength={10}
                keyboardType="numeric"
                placeholderTextColor="#71717a"
                className="flex-1 pl-1 pr-4 text-white"
                value={value}
                onChangeText={onChange}
              />
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="licenseUrl"
        render={({ field: { onChange, value } }) => (
          <ImageInput
            editable={isEditing || isUpdating}
            label="Drivers license"
            uri={value}
            callback={(e) => {
              if (e) onChange(e.uri);
            }}
          />
        )}
      />

      <View className="flex flex-row items-center justify-between mt-6">
        <TouchableOpacity
          disabled={isUpdating}
          className="bg-green-600 px-8 py-2 rounded-lg border-2 border-green-500 disabled:opacity-50"
          onPress={async () => {
            if (isEditing && profile.data) {
              await handleSubmit(
                async ({ imageUrl, licenseUrl, name, phone }) => {
                  let imageDownloadUrl: string | null = null;
                  if (imageUrl !== profile.data.photoUrl) {
                    imageDownloadUrl = await uploadFile(
                      imageUrl,
                      profile.data.email
                    );
                  }

                  let licenseDownloadUrl: string | null = null;
                  if (licenseUrl !== profile.data.licenseUrl) {
                    licenseDownloadUrl = await uploadFile(
                      licenseUrl,
                      profile.data.email
                    );
                  }

                  return await updateProfile.mutateAsync({
                    name,
                    phone: `+63${phone}`,
                    licenseUrl: licenseDownloadUrl ?? undefined,
                    imageUrl: imageDownloadUrl ?? undefined,
                  });
                }
              )();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text className="text-white">
            {isUpdating ? "Updating..." : isEditing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            onPress={() => {
              setIsEditing(false);
              reset();
            }}
          >
            <Text className="text-red-600">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        className="mt-4"
        onPress={() => {
          navigation.navigate("ChangePassword");
        }}
      >
        <Text className="text-blue-600">Change Password</Text>
      </TouchableOpacity>
    </Layout>
  );
};
