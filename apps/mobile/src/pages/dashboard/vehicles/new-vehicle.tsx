import { useState } from "react";
import { useMutation } from "react-query";
import { TouchableOpacity, Text, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { VehiclesStackParamList } from "./types";

import vehiclesService from "../../../services/vehicles";
import { IVehicleType, VehicleTypeNames } from "../../../constants";
import { Layout, TextField } from "../../../components";
import { handleError } from "../../../utils/helpers";
import { queryClient } from "../../../services/api";

export const NewVehicle = ({
  navigation,
}: NativeStackScreenProps<VehiclesStackParamList, "NewVehicle">) => {
  const createVehicle = useMutation(vehiclesService.create, {
    onSuccess: () => {
      if (navigation.canGoBack()) {
        queryClient.invalidateQueries(["vehicles"]);
        navigation.goBack();
      }
    },
  });

  const [plateNumber, setPlateNumber] = useState("");
  const [type, setType] = useState<IVehicleType>("SEDAN_2_DOOR");
  const [model, setModel] = useState("");

  return (
    <Layout
      nav={{
        title: "New Vehicle",
        canGoBack: navigation.canGoBack(),
        onBack: navigation.goBack,
      }}
      className="mt-4"
    >
      <TextField
        label="Plate Number"
        value={plateNumber}
        onChangeText={setPlateNumber}
      />
      <TextField label="Model" value={model} onChangeText={setModel} />

      <Text className="text-gray-400 text-xs ml-2 mt-4">Vehicle Type</Text>
      <Picker
        itemStyle={{ color: "white" }}
        mode="dialog"
        selectedValue={type}
        onValueChange={(e) => {
          setType(e);
        }}
      >
        {Object.entries(VehicleTypeNames).map(([key, value]) => (
          <Picker.Item key={key} label={value} value={key} />
        ))}
      </Picker>

      <TouchableOpacity
        className="bg-green-600 self-end mt-6 px-8 py-2 rounded-lg border-2 border-green-500 disabled:opacity-50"
        disabled={createVehicle.isLoading}
        onPress={async () => {
          try {
            await createVehicle.mutateAsync({ plateNumber, model, type });
          } catch (e) {
            const err = handleError(e);
            Alert.alert("Error", err.message);
          }
        }}
      >
        <Text className="text-white">Submit</Text>
      </TouchableOpacity>
    </Layout>
  );
};
