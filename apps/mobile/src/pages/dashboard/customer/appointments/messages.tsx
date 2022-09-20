import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppointmentMessagesStackParamList } from "./types";
import { Layout, TextField } from "../../../../components";
import messageService from "../../../../services/messages";
import { useAuthContext } from "../../../../contexts/auth-context";
import { queryClient } from "../../../../services/api";

export const Messages = ({
  route,
  navigation,
}: NativeStackScreenProps<AppointmentMessagesStackParamList, "Messages">) => {
  const { data: me } = useAuthContext();
  const props = route.params;
  const [content, setContent] = useState("");

  const messages = useQuery(
    ["messages", props.appointmentId],
    (e) =>
      messageService.getAll({
        appointmentId: e.queryKey[1],
      }),
    { refetchInterval: 5000 }
  );

  const send = useMutation(messageService.create);

  return (
    <>
      <Layout
        nav={{
          title: "Conversation",
          canGoBack: navigation.canGoBack(),
          onBack: navigation.goBack,
        }}
      >
        {messages.data?.map((msg) => {
          const isMe = msg.User?.id === me?.id;
          if (!msg.seen) {
            // update
          }

          const classes = isMe
            ? "bg-blue-600 self-end rounded-l-lg rounded-tr-lg"
            : "bg-gray-600 self-start rounded-r-lg rounded-tl-lg";

          return (
            <View key={msg.id} className={`mt-2 p-2 max-w-[80%] ${classes}`}>
              <Text className="text-white">{msg.content}</Text>
            </View>
          );
        })}
      </Layout>

      <KeyboardAvoidingView behavior="position">
        <View className="flex items-center flex-row absolute bottom-0 left-0 right-0 px-4 pb-2">
          <TextField
            containerClassname="flex-1"
            value={content}
            onChangeText={setContent}
          />

          <TouchableOpacity
            className="bg-green-600 border-2 border-green-500 rounded-lg ml-2 p-2"
            onPress={async () => {
              setContent("");
              await send.mutateAsync({
                body: { content },
                params: { appointmentId: props.appointmentId },
              });
              queryClient.invalidateQueries(["messages", props.appointmentId]);
            }}
          >
            <Text className="text-white">Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};
